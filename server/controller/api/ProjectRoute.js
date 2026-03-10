import Router from 'koa-router';
import keyBy from 'lodash/keyBy';
import flatMap from 'lodash/flatMap';
import { union, differenceBy, compact } from 'lodash';
import Promise from 'bluebird';

import checkLogin from './checkLogin';
import {
  createProject,
  validatePath,
  findAncestorFolders,
  findAncestorFoldersNames
} from './utils/ProjectUtils';
import { getAllChooseResult } from '../api/utils/AllChooseUtils';
import { PermissionDeniedError } from '../../errors';
import helper from '../project/helper';
import { QUERY_SEPARATOR, URL_SEPARATOR } from '../../constants';
import validateRoleLimit from './utils/validateRoleLimit';

const { mongo, script } = global.app.utils;
const db = mongo.db();
const { ObjectId } = mongo.pmongo;

const router = new Router({ prefix: '/projects' });

// Check login in all handlers in this route
router.use(checkLogin);

const DEFAULT_PAGE_SIZE = 10;
const FOLDER_PREVIEW_IMAGE_COUNT = 4;

function isValidObjectId(str) {
  const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
  return checkForHexRegExp.test(str);
}

/**
 * 遍历传入的所有项目，展开目录项目，返回所有项目
 * @param {Array} projects
 * @return {Array}
 */
async function queryFoldersUnderAllProjects(projects) {
  let projectsList = [];
  for (let i = 0; i < projects.length; i++) {
    projectsList.push(projects[i]);
    if (projects[i].isFolder) {
      let currentFolderAllProjects = await db.projects.find({
        parentId: ObjectId(projects[i]._id)
      });
      projectsList = projectsList.concat(
        await queryFoldersUnderAllProjects(currentFolderAllProjects)
      );
    }
  }
  return projectsList;
}

/**
 * @api {get} /api/projects/:roleIdOrKey/:folderIds*  获取项目列表
 * @apiName    GetProjects
 * @apiGroup   Project
 *
 * @apiDescription  获取指定位置的项目内容
 *
 * @apiParam {String}   folders       项目文件夹 ID
 * @apiParam {String[]} themeId       主题 ID
 *
 * @apiSuccess (200) {Number} errno           Error number or string
 * @apiSuccess (200) {String} msg             Message or error message
 * @apiSuccess (200) {Object} data
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {
 *              "total": 1,
 *              "list": [
 *                  {
 *                      "_id": "5bdbfc47905fc04a5e8086c6",
 *                      "isFolder": true,
 *                      ...
 *                  }
 *              ],
 *              "folderInfoMap": {
 *                  "5bdbfc47905fc04a5e8086c6": {
 *                      "_id": "5bdbfc47905fc04a5e8086c6",
 *                      "count": 1,
 *                      "list": [
 *                          {
 *                              "_id": "5be2c8409c293ceeb0cc7d2d",
 *                              "revisionData": { ... },
 *                              "parentId": "5bdbfc47905fc04a5e8086c6"
 *                          }
 *                      ]
 *
 *                  }
 *              }
 *          }
 *       }
 *
 */
router.get(
  '/:roleIdOrKey/:folderIds*',
  validatePath,
  async function (ctx, next) {
    const {
      query,
      params: { roleIdOrKey, folderIds },
      body: validatePathBody
    } = ctx;
    if (validatePathBody) {
      if (validatePathBody.errno) {
        ctx.data(
          validatePathBody.data,
          validatePathBody.errno,
          validatePathBody.msg
        );
      } else {
        ctx.data(validatePathBody.data);
      }
      await next();
      return;
    }

    const { userId, userDeptId } = await ctx.getUserInfo();
    const pageSize = query.pageSize
      ? parseInt(query.pageSize, 10) || DEFAULT_PAGE_SIZE
      : DEFAULT_PAGE_SIZE;
    const current = query.current ? parseInt(query.current, 10) || 1 : 1;
    const shouldFilter = /^(folder|project)$/.test(query.filter);
    const search = (query.search || '').trim();
    const department = (query.department || '').trim(); // 超级管理员-按部门查找项目时使用
    const folderIdList = (folderIds ? folderIds.split(URL_SEPARATOR) : []).map(
      ObjectId
    );
    const targetFolderId = folderIdList[folderIdList.length - 1];
    // 文件夹面包屑
    let breadcrumbList = [];

    function getBreadcrumbList() {
      return db.projects.find(
        { _id: { $in: folderIdList } },
        {
          name: 1,
          _id: 1
        }
      );
    }
    breadcrumbList = await getBreadcrumbList();

    if (breadcrumbList.length) {
      breadcrumbList = folderIdList.map((id) => {
        return breadcrumbList.find((item) => id.equals(item._id));
      });
    }

    const matcherMap = {
      all: {
        parentId: null
      },
      my: {
        $and: [
          {
            $or: [
              {
                ownerId: userId
              },
              {
                partner: {
                  $elemMatch: {
                    $eq: userId
                  }
                }
              }
            ]
          }
        ]
      },
      join: {
        $and: [
          {
            $or: [
              {
                partner: {
                  $elemMatch: {
                    $eq: userId
                  }
                }
              },
              {
                ownerId: userId,
                partner: {
                  $elemMatch: {
                    $ne: null
                  }
                }
              }
            ]
          },
          // fix bug 若新添加的协同文件只有两个人协作无法展示
          // 原因是新添加的协同文件parent不包含自己，而copy的文件/新增的协同文件夹parent包含自己
          {
            $or: [
              {
                // 如果是文件夹/copy的文件，协同列表中除项目拥有者外至少还有一人
                'partner.1': {
                  $exists: 1
                }
              },
              {
                // 如果是新添加协同的文件，协同列表只要有人并且非文件夹，就代表是协同文件
                'partner.0': {
                  $exists: 1
                },
                isFolder: {
                  $exists: 0
                }
              }
            ]
          }
        ]
      },
      bin: {
        deleted: { $eq: true }
      },
      rule: {
        $and: [
          {
            ownerId: userId
          },
          {
            ruleWidget: {
              $ne: null
            }
          },
          {
            isThemeRule: {
              $ne: true
            }
          }
        ]
      }
    };
    // 我的全部项目中包含协同
    let projectMatcher = Object.assign(
      {
        deleted: { $ne: true }
      },
      matcherMap[roleIdOrKey || 'my']
    );

    // 切换事业部角色权限
    const { value: chooseBizUnitValue } = await ctx.validateRoleLimit(
      'chooseBizUnit'
    );
    // 是否能够管理本事业部所有的项目
    const { value: managerAllProjectValue } = await ctx.validateRoleLimit(
      'managerAllProject'
    );
    if (chooseBizUnitValue && managerAllProjectValue) {
      // 所有事业部
      if (department) {
        projectMatcher.userDeptId = ObjectId(department);
      }
    } else if (managerAllProjectValue) {
      // 本事业部
      projectMatcher.userDeptId = userDeptId;
    } else if (!managerAllProjectValue) {
      // 自己
      projectMatcher.ownerId = userId;
    }
    if (roleIdOrKey == 'bin') {
      // 查看回收站项目角色权限
      const { value: lookBinProjectValue, name: lookBinProjectName } =
        await ctx.validateRoleLimit('lookBinProject');
      if (!lookBinProjectValue) {
        return ctx.data(
          null,
          'no_permission',
          `您没有${lookBinProjectName}权限`
        );
      }
      Object.assign(matcherMap.bin, matcherMap.my);
    }
    function getFolder() {
      let foldersMatcher = Object.assign(
        {
          isFolder: true,
          deleted: { $ne: true }
        },
        matcherMap[roleIdOrKey || 'my']
      );

      return db.projects.aggregateCursor(
        {
          $match: foldersMatcher
        },
        {
          $group: {
            _id: null,
            id: {
              $addToSet: '$_id'
            }
          }
        },
        {
          $project: {
            _id: 0,
            ids: '$id'
          }
        }
      );
    }

    // 只筛选所在文件夹不属于该用户的项目，所在文件夹属于该用户的项目，不需要显示项目，只显示文件夹
    if (roleIdOrKey !== 'all') {
      // 获取该用户名下所有的文件夹
      const userFolderIdList = await getFolder().then((res) => {
        return res[0] ? res[0].ids : [];
      });
      const key =
        (roleIdOrKey === 'join' && folderIds ? 'my' : roleIdOrKey) || 'my';
      projectMatcher = Object.assign(
        {
          parentId: {
            $nin: userFolderIdList
          },
          deleted: { $ne: true }
        },
        matcherMap[key]
      );
    }

    if (targetFolderId) {
      projectMatcher.parentId = targetFolderId;
    }
    if (shouldFilter) {
      projectMatcher.isFolder = query.filter === 'folder';
    }

    if (search) {
      !projectMatcher.$and && (projectMatcher.$and = []);
      if (isValidObjectId(search)) {
        // TODO: 此处两个themeId是为了兼容规则项目和非规则项目的的themeId不统一，后续需要进行统一
        projectMatcher.$and.push({
          $or: [
            { _id: ObjectId(search) },
            { themeId: search },
            { 'revisionData.themeId': ObjectId(search) }
          ]
        });
        delete projectMatcher.parentId;
      } else {
        projectMatcher.$and.push({
          $or: [
            { title: { $regex: search } },
            { name: { $regex: search } },
            { ownerId: { $regex: search } }
          ]
        });
      }
    }

    projectMatcher.isThemeRule = null;

    const [
      {
        count: [countResult],
        list: projectsOrFolders
      }
    ] = await db.projects.aggregateCursor(
      {
        $match: projectMatcher
      },
      // 一下添加关联查询是为了将有themeId的数据返回对应的模板数据，
      // 前台需要模板数据中的componentPlat，绕了一圈就是为了获取个类型，真够麻烦的
      // 而没有themeId的规则项目没有办法获取componentPlat，暂时不展示，可能得加字段，再考虑吧

      { $sort: { lastModified: -1 } },
      {
        $addFields: {
          // 添加_themeId字段并转为objectId用于做关联查询
          _themeId: {
            $convert: {
              input: '$themeId', // 用主表的themeId字段转换
              to: 'objectId'
            }
          }
        }
      },
      {
        $lookup: {
          // 主表关联查询themes表，获取数据
          // 左连接
          from: 'themes', // 关联到themes表
          localField: '_themeId', // 主表关联的字段
          foreignField: '_id', // themes联表关联的字段
          as: '_themes'
        }
      },
      {
        $facet: {
          count: [{ $count: 'count' }],
          list: [
            { $skip: Math.max(current - 1, 0) * pageSize },
            { $limit: pageSize }
          ]
        }
      }
    );
    const count = countResult ? countResult.count : 0;

    const newFolderIds = projectsOrFolders
      .filter((projectOrFolder) => projectOrFolder.isFolder)
      .map((folder) => folder._id);
    const newFolderInfoList = await db['projects'].aggregateCursor(
      {
        $match: {
          parentId: { $in: newFolderIds },
          deleted: { $ne: true }
        }
      },
      {
        $project: {
          parentId: 1,
          _id: 1,
          poster: 1,
          abConfig: 1,
          origin: 1
        }
      },
      {
        $group: {
          _id: '$parentId',
          list: { $push: '$$CURRENT' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 1,
          list: { $slice: ['$list', 0, FOLDER_PREVIEW_IMAGE_COUNT] },
          count: 1
        }
      }
    );
    const folderInfoMap = keyBy(newFolderInfoList, '_id');
    ctx.data({
      total: Math.ceil(count / pageSize),
      list: projectsOrFolders,
      folderInfoMap,
      breadcrumbList
    });
    await next();
  }
);

/**
 * @api {post} /project/create/folder 创建项目文件夹
 * @aipName    CreateProjectFolder
 * @apiGroup   Project
 *
 * @apiDescription
 * 创建项目文件夹
 *
 * @apiParam {String}   name          项目名
 *
 * @apiSuccess (200) {Number} errno   错误码
 * @apiSuccess (200) {String} msg     错误信息
 * @apiSuccess (200) {Object} data    新增的文件夹信息
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {
 *              "_id": "5bf521ae2909d52c7bf39708",
 *              "name": "DDFFD",
 *              "ownerId": "chenbangjing",
 *              "isFolder": true,
 *              "version": "3.0",
 *              "createdAt": "2018-11-21T09:13:18.736Z",
 *              "lastModified": "2018-11-21T09:13:18.736Z",
 *              "parentId": "5bf51f4d89f73987769a77dd",
 *              "roleId": "5a042c85462025d0609aa110",
 *           }
 *       }
 *
 */
router.post('/:roleIdOrKey/:folderIds*/folder', validatePath, async (ctx) => {
  const {
    params: { folderIds },
    request: {
      body: { name }
    }
  } = ctx;
  const { userId, userDeptId } = await ctx.getUserInfo();
  try {
    await validateRoleLimit(ctx, {
      ownerId: userId,
      userDeptId: userDeptId,
      permissionKey: 'addProject',
      permissionGroupKey: 'managerAllProject'
    });
  } catch (error) {
    return;
  }
  const newGroupId = ObjectId();
  const now = new Date();
  const newFolder = {
    _id: newGroupId,
    name,
    ownerId: userId,
    partner: [userId],
    isFolder: true,
    version: '3.0',
    createdAt: now,
    lastModified: now,
    userDeptId
  };

  let newFolderObject;
  const folderIdList = folderIds ? folderIds.split(URL_SEPARATOR) : [];
  const targetId =
    folderIdList.length !== 0 ? folderIdList[folderIdList.length - 1] : null;

  newFolderObject = {
    ...newFolder,
    parentId: targetId ? ObjectId(targetId) : null
  };

  const data = await db.projects.insert(newFolderObject);
  return ctx.data(data);
});

/**
 * @api {post} /project/create 创建项目
 * @aipName    CreateProject
 * @apiGroup   Project
 *
 * @apiDescription
 * 创建项目。这个接口不提供第三方用户使用，如果要创建可以选择旧版本的接口 (/project/create)
 *
 * @apiParam {String}   name          项目名
 * @apiParam {String}   pageCount     页面数量
 * @apiParam {String}   groupId       目标群组
 * @apiParam {String[]} themeId       主题 ID
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
router.post('/:roleIdOrKey/:folderIds*', validatePath, async function (ctx) {
  const {
    params: { folderIds },
    request: {
      body: {
        pageCount = '1',
        name = '未命名项目',
        themeId,
        layoutType,
        client,
        runingTime,
        componentPlat,
        miniProgramId
      }
    }
  } = ctx;

  const { userId, userDeptId } = await ctx.getUserInfo();
  try {
    await validateRoleLimit(ctx, {
      ownerId: userId,
      userDeptId: userDeptId,
      permissionKey: 'addProject'
    });
  } catch (error) {
    return;
  }
  const numPages = parseInt(pageCount, 10);
  const folderIdList = folderIds ? folderIds.split(URL_SEPARATOR) : [];
  const targetFolderId =
    folderIdList.length !== 0
      ? folderIdList[folderIdList.length - 1]
      : undefined;
  const runingTimeObj = runingTime ? JSON.parse(runingTime) : {};

  const { project } = await createProject(userId, {
    pageCount: numPages,
    name,
    parentId: targetFolderId,
    themeId: themeId ? ObjectId(themeId) : undefined,
    layoutType,
    type: 'project',
    partner: [userId],
    userDeptId,
    client,
    ...runingTimeObj,
    componentPlat,
    miniProgramId
  });
  ctx.data({ projectId: project._id, origin: project.origin });
});

/**
 * @api       {get}  /api/project/:projectId/custom-scripts  get project scripts list
 * @apiGroup  Project
 *
 * @apiSuccess (200) {Number} errno    Error number or string
 * @apiSuccess (200) {String} msg      Message or error message
 * @apiSuccess (200) {Object} data     Nothing
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *         scripts:[x,x,x]
 *       }
 *
 */
router.get('/:projectId/custom-scripts', async (ctx) => {
  const {
    params: { projectId }
  } = ctx;

  let projectData = await db.projects.findOne({
    _id: ObjectId(projectId)
  });

  let scripts = await script.getProjectPreloadScripts(projectData);

  ctx.data({ scripts });
});

/**
 * @api       {delete}  /api/projects/:roleIdOrKey/:folderIds/:targetIds  删除资源
 * @apiName   DeleteResourcesFolders
 * @apiGroup  Resource
 *
 * @apiDescription  删除所给定的所有文件夹。这里 projects 是以 "+" 字符分开的字串
 *
 * @apiSuccess (200) {Number} errno    Error number or string
 * @apiSuccess (200) {String} msg      Message or error message
 *
 **/

router.delete('/:roleIdOrKey/:folderIds*/:targetIds', async (ctx) => {
  const {
    params: { targetIds, roleIdOrKey },
    request: {
      body: { noSelectIds, chooseAll, folderId }
    }
  } = ctx;
  let targetIdList = [];

  if (chooseAll == 'true') {
    let results = await getAllChooseResult(
      ctx,
      noSelectIds,
      roleIdOrKey,
      folderId
    );
    targetIdList = results.map((project) => project._id);
  } else {
    targetIdList = targetIds.split(QUERY_SEPARATOR).map(ObjectId);
  }
  // 删除项目/文件夹角色权限校验
  const projectList = await db.projects.find({
    _id: { $in: targetIdList },
    deleted: { $ne: true }
  });
  try {
    for (let i = 0; i < projectList.length; i++) {
      const { ownerId, userDeptId: ownerUserDeptId } = projectList[i];
      await validateRoleLimit(ctx, {
        ownerId,
        userDeptId: ownerUserDeptId,
        permissionKey: 'deleteProject',
        permissionGroupKey: 'managerAllProject'
      });
    }
  } catch (error) {
    return;
  }
  let targetFolderProjects = await db.projects.aggregateCursor(
    {
      $match: {
        _id: { $in: targetIdList },
        isFolder: true,
        deleted: { $ne: true }
      }
    },
    { $project: { _id: 1 } },
    {
      $graphLookup: {
        from: 'projects',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'decendentsHierarchy',
        restrictSearchWithMatch: {
          deleted: { $ne: true }
        }
      }
    },
    { $project: { list: '$decendentsHierarchy._id' } }
  );
  const folderProjectIdList = flatMap(targetFolderProjects, (item) => {
    return item.list.map((id) => id);
  });

  const deleteResult = await db.projects.update(
    { _id: { $in: [...(targetIdList || []), ...(folderProjectIdList || [])] } },
    { $set: { deleted: true } },
    { multi: true }
  );

  return ctx.data({ deleteResult });
});

router.put('/:roleIdOrKey/:folderIds*/:targetIds', async (ctx) => {
  const {
    params: { targetIds, roleIdOrKey },
    request: {
      body: { noSelectIds, chooseAll, folderId }
    }
  } = ctx;
  let targetIdList = [];
  if (chooseAll == 'true') {
    let results = await getAllChooseResult(
      ctx,
      noSelectIds,
      roleIdOrKey,
      folderId
    );
    targetIdList = results.map((project) => project._id);
  } else {
    targetIdList = targetIds.split(QUERY_SEPARATOR).map(ObjectId);
  }

  if (roleIdOrKey == 'bin') {
    // 还原回收站项目角色权限校验
    const projectList = await db.projects.find({
      _id: { $in: targetIdList }
    });
    try {
      for (let i = 0; i < projectList.length; i++) {
        const { ownerId, userDeptId } = projectList[i];
        await validateRoleLimit(ctx, {
          ownerId,
          userDeptId,
          permissionKey: 'restoreBinProject',
          permissionGroupKey: 'managerAllProject'
        });
      }
    } catch (error) {
      return;
    }
  }
  let targetFolderProjects = await db.projects.aggregateCursor(
    {
      $match: {
        _id: { $in: targetIdList },
        isFolder: true,
        deleted: { $eq: true }
      }
    },
    { $project: { _id: 1 } },
    {
      $graphLookup: {
        from: 'projects',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'decendentsHierarchy',
        restrictSearchWithMatch: {
          deleted: { $eq: true }
        }
      }
    },
    { $project: { list: '$decendentsHierarchy._id' } }
  );

  const folderProjectIdList = flatMap(targetFolderProjects, (item) => {
    return item.list.map((id) => id);
  });

  const restoreResult = await db.projects.update(
    { _id: { $in: [...(targetIdList || []), ...(folderProjectIdList || [])] } },
    { $set: { deleted: false } },
    { multi: true }
  );

  return ctx.data({ restoreResult });
});

/**
 * 把 projects 移动到群组 A 的 B 文件夹（改变 project 的 roleId 以及 parentId 两个值）
 *
 * @api  {put}  /api/projects/move  move project or folder to another folder
 */
router.put('/move', async (ctx) => {
  const {
    request: {
      body: {
        projectIds, // 需要移动的项目列表数组
        toFolder, // 目标文件夹（也可能是空，代表目标群组根目录）
        roleId,
        folderId,
        noSelectIds,
        chooseAll
      }
    }
  } = ctx;
  const { userDeptId } = await ctx.getUserInfo();
  let projectList = [];
  if (chooseAll === 'true') {
    let results = await getAllChooseResult(ctx, noSelectIds, roleId, folderId);
    projectList = results.map((project) => project._id);
  } else {
    projectList = projectIds;
  }
  // 1. 验证传入的待移动的项目ID是合法的
  if (
    toString.call(projectList) !== '[object Array]' ||
    !projectList.length ||
    projectList.some((projectId) => !isValidObjectId(projectId))
  ) {
    throw new PermissionDeniedError('请传入正确的项目参数');
  }

  const selectedIdList = (projectList || []).map(ObjectId);
  const projectsResult = await db.projects.find({
    _id: { $in: selectedIdList }
  });

  if (projectsResult.length !== selectedIdList.length) {
    throw new PermissionDeniedError('传入的项目ID有误');
  }

  // 移动项目/文件夹角色权限校验、
  try {
    for (let i = 0; i < projectsResult.length; i++) {
      const { ownerId, userDeptId: ownerUserDeptId } = projectsResult[i];
      await validateRoleLimit(ctx, {
        ownerId,
        userDeptId: ownerUserDeptId,
        permissionKey: 'moveProject',
        permissionGroupKey: 'managerAllProject'
      });
    }
  } catch (error) {
    return;
  }
  // 2. 如果是移动到文件夹，验证合理性
  //    1) 移动操作不会破坏文件夹的链表
  //    2) toFolder 查询结果吻合 toRole
  let toFolderName = '';
  if (toFolder) {
    const ancestors = await findAncestorFolders(toFolder);
    if (!ancestors) {
      throw new PermissionDeniedError('文件夹信息有误');
    }
    const notExpect = ancestors.ancestorIds.some(
      (id) => projectList.indexOf(id) !== -1
    );
    if (notExpect) {
      throw new PermissionDeniedError('项目不能包含目标文件夹及其父文件夹');
    }
    toFolderName = await findAncestorFoldersNames(toFolder);
  }
  // 3. 获取移动的群组或文件夹userDeptId，
  //    1)如果有文件夹id，以文件夹userDeptId为准
  //    2)如果没有文件夹id，移交到我的群组，以我的userDeptId为主，其余群组以群组userDeptId为准
  const newDate = {
    parentId: toFolder ? ObjectId(toFolder) : null,
    userDeptId: userDeptId,
    lastModified: new Date()
  };
  let targePro = {
    partner: []
  };
  if (toFolder) {
    targePro = await db.projects.findOne({ _id: ObjectId(toFolder) });
    // 移动项目到文件夹时，添加文件夹的owner到协同列表
    Object.assign(newDate, {
      userDeptId: targePro.userDeptId
    });
  }

  const projectAndChildren = await queryFoldersUnderAllProjects(projectsResult);
  const children = differenceBy(projectAndChildren, projectsResult, '_id');

  const updateProjects = function (projects, newDate) {
    return Promise.all(
      projects.map((project) => {
        const partner = compact(
          union([
            ...(project.partner || []),
            project.ownerId,
            ...(targePro.partner || []),
            targePro.ownerId
          ])
        );
        newDate.partner = partner;
        return db.projects.update(
          { _id: project._id },
          {
            $set: newDate
          },
          { multi: true }
        );
      })
    );
  };

  const projectResult = await updateProjects(projectsResult, newDate);
  const childrenResult = await updateProjects(children, {
    userDeptId: newDate.userDeptId
  });

  ctx.log(projectIds, 'move', {
    toFolderName
  });
  ctx.data({ result: [...projectResult, ...childrenResult] });
});

/**
 * 项目转移
 * 当前仅支持两种情况
 * 1. 该项目属于 我的，转移到目标用户的私人群组根目录，变更userId、parentId、roleId
 * 2. 该项目属于 normal 群组，userId 和 newUserId 都属于该群组，这时候仅仅变更 userId 即可
 *
 * @api  {put}  /api/projects/transfer
 */
router.put('/transfer', async (ctx) => {
  const {
    request: {
      body: { projectIds, newUserId, chooseAll, noSelectIds, roleId, folderId }
    }
  } = ctx;
  const { userId } = await ctx.getUserInfo();

  let projectList = [];
  if (chooseAll === 'true') {
    let results = await getAllChooseResult(ctx, noSelectIds, roleId, folderId);
    projectList = results.map((project) => project._id);
  } else {
    projectList = projectIds;
  }
  if (!projectList) {
    throw new PermissionDeniedError('请传入要移动的项目ID');
  }
  if (projectList.some((id) => !isValidObjectId(id))) {
    throw new PermissionDeniedError('无效的项目ID');
  }

  const hasNewUser = await db.users.findOne({ userId: newUserId });
  if (!hasNewUser) {
    return ctx.data({
      stat: 0,
      msg: '用户不存在。请填写目标用户邮箱前缀，且该用户登录过此平台。'
    });
    // throw new PermissionDeniedError('无效的用户');
  }

  const firstLayerProjectObjectIds = projectIds.map(ObjectId);

  const firstLayerProjects = await db.projects.find({
    _id: { $in: firstLayerProjectObjectIds }
  });

  if (firstLayerProjects.length !== projectIds.length) {
    throw new PermissionDeniedError('内含无效的项目');
  }

  const allProjects = await queryFoldersUnderAllProjects(firstLayerProjects);
  const allProjectsIds = allProjects.map((item) => item._id);
  const allProjectsObjectIds = allProjectsIds.map(ObjectId);
  const allSelf = allProjects.every((project) => project.ownerId === userId); // 都是自己的项目
  // 转移项目/文件夹至其他用户角色权限校验
  try {
    for (let i = 0; i < allProjects.length; i++) {
      const { ownerId, userDeptId: ownerUserDeptId } = allProjects[i];
      await validateRoleLimit(ctx, {
        ownerId,
        userDeptId: ownerUserDeptId,
        permissionKey: 'transProjectToUser',
        permissionGroupKey: 'managerAllProject'
      });
    }
  } catch (error) {
    return;
  }

  if (allSelf && userId === newUserId) {
    throw new PermissionDeniedError('已经是自己的项目');
  }

  // if ( !allSelf) {
  //   throw new PermissionDeniedError('无法转移非自己的项目');
  // }

  // 清除第一层项目的parentId，roleId
  await db.projects.update(
    { _id: { $in: firstLayerProjectObjectIds } },
    {
      $set: {
        parentId: null,
        roleId: null,
        lastModified: new Date()
      }
    },
    { multi: true }
  );

  // 转移项目
  const result = await db.projects.update(
    { _id: { $in: allProjectsObjectIds } },
    {
      $set: {
        ownerId: newUserId,
        lastModified: new Date(),
        userDeptId: hasNewUser.userDeptId
      }
    },
    { multi: true }
  );

  ctx.log(allProjectsIds, 'trans', {
    oldUserId: userId,
    newUserId
  });

  return ctx.data({ stat: 1, result });
});

/**
 * @api  {post}  /api/projects/:projectIds/bulkPublish' bulk publish projects
 */
router.put('/bulkPublish', async (ctx) => {
  const {
    request: {
      body: { selectedIds, noSelectIds, chooseAll, roleId, folderId }
    }
  } = ctx;
  let selectedIdList = [];
  if (chooseAll == 'true') {
    let results = await getAllChooseResult(ctx, noSelectIds, roleId, folderId);
    let hasFolder = results.some((project) => {
      return project.isFolder;
    });
    if (hasFolder) {
      return ctx.data({
        stat: -1,
        message: '批量发布仅支持发布文件'
      });
    } else {
      selectedIdList = results.map((item) => item._id);
    }
  } else {
    selectedIdList = selectedIds.split('+');
  }
  let result = null;
  try {
    result = await Promise.map(selectedIdList, async (projectId) => {
      let project = await db.projects.findOne({ _id: ObjectId(projectId) });
      // 批量发布权限角色校验
      const { ownerId, userDeptId: ownerUserDeptId, partner } = project;
      await validateRoleLimit(ctx, {
        partner,
        ownerId,
        userDeptId: ownerUserDeptId,
        permissionKey: 'publishProject',
        permissionGroupKey: 'managerAllProject'
      });
      let res = await helper.publish.bind(ctx)(project, projectId);
      await db.projects.update(
        { _id: ObjectId(projectId) },
        {
          $set: {
            status: 4,
            approLogId: '',
            approSign: ''
          }
        }
      );
      return res;
    });
  } catch (error) {
    return;
  }

  ctx.log(selectedIdList.join(','), 'publish');
  ctx.data({
    result
  });
});

module.exports = router;
