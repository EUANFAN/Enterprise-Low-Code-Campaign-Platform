// import { forEachNode } from './helper/Traverser';
const {
    getDiffCompTimes,
    getUsedCompTimes
  } = require('../../utils/usedCompTimes');
  const validateRoleLimit = require('../api/utils/validateRoleLimit');
  const app = global.app;
  let db = app.utils.mongo.db();
  let ObjectId = app.utils.mongo.pmongo.ObjectId;
  const config = app.config;
  const sso = config.get('sso');
  let urls = sso.urls;
  const { screenShot } = app.utils;
  function isArrayAndNotEmpty(arr) {
    return toString.call(arr) === '[object Array]' && arr.length;
  }

  /**
   * 函数作用：在 互相包含的 widgets 和 layers 中递归检测是否存在 widgets.type == Form
   *
   * 过程
   * 1、检测当前数组下的所有item对象中是否存在 widgets，没有 widgets 则返回false
   * 2、如果存在widgets，则对widgets做遍历，返回是否符合条件的
   * 3、如果没有符合条件的，则对widgets做是否存在layer的检测，如果存在layer，则递归该layer
   **/
  function arrHasWidgetForm(arr) {
    // 第一次的arr是pages，以后的递归调用是layers
    return arr.some(i => {
      if (!isArrayAndNotEmpty(i.widgets)) return;
      return i.widgets.some(item => {
        if (item.type === 'Form') return true;
        if (isArrayAndNotEmpty(item.layers)) return arrHasWidgetForm(item.layers);
      });
    });
  }
  // 更新项目时，更新文件夹的最新修改时间
  async function updateFolderlastModified(projectId) {
    const project = await db.projects.findOne({ _id: ObjectId(projectId) });
    if (project.parentId) {
      await undateParent(project.parentId);
    }
  }
let undateParent = async function (parentId) {
    const parent = await db.projects.findOne({ _id: parentId });
    await db.projects.update({ _id: parentId }, {
      $set: {
        lastModified: new Date()
      }
    });
    if (parent.parentId) {
      return await undateParent(parent.parentId);
    }
};
  let updateFun = async function (ctx, id, body, action) {
    let dbQuery = { _id: ObjectId(id) };
    let projectResult, abConfig, rulesConfig;

    if (body.project) {
      let projectData = JSON.parse(body.project);
      if (typeof projectData.runingEndTime != 'string') {
        projectData.runingEndTime = new Date(projectData.runingEndTime);
      }
      if (typeof projectData.runingStartTime != 'string') {
        projectData.runingStartTime = new Date(projectData.runingStartTime);
      }
      if (projectData.editorType == 'project') {
        // 项目保存权限角色校验
        try {
          const { ownerId, userDeptId, partner } = await db.projects.findOne({ _id: ObjectId(id) });
          if(action == 'update') {
            await validateRoleLimit(ctx, { partner, ownerId, userDeptId, permissionKey: 'saveProject', permissionGroupKey: 'managerAllProject' });
          }else if(action.includes('publish')) {
            await validateRoleLimit(ctx, { partner, ownerId, userDeptId, permissionKey: 'publishProject', permissionGroupKey: 'managerAllProject' });
          }
        } catch (error) { throw new Error('项目权限角色校验失败'); }
        abConfig = projectData.abConfig;
        rulesConfig = projectData.rulesConfig;
      }
      delete projectData._id;
      const projectInstance = projectData.editorType == 'project' ? await db.projects.findOne(dbQuery) : await db.themes.findOne(dbQuery);
      // 检测pages组件中是否存在form，用以决定在project list 中是否显示 收集 选项
      if (!projectInstance.config) {
        projectInstance.config = {};
      }

      if (!projectInstance.config.hasFormWidget) {
        projectInstance.config.hasFormWidget = isArrayAndNotEmpty(projectData.pages) ?
          arrHasWidgetForm(projectData.pages) :
          false;
      }
      const { themeId } = projectData;
      projectData.themeId = themeId ? ObjectId(themeId) : undefined;
      if (projectData.editorType == 'project') {
        // 如果是线上、测试发布，需要新增当前项目中使用到的组件，线上使用的次数
        // 1.确认是否是线上、测试发布
        if (action === 'publish' || action === 'online_test_publish') {
          // 2.确认当前项目是否是已经上线过的项目，如果是上线过的，那就是增量更新；如果不是，就是全量更新
          const { lastPublished = null, revisionData } = await db.projects.findOne({ _id: ObjectId(id) });
          // 3.统计出各个组件使用的需要增加的次数
          let diff = null;
          // 增量
          if (lastPublished) {
            diff = getDiffCompTimes(revisionData, projectData);
          } else {
            // 全量
            diff = getUsedCompTimes(projectData);
          }
          // 4.更新components表数据
          if (diff.length > 0) {
            for (const item of diff) {
              await db.components.update({
                type: item.type
              }, {
                $inc: {
                  timesUsedOnline: item.timesUsedOnline,
                }
              });
            }
          }

        }
        await db.projects.update(dbQuery, {
          $set: {
            config: projectInstance.config,
            revisionData: projectData,
            lastModified: new Date(),
            abConfig: abConfig || null,
            rulesConfig: rulesConfig || null
          }
        });
        projectResult = await db.projects.findOne({ _id: ObjectId(id) });
        // 此处是为了兼容乐高项目在没有发布按钮是，保存的权限包中有预览截图的配置项
        if (projectData['screenshot']) {
          let url = `${urls.themePreview}?id=${id}`;
          screenShot(url, ObjectId(id));
        }
        await updateFolderlastModified(id);
        await ctx.log(id, action);
      } else {
        await db.themes.update(dbQuery, {
          $set: {
            config: projectInstance.config,
            revisionData: projectData,
            lastModified: new Date(),
            status: 1
          }
        });
        projectResult = await db.themes.findOne({ _id: ObjectId(id) });
        if (projectResult.themeGroupId) {
          await db.themeGroups.update({ _id: projectResult.themeGroupId }, {
            $set: {
              'metadata.defaultThemeId': projectResult._id,
              'metadata.defaultThemeData': projectResult.revisionData,
            }
          });
        }
        // let url = `${urls.themePreview}?id=${id}&isTheme=true`;
        // screenShot(url, ObjectId(id), true, projectResult);

        await ctx.log(id, action);
      }
    }
    return projectResult;
  };

  module.exports.update = updateFun;
  // 1. 支持修改项目内容
  // 2. 修改项目所属者
  // 3. 修改项目名称
  module.exports.post = async function (ctx) {
    const {
      query: { id, action },
      request: { body },
    } = ctx;
    try {
      const projectResult = await updateFun(ctx, id, body, action);
      ctx.data(projectResult);
    } catch (error) { return; }
  };

  module.exports.auth = true;
