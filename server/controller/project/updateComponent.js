/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:01:42
 */
const { getAllChooseResult } = require('../api/utils/AllChooseUtils');
const { compact } = require('lodash');
const validateRoleLimit = require('../api/utils/validateRoleLimit');
const { mongo } = global.app.utils;
const db = mongo.db();
const { ObjectId } = mongo.pmongo;

function changeWidgetData(pages, callback) {
  pages.forEach(function (page) {
    const componentArr = compact([].concat(page.widgets, page.triggers));
    (componentArr || []).forEach(function (widget) {
      callback(widget);
    });
  });
}

async function upgradeProjectWidgetsData(projectId, component) {
  let project = await db.projects.findOne({
    _id: projectId,
  });
  if (!project) {
    return;
  }
  let revisionData = project.revisionData;
  let pages = revisionData.pages || [];
  let callback = (widget) => {
    // UI组件
    const isWidget =
      widget.category === 'widget' && widget.type == component.type;
    const isTrigger =
      widget.clazz === 'trigger' &&
      widget.event == component.event &&
      widget.type == component.type;
    if (isWidget || isTrigger) {
      Object.assign(widget.data, component.data);
    }
    if (widget.layers) {
      changeWidgetData(widget.layers, callback);
    }
    if (widget.triggers && widget.triggers.length > 0) {
      widget.triggers.forEach((item) => callback(item));
    }
  };

  changeWidgetData(pages, callback);
  let newRevisionData = Object.assign(revisionData, {
    pages: pages,
  });
  let newProject = Object.assign(project, {
    revisionData: newRevisionData,
  });
  return db.projects.update(
    {
      _id: projectId,
    },
    {
      $set: newProject,
    }
  );
}

module.exports.post = async function (ctx) {
  let {
    request: {
      body: { id, chooseAll, noSelectIds, roleId, folderId, targetComponent },
    },
  } = ctx;
  let ids = [];
  targetComponent = JSON.parse(targetComponent);
  // 用户选择全选
  if (chooseAll === 'true') {
    let results = await getAllChooseResult(
      ctx,
      noSelectIds,
      roleId,
      folderId,
      'projects'
    );
    ids = results.map((item) => item._id);
  } else {
    ids = id.split(/,/);
  }
  ids = ids.map((item) => {
    if (item) {
      return ObjectId(item);
    }
  });
  // 保存项目角色权限校验
  const projectList = await db.projects.find({
    _id: { $in: ids },
  });
  try {
    for (let i = 0; i < projectList.length; i++) {
      const { ownerId, userDeptId, partner } = projectList[i];
      await validateRoleLimit(ctx, {
        partner,
        ownerId,
        userDeptId,
        permissionKey: 'saveProject',
        permissionGroupKey: 'managerAllProject',
      });
    }
  } catch (error) {
    return;
  }
  await Promise.all(
    ids.map((projectId) => {
      return upgradeProjectWidgetsData(projectId, targetComponent);
    })
  ).then((res) => {
    const success = res.every((item) => {
      return item.ok == 1;
    });
    return ctx.data({
      stat: success ? 1 : 0,
    });
  });
};

module.exports.post.auth = true;
