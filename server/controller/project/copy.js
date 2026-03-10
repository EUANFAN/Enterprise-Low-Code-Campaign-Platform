const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;
const { union } = require('lodash');
const { AUDIT_STATUS } = require('../../constants');
const validateRoleLimit = require('../api/utils/validateRoleLimit');
module.exports.post = async function (ctx, next) {
  const { query, request } = ctx;
  const { userId: bodyUserId } = request.body;
  const { id, name, type, parentId, roleId } = query;
  const userInfo = await ctx.getUserInfo();
  let { userId } = userInfo;
  userId = userId || bodyUserId;
  let dbQuery = { _id: ObjectId(id) };
  const isTheme = type === 'theme';
  if (isTheme) {
    // 复制模板角色权限校验
    const { ownerId } = await db.themes.findOne({ _id: ObjectId(id) });
    const { userDeptId } = await db.users.findOne({ userId: ownerId });
    try {
      await validateRoleLimit(ctx, {
        ownerId,
        userDeptId,
        permissionKey: 'copyTheme',
      });
    } catch (error) {
      return;
    }
  } else {
    // 复制项目角色权限校验
    const {
      ownerId,
      userDeptId: ownerUserDeptId,
      partner,
    } = await db.projects.findOne({
      _id: ObjectId(id),
    });

    try {
      await validateRoleLimit(ctx, {
        partner,
        ownerId,
        userDeptId: ownerUserDeptId,
        permissionKey: 'copyProject',
        permissionGroupKey: 'managerAllProject',
      });
    } catch (error) {
      return;
    }
  }
  let project = isTheme
    ? await db.themes.findOne(dbQuery)
    : await db.projects.findOne(dbQuery);
  if (!project) {
    const msg = {
      project: '项目不存在',
      theme: '模板不存在',
      rule: '规则不存在',
    };
    ctx.data(null, 'not_exist_error', msg[type]);
    await next();
    return;
  }

  let projectId = ObjectId();
  // 清理之前的项目修改信息
  delete project.lastPublished;
  delete project.abConfig;
  let newProjectParentId = null;
  if (parentId && parentId !== 'null') {
    newProjectParentId = ObjectId(parentId);
  }
  let revisionData = Object.assign(project.revisionData, {
    userInfo,
  });

  // 规则项目，重置sGroupid
  if (project.ruleWidget && project.revisionData.hasOwnProperty('sGroupId')) {
    project.revisionData.sGroupId = '';
  }

  Object.assign(project, {
    _id: projectId,
    partner:
      roleId == 'join' ? union([...project.partner], [project.ownerId]) : [],
    name: name || project.name,
    ownerId: userId,
    roleId: null,
    createdAt: new Date(),
    lastModified: new Date(),
    parentId: newProjectParentId,
    revisionData,
    config: {},
    status: 0,
    pagepv: 0,
    pageuv: 0,
    sharepv: 0,
    shareuv: 0,
  });

  project.editorType = type;
  let result;
  if (isTheme) {
    // 规则模板也要复制规则
    if (project.ruleId) {
      const rule = await db.projects.findOne({ _id: ObjectId(project.ruleId) });
      const newRuleId = ObjectId();
      const newRule = Object.assign(rule, {
        _id: newRuleId,
        themeId: projectId.toString(),
        createdAt: new Date(),
        lastModified: new Date(),
        ownerId: userId,
      });
      await db.projects.save(newRule);
      project.ruleId = newRuleId;
    }
    // 复制模板到模板组中
    db.themeGroups.update(
      { _id: ObjectId(project.themeGroupId) },
      { $inc: { 'metadata.count': 1 } }
    );
    project['auditStatus'] =
      app.env === 'prod' ? AUDIT_STATUS.NO_AUDIT : AUDIT_STATUS.AUDIT_SUCCESS;
    result = await db.themes.save(project);
  } else {
    // 复制到项目中
    result = await db.projects.save(project);
  }
  ctx.data(result);
  await next();
};

module.exports.post.auth = true;
