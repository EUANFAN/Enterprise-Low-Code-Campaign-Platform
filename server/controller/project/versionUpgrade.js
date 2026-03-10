/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:01:40
 */
const _ = require('lodash');
const app = global.app;
const db = app.utils.mongo.db();
const ObjectId = app.utils.mongo.pmongo.ObjectId;
const { getAllChooseResult } = require('../api/utils/AllChooseUtils');
const { compact } = require('lodash');
let cache = {};

async function checkLatestVersion(type, versionId) {
  let widget;
  if (cache[type]) {
    widget = cache[type];
  } else {
    widget = await db.components.findOne({
      type: type,
    });
    if (!widget) {
      return {
        state: false,
        msg: '组件未找到',
      };
    }
    cache[type] = widget;
  }

  let lastestVersion = widget.lastest;
  let data = _.extend(
    {},
    {
      _id: widget._id,
      type: widget.type,
      name: widget.name,
      category: widget.category,
      lastVersionId: widget.version,
      lastestVersion: lastestVersion,
    }
  );

  let state = false;
  if (versionId && versionId != lastestVersion.version) {
    state = true;
    let msg = '版本不一致 versionId != data.lastVersionId';
    return {
      state: state,
      msg: msg,
      name: widget.name,
      type: type,
      category: widget.category,
      historys: widget.historys.map((component) => component.version),
      versionId: versionId,
      data: JSON.stringify(data),
    };
  } else if (!versionId) {
    return lastestVersion;
  }
  return 0;
}
function checkWidgets(pages, promiseArray) {
  pages.forEach(function (page) {
    const componentArr = compact([].concat(page.widgets, page.triggers));
    checkWidgetsAndTriggers(componentArr, promiseArray);
  });
  return promiseArray;
}
// 检测widget和trigger的版本
function checkWidgetsAndTriggers(componentArr, promiseArray) {
  (componentArr || []).forEach(function (widget) {
    let type = widget.type;
    let versionId = widget.version;
    if (versionId) {
      let promise = checkLatestVersion(type, versionId);
      promiseArray.push(promise);
    }
    if (widget.layers) {
      checkWidgets(widget.layers, promiseArray);
    }
    if (widget.triggers && widget.triggers.length > 0) {
      checkWidgetsAndTriggers(widget.triggers, promiseArray);
    }
    if (widget) {
      Object.values(widget).forEach((value) => {
        if (value && value.clazz == 'trigger' && value.category == 'action') {
          checkWidgetsAndTriggers([value], promiseArray);
        }
      });
    }
  });
}
function changeWidgetVersion(pages, callback) {
  pages.forEach(function (page) {
    const componentArr = compact([].concat(page.widgets, page.triggers));
    (componentArr || []).forEach(function (widget) {
      callback(widget);
    });
  });
}
// 用来检测项目组件
/**
 * 1. 根据项目获取当前组件的 type, versionId
 * 2. 检测当前组件的versionId 和当前 组件进行比较
 * @param  {[type]} projectId [description]
 * @return {[type]}           [description]
 */
function checkProjectWidgets(projectId) {
  return new Promise(async function (resolve) {
    let widgetList = [];
    let project = await db.projects.findOne({
      _id: ObjectId(projectId),
    });
    if (!project) {
      return resolve(widgetList);
    }
    let pages = project.revisionData.pages || [];
    let promiseArray = [];
    promiseArray = checkWidgets(pages, promiseArray);
    Promise.all(promiseArray).then(function (results) {
      results || (results = []);
      for (let i = 0; i < results.length; i++) {
        let rs = results[i];
        if (rs) widgetList.push(rs);
      }
      resolve(widgetList);
    });
  });
}

/**
 * 更新项目组件
 * @param  {[type]} projectId [项目id]
 * @param  {[type]} widgets   [需要更新的组件]
 * @return {[type]}           [description]
 */

function upgradeProjectWidgets(projectId, widgets, widgetType) {
  return new Promise(async function (resolve) {
    let widgetList = [];
    let project = await db.projects.findOne({
      _id: ObjectId(projectId),
    });
    if (!project) {
      return resolve(widgetList);
    }
    // 更新用户表的组件
    let dbQuery = {
      userId: project.ownerId,
    };

    let users = await db.users.findOne(dbQuery);
    let userComponents = users.components;
    let promiseArray = [];
    // 个人中心组件升级
    if (widgets.length) {
      let revisionData = project.revisionData;
      let pages = revisionData.pages || [];
      let callback = (widget) => {
        let type = widget.type;
        let versionId = widget.version;
        if (versionId) {
          // 根据类型查找
          let targetVersionInfo = _.find(widgets, {
            type: type,
          });
          if (targetVersionInfo) {
            // 更新项目组件versionId
            widget['version'] = targetVersionInfo.version;
            if (userComponents) {
              userComponents[type] = targetVersionInfo.version;
            }
          }
        }
        if (widget.layers) {
          changeWidgetVersion(widget.layers, callback);
        }
        if (widget.triggers && widget.triggers.length > 0) {
          widget.triggers.forEach((item) => callback(item));
        }
        if (widget) {
          Object.values(widget).forEach((value) => {
            if (
              value &&
              value.clazz == 'trigger' &&
              value.category == 'action'
            ) {
              callback(value);
            }
          });
        }
      };
      changeWidgetVersion(pages, callback);
      let newRevisionData = Object.assign(revisionData, {
        pages: pages,
      });
      let newProject = Object.assign(project, {
        revisionData: newRevisionData,
      });
      let promise = db.projects.update(
        {
          _id: ObjectId(projectId),
        },
        {
          $set: newProject,
        }
      );
      let userPromise = db.users.update(dbQuery, {
        $set: {
          components: userComponents,
        },
      });
      promiseArray.push(promise);
      promiseArray.push(userPromise);
    } else if (widgetType) {
      let widget = await checkLatestVersion(widgetType);
      userComponents[widgetType] = widget.version;
      let userPromise = db.users.update(dbQuery, {
        $set: {
          components: userComponents,
        },
      });
      promiseArray.push(userPromise);
    }
    // 更新用户组件完成
    Promise.all(promiseArray).then(function (results) {
      resolve(results);
    });
  });
}

function updateThemeWidgets(themeId, widgetType) {
  return new Promise(async function (resolve) {
    let theme = await db.themes.findOne({
      _id: ObjectId(themeId),
    });
    if (!theme) {
      return resolve(null);
    }
    let lastWidget = await checkLatestVersion(widgetType);
    let revisionData = theme.revisionData || {};
    let widgets = revisionData.widgets || [];
    // 更新
    _.each(widgets, async function (widget) {
      let type = widget.type;
      if (type === widgetType) {
        widget['version'] = lastWidget.version;
      }
    });
    revisionData.widgets = widgets;
    await db.themes.update(
      {
        _id: ObjectId(themeId),
      },
      {
        $set: {
          revisionData: revisionData,
        },
      }
    );
    resolve('success');
  });
}

module.exports.get = async function (ctx, next) {
  cache = {};
  const {
    query: {
      id: requestIds,
      type: requestType,
      widget: widgetType,
      isTheme: isTheme,
      updateWidgets: updateWidgets,
      noSelectIds,
      chooseAll,
      roleId,
      folderId,
    },
  } = ctx;
  if (!requestIds) {
    return ctx.data({});
  }
  let ids = [];
  // 用户选择全选
  if (chooseAll === 'true') {
    let results = await getAllChooseResult(
      ctx,
      noSelectIds,
      roleId,
      folderId,
      'projects'
    );
    let hasFolder = results.some((project) => {
      return project.isFolder;
    });
    if (hasFolder) {
      return ctx.data({
        stat: -1,
        message: '批量升级仅支持升级文件',
      });
    } else {
      ids = results.map((item) => item._id);
    }
  } else {
    ids = requestIds.split(/,/);
  }
  // 更新分两种情况，project已使用的组件和未使用的组件
  // 已使用的组件需要将project表内对用组件版本号改变
  const type = requestType || 'project';
  let projectWidgets = {};
  if (!isTheme) {
    for (let i = 0; i < ids.length; i++) {
      let projectId = ids[i];
      // 批量更新组件时，不需要去检查更新的版本
      if (type === 'upgrade') {
        // 根据 updateWidgets 去对应项目里找到组件，取更新为最新版本
        const needUpdateWidgets = JSON.parse(updateWidgets);
        await upgradeProjectWidgets(
          projectId,
          Object.keys(needUpdateWidgets).map((type) => ({
            type,
            version: needUpdateWidgets[type],
          })),
          widgetType
        );
        await ctx.log(projectId);
      } else {
        let widgets = await checkProjectWidgets(projectId);
        if (widgets.length && !widgetType) {
          projectWidgets[projectId] = widgets;
        }
      }
    }
  } else {
    await updateThemeWidgets(requestIds, widgetType);
  }
  ctx.data(projectWidgets);
  await next();
};

module.exports.get.auth = true;
