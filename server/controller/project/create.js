const { createProjectFromPage } = require('./utils');
const app = global.app;
const { DEFAULT_POSTER } = require('../../constants');
/**
 * 为外部用户和内部用户创建项目
 */
const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;

/**
 * @api {post} /project/create 创建项目
 * @aipName    CreateProject
 * @apiGroup   Project
 *
 * @apiDescription
 * 创建项目。除了 H5 来的请求之外，请求也有可能从活动运营配置系统。从活动配置系统来的
 *
 * @apiParam {String}   name          项目名
 * @apiParam {String} themeId        模板ID
 * @apiParam {String}   source        登录来源：admin或者造物神
 * @apiParam {String}  【origin]       创建项目来源：例如乐高、abTest平台等等
 * @apiParam {String}   [userId]      [运营配置系统]用户 ID
 * @apiParam {String}   [appId]       [运营配置系统]应用 ID，目前不清楚是做什么的
 * @apiParam {String}   [descUrl]     [运营配置系统]接口描述 URL
 * @apiParam {String}   [dataUrl]     [运营配置系统]接口资料 URL
 */
module.exports.post = async function (ctx) {
  const {
    request: { body },
  } = ctx;
  const { userId, userDeptId } = await ctx.getUserInfo();
  const {
    layout,
    name = '未命名项目',
    type,
    origin,
    themeId,
    userId: bodyUserId,
  } = body;
  // 第三方配置信息
  let thirdPartyConfig = {};
  // 如果是乐高平台，保存配置信息
  if (origin == 'mall') {
    thirdPartyConfig['channel_info_id'] = body.channel_info_id;
    thirdPartyConfig['channel_id'] = body.channel_id;
    thirdPartyConfig['column_id'] = body.column_id;
    thirdPartyConfig['showTitle'] = body.show;
    thirdPartyConfig['name'] = body.name;
    thirdPartyConfig['type'] = body.type || 1; // 1 常规 2 支付成功页
  }

  const targetName = name.trim();

  if (!targetName) {
    ctx.data(
      null,
      'invalid_params',
      'Name must not be empty or white space only.'
    );
    return;
  }

  const now = new Date();

  // 如果没有 projectId 则创建项目
  if (!body.projectId) {
    let projectId = ObjectId();
    let logId = ObjectId();

    let triggers = [
      {
        type: 'SendLog',
        event: 'enter',
        clazz: 'trigger',
        client: ['jzh', 'wx', 'other'],
        data: {
          carryUrlQuery: false,
          clickid: '',
          options: '',
        },
        platform: ['iOS', 'android', 'other'],
      },
    ];
    // 根据模板ID创建项目
    let pages, themeGroupId, themeObjectId, projectData;

    if (themeId) {
      // 从模板创建项目
      themeObjectId = ObjectId(themeId);
      let theme = await db.themes.findOne(
        { _id: themeObjectId },
        { deleted: false }
      );
      if (theme) {
        themeGroupId = ObjectId(theme.themeGroupId);
        projectData = createProjectFromPage({
          ...theme.revisionData,
          themeId: themeObjectId,
        });
      } else {
        // 如果 themeId非法，进行提示
        ctx.data({}, -1, '模板ID不合法');
        return;
      }
    } else {
      // 创建项目
      pages = [{ widgets: [], triggers: [...triggers] }];
      projectData = createProjectFromPage({
        title: '示例公司',
        layout: layout || 'normal',
        useData: false,
        pages: pages,
      });
    }

    const logInstance = {
      _id: logId,
      args: {},
      action: 'update',
      content: projectData,
      createdAt: now,
      itemId: projectId,
      itemType: 'project',
      performer: userId,
      ownerId: userId,
      name: name || '未命名项目',
      version: '2.0',
      poster: DEFAULT_POSTER,
    };

    const revisionInstance = await db.logs.insert(logInstance);
    let data = {
      _id: projectId,
      name: targetName,
      type: type || 'combine',
      ownerId: userId || bodyUserId,
      createdAt: now,
      pagepv: 0,
      pageuv: 0,
      sharepv: 0,
      shareuv: 0,
      lastModified: now,
      deleted: false,
      editable: true,
      origin: origin,
      thirdPartyConfig: thirdPartyConfig,
      themeGroupId: themeGroupId,
      revisionId: revisionInstance._id,
      revisionData: projectData,
      parentId: null,
      roleId: null,
      config: {},
      status: 0,
      poster: DEFAULT_POSTER,
      userDeptId: userDeptId ? ObjectId(userDeptId) : null,
      client: ['jzh', 'wx', 'other'],
      version: '3.0',
    };

    let result = await db.projects.save(data);
    // 调用创建hybrid创建接口
    ctx.data(result);
  }
  // 如果存在，则进行二次编辑
  if (body.projectId) {
    // 最终覆盖数据
    const dataToSet = { thirdPartyConfig };
    // 查找已存在的项目
    const _project = await db.projects.findOne({
      _id: ObjectId(body.projectId),
    });

    if (!_project) {
      // 项目不存在
      ctx.data(null, -1, 'projectId not found.');
      return false;
    }

    // 对比前后theme是否变更
    if (
      !_project.revisionData.themeId ||
      _project.revisionData.themeId.toString() !== themeId
    ) {
      // theme变更 使用theme数据覆盖原数据
      const theme = await findTheme(themeId);
      dataToSet.revisionData = {
        ...theme.revisionData,
        themeId,
      };
    }

    const result = await db.projects.update(
      { _id: ObjectId(body.projectId) },
      { $set: dataToSet }
    );
    if (!result.errno) {
      ctx.data(
        {
          _id: body.projectId,
        },
        0,
        ''
      );
    }
  }
};

async function findTheme(themeId) {
  if (!themeId) return false;
  const themeObjectId = ObjectId(themeId);
  const theme = await db.themes.findOne(
    { _id: themeObjectId },
    { id: false, userId: false }
  );

  let result = theme ? theme : false;
  return result;
}

module.exports.post.auth = true;
