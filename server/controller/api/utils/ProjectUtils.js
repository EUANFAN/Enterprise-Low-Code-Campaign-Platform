/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:02:06
 */
const { keyBy } = require('lodash');
const { pmongo, db } = require('../../../utils/mongo');
const { createProjectFromPage } = require('../../project/utils');

const {
  URL_SEPARATOR,
  DEFAULT_POSTER,
  AUDIT_STATUS
} = require('../../../constants');
const app = global.app;
const { ObjectId } = pmongo;

const dbase = db();

const CREATE_PAGE_DEFAULT_OPTION = {
  pageCount: 1,
  name: '未命名项目',
  themeId: null,
  status: 0,
  roleId: null,
  parentId: null,
  layoutType: 'normal',
  config: {}
};

function isValidObjectId(str) {
  const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
  return checkForHexRegExp.test(str);
}

const findAncestorFolders = async (projectId) => {
  if (!isValidObjectId(projectId)) {
    return false;
  }

  const result = {
    path: '',
    ownerId: '',
    roleId: '', // my | ObjectId
    ancestors: [],
    ancestorIds: [] // index值最大的是父文件夹，index0 是群组根目录文件夹
  };

  async function findAncestor(projectObjectId) {
    const item = await dbase.projects.findOne({ _id: projectObjectId });
    result.ancestors.unshift(item);
    result.ancestorIds.unshift(item._id.toString());
    if (item.parentId) {
      return findAncestor(item.parentId);
    } else {
      result.ownerId = item.ownerId;
      result.roleId = item.roleId ? item.roleId.toString() : 'my';
    }
  }

  await findAncestor(ObjectId(projectId));

  if (!result.ancestorIds.length) {
    return false;
  }
  const temp = result.ancestorIds.slice();
  temp.unshift(result.roleId);
  result.path = temp.join(URL_SEPARATOR);
  return result;
};

const findAncestorFoldersNames = async (projectId) => {
  if (!isValidObjectId(projectId)) {
    return false;
  }

  let result = [];

  async function findAncestor(projectObjectId) {
    const item = await dbase.projects.findOne({ _id: projectObjectId });
    result.unshift(item.name);
    if (item.parentId) {
      return findAncestor(item.parentId);
    }
  }

  await findAncestor(ObjectId(projectId));
  return result.join('/');
};

const validateFolderPath = async (userId, roleIdOrKey, folderIds) => {
  // 群组必有 Root 文件夹
  if (!folderIds) {
    return;
  }
  const folderObjectIds = [];
  folderIds
    .split(URL_SEPARATOR)
    .reverse()
    .map((item) => {
      if (isValidObjectId(item)) {
        folderObjectIds.push(ObjectId(item));
      }
    });
  const folders = await dbase.projects.find({
    _id: { $in: folderObjectIds },
    isFolder: true
  });

  if (folders.length !== folderObjectIds.length) {
    return {
      errno: 404,
      msg: '错误的路径',
      data: {}
    };
  }

  const folderObjectMap = keyBy(folders, '_id');
  folderObjectIds.forEach((id, index, list) => {
    const { parentId, roleId: folderRoleId, ownerId } = folderObjectMap[id];
    if (index !== list.length - 1) {
      return parentId.equals(list[index + 1]);
    }
    if (roleIdOrKey === 'my') {
      return !parentId && !folderRoleId && ownerId === userId;
    }
    return !parentId;
  });
};

const validatePath = async (ctx, next) => {
  const {
    params: { roleIdOrKey, folderIds }
  } = ctx;
  const { userId } = await ctx.getUserInfo();
  const res = await Promise.all([
    validateFolderPath(userId, roleIdOrKey, folderIds)
  ]);
  if (res[0] && res[0].errno) {
    ctx.data(res[0].data, 404, res[0].msg);
  }
  await next();
};

const createProject = async (userId, options) => {
  const {
    name,
    themeId,
    layoutType,
    parentId,
    roleId,
    config,
    status,
    type,
    groupId,
    pageData,
    userDeptId,
    origin,
    client,
    application,
    runingStartTime,
    runingEndTime,
    componentPlat,
    ruleId,
    miniProgramId,
    tags
  } = Object.assign({}, CREATE_PAGE_DEFAULT_OPTION, options);
  const now = new Date();

  const newProjectId = ObjectId();
  const newLogId = ObjectId();
  let pages, themeGroupId, themeObjectId, projectData;
  let projectOrigin = origin;
  let triggers = [
    {
      type: 'SendLog',
      event: 'willmount',
      clazz: 'trigger',
      client: client,
      data: {
        carryUrlQuery: false,
        clickid: '',
        options: ''
      },
      platform: ['iOS', 'android', 'other']
    }
  ];
  let themeApplication = {};
  let runingTime = { runingStartTime, runingEndTime };

  if (typeof runingTime.runingEndTime != 'string') {
    runingTime.runingEndTime = new Date(runingTime.runingEndTime);
  }
  if (typeof runingTime.runingStartTime != 'string') {
    runingTime.runingStartTime = new Date(runingTime.runingStartTime);
  }
  if (themeId) {
    // 从模板创建项目
    themeObjectId = ObjectId(themeId);
    let theme = await dbase.themes.findOne(
      { _id: themeObjectId },
      { id: false, userId: false }
    );
    themeGroupId = ObjectId(theme.themeGroupId);
    const { rulesConfig } = theme.revisionData;
    let obj = rulesConfig ? { rulesConfig: {} } : {};
    const revisionData = Object.assign({}, theme.revisionData, obj);
    projectData = createProjectFromPage({
      ...revisionData,
      themeId: themeObjectId,
      editorType: type,
      title: name,
      ...runingTime,
      componentPlat,
      miniProgramId
    });
    projectOrigin = theme.origin;
  } else {
    // 创建模板或者创建项目
    pages = [{ widgets: [], triggers: [...triggers] }];
    themeGroupId = groupId ? ObjectId(groupId) : undefined;
    if (pageData) {
      projectData = pageData;
    } else {
      let options = {
        title: name,
        layout: layoutType,
        useData: false,
        pages: pages,
        editorType: type,
        componentPlat,
        miniProgramId
      };
      projectData =
        type != 'theme'
          ? createProjectFromPage(Object.assign(options, runingTime))
          : createProjectFromPage(options);
    }
    themeApplication.application = application ? application : null;
  }

  const projectInstance = {
    _id: newProjectId,
    status,
    name: name || '未命名项目',
    ownerId: userId,
    deleted: false,
    editable: true,
    origin: projectOrigin,
    themeGroupId,
    createdAt: now,
    pagepv: 0,
    pageuv: 0,
    sharepv: 0,
    shareuv: 0,
    lastModified: now,
    revisionId: newLogId,
    revisionData: projectData,
    parentId: parentId ? ObjectId(parentId) : null,
    roleId: roleId ? ObjectId(roleId) : null,
    config,
    version: '3.0',
    poster: DEFAULT_POSTER,
    userDeptId: userDeptId ? ObjectId(userDeptId) : null,
    client: client,
    ...themeApplication,
    tags
  };

  const logInstance = {
    _id: newLogId,
    args: {},
    action: 'create',
    content: projectData,
    createdAt: now,
    itemId: newProjectId,
    itemType: type,
    performer: userId,
    version: '2.0',
    ownerId: userId,
    name: name || '未命名项目',
    poster: DEFAULT_POSTER
  };

  let request = [dbase.logs.insert(logInstance)];
  if (type == 'project') {
    request.unshift(dbase.projects.insert(projectInstance));
  } else {
    // 创建模板的新建一份规则，存到规则的表中。规则和模板进行绑定
    if (ruleId) {
      projectInstance['ruleId'] = ruleId;
    }
    // 创建新模板添加审核状态
    projectInstance['auditStatus'] =
      app.env === 'prod' ? AUDIT_STATUS.NO_AUDIT : AUDIT_STATUS.AUDIT_SUCCESS;
    request.unshift(dbase.themes.insert(projectInstance));
  }
  const [projectResult, logResult] = await Promise.all(request);
  return { project: projectResult, log: logResult };
};
module.exports = {
  findAncestorFolders,
  findAncestorFoldersNames,
  validateFolderPath,
  validatePath,
  createProject
};
