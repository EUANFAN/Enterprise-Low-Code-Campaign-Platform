const Router = require('koa-router');
const md5 = require('md5');
const request = require('request');
const moment = require('moment');
const { InvalidParameterError } = require('../../errors');
const { createProject } = require('./utils/ProjectUtils');
const { DEFAULT_POSTER } = require('../../constants');
const helper = require('../project/helper');
const qs = require('qs');
const app = global.app;
const { mongo, urls, uploader } = app.utils;
const H5_URL = urls.H5_URL;
const db = mongo.db();
const { ObjectId } = mongo.pmongo;
const router = new Router({ prefix: '/3rd' });

let handerRuleUrl = function (remoteUrl, ruleId, env) {
  if (remoteUrl) {
    const url = new URL(remoteUrl);
    url.searchParams.set('ruleId', ruleId);
    if (env) {
      url.searchParams.set('type', env);
    }
    return url.href;
  }
};

async function getRuleData(type, ruleId) {
  return new Promise(function (resolve) {
    request(
      {
        url: 'https://booster.xueersi.com/h5EditStation/ConfigCollection/GetConfig',
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        form: qs.stringify({
          type,
          ruleId,
        }),
        json: true,
      },
      (error, response, body) => {
        try {
          resolve(body);
        } catch (e) {
          resolve(false);
        }
      }
    );
  });
}

async function setConfigData(options) {
  return new Promise(async (resolve) => {
    let { sGroupId: newsGroupId, ruleId, type } = options;
    if (!newsGroupId) {
      // 如果sGroupId不存在，先去后端的get接口里面找一次，如果后端接口有，用后端接口提供的，若后端接口没有，则用默认的0，让后端接口去生成
      let res = await getRuleData(type, ruleId);
      if (res.code == 0) {
        const { sGroupId } = res.data;
        newsGroupId = sGroupId || 0;
      } else {
        console.log('error:', res);
      }
    }

    const sign = md5(
      `${newsGroupId}-${ruleId}-ADY3110-${moment().format('YYYY-MM-DD')}`
    );
    options['sign'] = sign;
    options['productId'] = ruleId;
    options['sGroupId'] = newsGroupId;
    options['business'] = options['business']
      ? options['business']
      : 'clientView';
    request(
      {
        url: 'https://booster.xueersi.com/h5EditStationAdmin/ConfigCollection/AddConfig',
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        form: qs.stringify(options),
        json: true,
      },
      (error, response, body) => {
        try {
          resolve(body);
        } catch (e) {
          resolve(false);
        }
      }
    );
  });
}

const getEditorpageByProjectId = (projectId) => {
  return `${urls.endpoint()}/editor/${projectId}`;
};
// 生成create 的log 记录
async function createLog(newRuleId, userId, name) {
  const newLogId = ObjectId();
  const now = new Date();
  const logInstance = {
    _id: newLogId,
    args: {},
    action: 'create',
    content: null,
    createdAt: now,
    itemId: newRuleId,
    itemType: 'rule',
    performer: userId,
    version: '2.0',
    ownerId: userId,
    name: name || '未命名项目',
    poster: DEFAULT_POSTER,
  };

  await db.logs.insert(logInstance);
  return newLogId;
}

/**
 * @api {post} /3rd/projects/ 第三方项目创建
 * @aipName    ThirdPartyCreateProject
 * @apiGroup   ThirdParty
 *
 * @apiDescription
 * 创建项目。本接口与项目创建分开已达到更好的弹性
 *
 * @apiParam {String}  appId        第三方服务 ID，服务号为 9487。每个第三方服务对应到一个群
 *                                  组，项目会默认加载群组底下。
 * @apiParam {String}  userId       用户名称
 * @apiParam {String}  ticket       用户登入 Ticket
 * @apiParam {?String} name         创建项目名
 * @apiParam {?String} dataUrl      若项目需使用第三方接口获取数据，此项必填
 * @apiParam {?String} descUrl      第三方接口获取数据的数据格式，若 dataUrl 点了则此项必填
 * @apiParam {?String} activityId   第三方服务的子分类（如运营活动的10月车主节群组）。若提供，
 *                                  则项目将创建在群组中该子分组的文件夹内。若创建时还没有該文
 *                                  件夹，则会在主动创建
 * @apiParam {?String} activityName 创建子分组文件夹时复写默认名称
 *
 * @apiSuccess (200) {Number} errno           Error number or string
 * @apiSuccess (200) {String} msg             Message or error message
 * @apiSuccess (200) {Object} data
 * @apiSuccess (200) {String} data.projectId  项目 ID
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {
 *              "projectId": "asdfasdfnb31adsfasdf"
 *           }
 *       }
 *
 */
router.post('/projects', async function (ctx) {
  const {
    request: {
      body: { dataUrl, descUrl, appId = '', name, userId },
    },
  } = ctx;
  let parentId = null;

  if (!dataUrl !== !descUrl) {
    throw new InvalidParameterError('接口数据与接口描述链接需要同时设置');
  }

  const targetInfo = app.config.get('mongo').appIdInfo[appId];

  if (!targetInfo) {
    throw new InvalidParameterError(`提供的 AppId 没有创建权限: ${appId}`);
  }

  const { project } = await createProject(userId, {
    name,
    roleId: ObjectId(targetInfo.id),
    parentId,
    config: { appId },
    client: ['jzh', 'wx', 'wxmini', 'other'],
  });
  await helper.publish.bind(ctx)(project, project._id);

  ctx.data({
    projectId: project._id,
    onlineUrl: urls.onlineUrl(project._id, project.revisionData),
    editorUrl: getEditorpageByProjectId(project._id),
  });
});

/**
 * 建站工具创建项目时使用，h5表示为编辑平台模板，模板id为编辑平台模板id，
 * other为外部链接的规则项目，模板id为开发维护的规则项目，作为基础模板的项目，包含组件和外部链接及业务类型的信息
 * 外部组件创建时，需要基于规则去生成sGroupId
 * */

router.post('/buildtool/create', async (ctx) => {
  const {
    request: {
      body: {
        themeId,
        name = '未命名项目',
        type = 'h5', // h5 或者 other,  h5 为编辑平台的模板，other为外部链接的项目
      },
    },
  } = ctx;
  const { userId, userDeptId } = await ctx.getUserInfo();

  if (themeId) {
    let themeRuleId, theme;

    let onlineUrl = '';
    if (type == 'h5') {
      theme = await db.themes.findOne({ _id: ObjectId(themeId) });
      if (!theme) {
        // 文件夹不存在
        ctx.data(null, -1, '模板ID不存在.');
        return false;
      }
      // 拼接远程地址
      let category = uploader.getCategory();
      if (category) {
        onlineUrl = `${H5_URL}/${category}/${themeId}.html`;
      } else {
        onlineUrl = `${H5_URL}/${themeId}.html`;
      }
      themeRuleId = theme.revisionData.ruleId;
    } else if (type == 'other') {
      const baseRule = await db.projects.findOne({ _id: ObjectId(themeId) });
      if (!baseRule) {
        ctx.data(null, -1, '模板ID不存在.');
        return false;
      }
      onlineUrl = baseRule.remoteUrl;
      themeRuleId = themeId;
    } else {
      ctx.data(null, -1, '模板类型不存在');
      return false;
    }

    let ruleProject = await db.projects.findOne({ _id: ObjectId(themeRuleId) });

    let newRuleId = ObjectId();
    // 清理之前的项目修改信息
    delete ruleProject.lastPublished;
    const newLogId = await createLog(newRuleId, userId, name);

    Object.assign(ruleProject, {
      _id: newRuleId,
      isThemeRule: null,
      name: name,
      roleId: null,
      createdAt: new Date(),
      lastModified: new Date(),
      lastPublished: null,
      revisionId: newLogId,
      ownerId: userId,
      userDeptId,
      status: 0,
      remoteUrl: onlineUrl,
    });
    let createResult = await db.projects.save(ruleProject);

    if (createResult) {
      const configResult = await setConfigData({
        activityName: name,
        member: createResult.ownerId,
        sGroupId: 0,
        ruleId: ObjectId.toString(createResult._id),
        config: JSON.stringify(createResult.revisionData),
        type: 'gray',
        business: createResult.business || 'clientView',
      });
      if (configResult.code != 0) {
        ctx.data({}, -1, '初始化规则失败');
        return;
      }
      ctx.data({ _id: newRuleId, themeId, name, type });
    } else {
      ctx.data({}, -1, '创建失败');
    }
  } else {
    ctx.data({}, -1, '模板ID不能为空');
  }
});

router.get('/buildtool/getUrl', async (ctx) => {
  const {
    query: {
      themeId,
      ruleId,
      type = 'h5', // h5 或者 other,  h5 为编辑平台的模板，other为外部链接的项目
    },
  } = ctx;
  if (themeId && ruleId && type) {
    let onlineUrl = '';
    if (type == 'h5') {
      // 拼接远程地址
      let category = uploader.getCategory();
      if (category) {
        onlineUrl = `${H5_URL}/${category}/${themeId}.html?ruleId=${ruleId}`;
      } else {
        onlineUrl = `${H5_URL}/${themeId}.html?ruleId=${ruleId}`;
      }
      ctx.data({ url: onlineUrl });
    } else {
      const baseRule = await db.projects.findOne({ _id: ObjectId(ruleId) });
      if (baseRule) {
        const remoteUrl = baseRule.remoteUrl;
        onlineUrl = handerRuleUrl(remoteUrl, ruleId, false);
        ctx.data({ url: onlineUrl });
      } else {
        ctx.data({}, -1, '参数错误');
      }
    }
  } else {
    ctx.data({}, -1, '参数缺失');
  }
});

module.exports = router;
