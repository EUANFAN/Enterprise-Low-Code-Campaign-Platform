const Router = require('koa-router');
const Promise = require('bluebird');
const { validateThemeWriteAccess } = require('./utils/ThemeUtils');
const { createProject } = require('./utils/ProjectUtils');
const checkLogin = require('./checkLogin');
const {
  InvalidParameterError,
  PermissionDeniedError,
} = require('../../errors');
const validateRoleLimit = require('./utils/validateRoleLimit');
const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;
const router = new Router({ prefix: '/themes' });

// Check login in all handlers in this route
router.use(checkLogin);

/**
 *   验证审核者
 * @param {*} category
 */

const validateReviewer = async (reviewerIds) => {
  const isInvalid = Array.isArray(reviewerIds) && reviewerIds.length === 1;
  if (!isInvalid) {
    throw new InvalidParameterError('审核者必须是一个人');
  }
};

const validateThemeGroupCategory = async (category) => {
  const isInvalid = await db.themeCategories.findOne({
    key: category
  });

  if (!isInvalid) {
    throw new InvalidParameterError('无效的类别');
  }
};

const validateThemeCategory = async (key) => {
  const result = await db.themeCategories.findOne({
    key: key
  });
  if (result) {
    throw new PermissionDeniedError('您创建的模板类别已经存在');
  }
};

const validateThemeCategoryId = async (category) => {
  const result = await db.themeCategories.findOne({
    _id: ObjectId(category)
  });

  if (!result) {
    throw new InvalidParameterError('模板类别不存在');
  }
  return result;
};

function isValidObjectId(str) {
  const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
  return checkForHexRegExp.test(str);
}

const COMMON_CATEGORY_PROJECT_PARAMS = {
  name: 1,
  type: 1,
  creator: 1,
  category: 1,
  createdAt: 1,
  lastModified: 1,
  poster: 1,
  userDeptId: 1
};

/**
 * @api       {get}  /api/themes/categories/:category  获取相应分类的主题列表
 * @apiName   GetThemeListOfCategory
 * @apiGroup  Theme
 *
 * @apiDescription  获取指定分类的主题列表
 *
 * @apiSuccess (200) {Number}    errno      错误讯息代号
 * @apiSuccess (200) {String}    msg        可读性较好的错误讯息
 * @apiSuccess (200) {Object}    data       回传数据
 * @apiSuccess (200) {Object[]}  data.list  主题列表
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {
 *              "list": [],
 *          }
 *       }
 *
 */
router.get('/categories/:category', async (ctx) => {
  const {
    params: { category },
    query: {
      userDeptId,
      currentPage: currentPageString,
      pageSize: pageSizeString,
      search: searchString }
  } = ctx;
  const currentPage = (currentPageString && parseInt(currentPageString, 10)) || 0;
  const pageSize = (pageSizeString && parseInt(pageSizeString, 10)) || Number.MAX_VALUE;
  const search = (searchString || '').trim();
  let projectMatcher = { $match: {} };
  if (search) {
    if (isValidObjectId(search)) {
      projectMatcher.$match.$or = [
        { '_id': ObjectId(search) }
      ];
    } else {
      projectMatcher.$match.$or = [
        { 'name': { $regex: search } },
        { 'creator': { $regex: search } }
      ];
    }
  }
  let result;
  let totalCount;

  if (category != 'all') { // 每个模板类型筛选
    await validateThemeGroupCategory(category);
    const match = { category, deleted: { $in: [false, null] }, userDeptId: ObjectId(userDeptId), ...projectMatcher.$match };
    // 根据_id遍历themeGroups,看themes中的themeGroupId是否与之匹配，若匹配则输出该文档为themes
    const [{
      count: [countResult],
      list: groupList }] = await db.themeGroups.aggregateCursor(
      { $match: match }, // 查询按照query.userDeptId
      {
        $lookup: {
          from: 'themes',
          localField: '_id',
          foreignField: 'themeGroupId',
          as: 'themes',
        },
      },
      {
        $project: {
          ...COMMON_CATEGORY_PROJECT_PARAMS,
          themes: {
            $filter: {
              input: '$themes',
              cond: { $ne: ['$$this.deleted', true] },
            }
          }
        }
      },
      {
        $project: {
          ...COMMON_CATEGORY_PROJECT_PARAMS,
          themes: 1,
          publishedThemes: {
            $filter: {
              input: '$themes',
              cond: { $ifNull: ['$$this.revisionData', false] },
            },
          },
        },
      },
      {
        $project: {
          ...COMMON_CATEGORY_PROJECT_PARAMS,
          metadata: {
            count: { $size: '$themes' },
            defaultThemeId: { $arrayElemAt: ['$publishedThemes._id', 0] }
          },
        },
      },
      { $sort: { lastModified: -1 } },
      {
        $facet: {
          count: [{ $count: 'count' }],
          list: [
            { $skip: Math.max(currentPage - 1, 0) * pageSize },
            { $limit: pageSize },
          ],
        }
      }
    );
    totalCount = countResult ? countResult.count : 0;

    ctx.data({ themeGroups: groupList, total: Math.ceil(totalCount / pageSize) });
  } else { // 将项目设置为模板时的模板组列表

    let list = await db.themeGroups.aggregateCursor(
      { $match: { deleted: { $in: [false, null] } } },
      {
        $group: {
          '_id': '$category',
          list: {
            $push: {
              'title': '$name',
              'key': '$_id',
              'category': '$category',
              'userDeptId': '$userDeptId'
            }
          }
        }
      }
    );
    let categoriesMap = {};
    await db.themeCategories.find().map(item => {
      categoriesMap[item.key] = item.name;
    });
    result = list.map(doc => {
      return {
        title: categoriesMap[doc._id],
        key: doc._id,
        children: doc.list
      };
    });
    ctx.data({ themeGroups: result });
  }
});

/**
 * @api       {post}  /api/themes/categories/  创建新主题分组
 * @apiName   CreateThemeGroupInCategory
 * @apiGroup  Theme
 *
 * @apiDescription  在指定的类型里创建新分组
 *
 * @apiParam  {String} name      新分组名
 * @apiParam  {String} category  创建分组的目标类型
 *
 * @apiSuccess (200) {Number}    errno      错误讯息代号
 * @apiSuccess (200) {String}    msg        可读性较好的错误讯息
 * @apiSuccess (200) {Object}    data       回传数据
 * @apiSuccess (200) {Object[]}  data.list  新建的分组数据
 *
 */
router.post('/categories/:category', async (ctx) => {
  const {
    params: { category },
    request: {
      body: { name, userDeptId },
    }
  } = ctx;
  if (!name) {
    ctx.data({}, '参数不合法', '请填写模版组名称');
    return;
  }
  const { userId } = await ctx.getUserInfo();
  // 新增模板类型校验
  const { creator, userDeptId: ownerUserDeptId } = await db.themeCategories.findOne({ key: category });
  try { await validateRoleLimit(ctx, { ownerId: creator, userDeptId: ownerUserDeptId, permissionKey: 'updateThemeGroup' }); } catch (error) { return; }
  await Promise.all([
    validateThemeGroupCategory(category),
  ]);
  const now = new Date();
  const newGroup = await db.themeGroups.insert({
    version: '1.0',
    name,
    creator: userId,
    category,
    createdAt: now,
    lastModified: now,
    userDeptId: ObjectId(userDeptId),
    metadata: {
      count: 0,
      defaultThemeId: null
    },
    deleted: false
  });

  ctx.data({ themeGroup: newGroup });
});

/**
 *  @description 新增模板类别
 */
router.post('/theme-category', async (ctx) => {
  const {
    request: {
      body: { name, key, userDeptId, reviewerIds, category },
    },
  } = ctx;
  const { userId, userDeptId: myUserDeptId } = await ctx.getUserInfo();
  await validateRoleLimit(ctx, {
    ownerId: userId,
    userDeptId: myUserDeptId,
    permissionKey: 'updateThemeGroup',
  });

  await Promise.all([
    validateReviewer(reviewerIds),
    validateThemeCategory(key),
  ]);
  const newCategory = await db.themeCategories.insert({
    name: name,
    key: key,
    userDeptId: ObjectId(userDeptId),
    reviewerIds: reviewerIds,
    category,
    creator: userId,
    createdAt: new Date(),
    lastModified: new Date(),
    deleted: false
  });
  ctx.data(newCategory);
});

/**
 * @api       {post}  /api/themes/categories/:category  在对应类型中新增主题
 * @apiName   CreateThemeInCategory
 * @apiGroup  Theme
 *
 * @apiDescription  在对应类型中新增主题
 *
 * @apiSuccess (200) {Number}    errno      错误讯息代号
 * @apiSuccess (200) {String}    msg        可读性较好的错误讯息
 * @apiSuccess (200) {Object}    data       回传数据
 * @apiSuccess (200) {Object[]}  data.list  主题列表
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {
 *              "theme": {...},
 *          }
 *       }
 *
 */
router.post('/theme-groups/:groupId', async (ctx) => {
  const {
    params: { groupId },
    request: {
      body: {
        name,
        layout,
        pageData,
        themeType,
        client,
        userDeptId,
        application,
        componentPlat,
        ruleId,
        miniProgramId
      },
    },
  } = ctx;
  const { userId } = await ctx.getUserInfo();
  const projectPageData = pageData ? JSON.parse(pageData) : '';
  if(projectPageData && projectPageData.editorType == 'project') {
    // 将项目设置为模板角色校验
    const { creator, userDeptId: ownerUserDeptId } = await db.themeGroups.findOne({ _id: ObjectId(groupId) });
    try { await validateRoleLimit(ctx, { ownerId: creator, userDeptId: ownerUserDeptId, permissionKey: 'saveProjectToTheme', permissionGroupKey: 'managerAllProject' }); } catch (error) { return; }
  } else {
    // 新增模板角色校验
    const { creator, userDeptId: ownerUserDeptId } = await db.themeGroups.findOne({ _id: ObjectId(groupId) });
    try { await validateRoleLimit(ctx, { ownerId: creator, userDeptId: ownerUserDeptId, permissionKey: 'addTheme' }); } catch (error) { return; }
  }
  const { project } = await createProject(userId, {
    pageCount: 1,
    name,
    roleId: undefined,
    parentId: undefined,
    themeId: undefined,
    layout,
    type: 'theme',
    groupId,
    origin: themeType,
    userDeptId,
    pageData: pageData ? JSON.parse(pageData) : pageData,
    client,
    application,
    componentPlat,
    ruleId,
    miniProgramId
  });

  await db.themeGroups.update({ _id: ObjectId(groupId) }, {
    $inc: { 'metadata.count': 1 },
  });

  ctx.data({ project });
});


/**
 * @api       {delete}  /api/themes/categories/:category  删除群组
 * @apiName   DeleteThemeGroup
 * @apiGroup  Theme
 *
 * @apiDescription  删除群组指定主题群组
 *
 * @apiSuccess (200) {Number}    errno      错误讯息代号
 * @apiSuccess (200) {String}    msg        可读性较好的错误讯息
 * @apiSuccess (200) {Object}    data       回传数据
 * @apiSuccess (200) {Object[]}  data.list  主题列表
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {
 *              "list": [],
 *          }
 *       }
 *
 */
router.delete('/theme-groups/:groupId', async (ctx) => {
  const {
    params: { groupId },
  } = ctx;
  const themeGroupObjectId = ObjectId(groupId);
  const now = new Date();
  // 删除模板类型校验
  const { creator, userDeptId: ownerUserDeptId } = await db.themeGroups.findOne({ _id: ObjectId(groupId) });
  try { await validateRoleLimit(ctx, { ownerId: creator, userDeptId: ownerUserDeptId, permissionKey: 'deleteThemeGroups' }); } catch (error) { return; }
  const [theme] = await Promise.all([
    db.themes.update(
      { themeGroupId: themeGroupObjectId },
      {
        $set: {
          themeGroupId: null,
          lastModified: now,
          deleted: true,
        },
      },
      { multi: true },
    ),
    db.themeGroups.update(
      { _id: themeGroupObjectId },
      {
        $set: {
          lastModified: now,
          deleted: true,
        },
      }
    )
  ]);

  ctx.data({ theme });
});

/**
 * @api       {put}  /api/themes/theme-groups/:groupId  更新群组信息
 */
router.put('/theme-groups/:groupId', async (ctx) => {
  const {
    params: { groupId },
    request: { body },
  } = ctx;
  const { name, weight } = body;
  const themeGroupObjectId = ObjectId(groupId);
  // 重命名模板组校验
  const { creator, userDeptId: ownerUserDeptId } = await db.themeGroups.findOne({ _id: ObjectId(groupId) });
  try { await validateRoleLimit(ctx, { ownerId: creator, userDeptId: ownerUserDeptId, permissionKey: 'renameThemeGroups' }); } catch (error) { return; }
  await db.themeGroups.update({
    _id: themeGroupObjectId,
  },
  {
    $set: {
      lastModified: new Date(),
      name: name,
      weight: Number(weight)
    }
  },
  {
    upsert: true
  });

  ctx.data(null);
});

/**
 * @api       {get}  /api/themes/:groupId?  获取主题列表
 * @apiName   GetThemeList
 * @apiGroup  Theme
 *
 * TODO 改为 /api/themes/theme-groups/:group
 * @apiDescription  获取主题列表。请求可能会带上不同的过滤条件，根据给定的条件回传符合条件的
 * 主题项
 *
 * @apiSuccess (200) {Number}    errno      错误讯息代号
 * @apiSuccess (200) {String}    msg        可读性较好的错误讯息
 * @apiSuccess (200) {Object}    data       回传数据
 * @apiSuccess (200) {Object[]}  data.list  主题列表
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {
 *              "list": [],
 *          }
 *       }
 *
 */
router.get('/:groupId?', async (ctx) => {
  const {
    query: {
      currentPage: currentPageString,
      pageSize: pageSizeString,
      themeGroup: themeGroupId,
      search: searchString,
      auditStatus,
    },
  } = ctx;
  const { userId } = await ctx.getUserInfo();
  const currentPage = (currentPageString && parseInt(currentPageString, 10)) || 0;
  const pageSize = (pageSizeString && parseInt(pageSizeString, 10)) || Number.MAX_VALUE;
  const search = (searchString || '').trim();
  // 首页改版 模板分组列表， 我的收藏列表， 优秀推荐列表，模板搜索列表
  let $and = [];
  const mycollectionThemes = (await db.users.findOne({ userId })).themes || [];

  if(themeGroupId) {
    if(themeGroupId == 'mycollection') { // 我的收藏列表
      if(mycollectionThemes.length > 0) {
        let $or = [];
        mycollectionThemes.forEach(item => {
          $or.push({ '_id': ObjectId(item) });
        });
        $or.length > 0 && $and.push({ $or });
      }else {
        return ctx.data({});
      }
    } else if(themeGroupId == 'recommend') { // 优秀推荐列表
      if(search) {
        let $or = [];
        search.split(',').forEach(item => {
          $or.push({ '_id': ObjectId(item) });
        });
        $or.length > 0 && $and.push({ $or });
      }else {
        return ctx.data({});
      }
    } else {
      let $or = [];
      themeGroupId.split(',').forEach(item => {
        $or.push({ 'themeGroupId': ObjectId(item) });
      });
      $or.length > 0 && $and.push({ $or });
    }
  }
  if (themeGroupId != 'recommend' && search) {
    let $or = [];
    if (isValidObjectId(search)) {
      $or = [
        { '_id': ObjectId(search) }
      ];
    } else {
      $or = [
        { 'title': { $regex: search } },
        { 'name': { $regex: search } },
        { 'ownerId': { $regex: search } }
      ];
    }
    $or.length > 0 && $and.push({ $or });
  }
  // 查看所有未审核模板权限校验
  let managerThemeAll = await ctx.validateRoleLimit('managerThemeAll');
  if(managerThemeAll.value && auditStatus) {
    let $or = [];
    auditStatus.split(',').forEach(item => {
      $or.push({ 'auditStatus': Number(item) });
    });
    $or.length > 0 && $and.push({ $or });
  } else if(!managerThemeAll.value) { // 无查看未审核模板权限
    if(!auditStatus || auditStatus == '0,1,2,3') { // 全部
      let $or = [ { auditStatus: 2 }, {
        '$or': [{ auditStatus: 0 }, { auditStatus: 1 }, { auditStatus: 3 }],
        '$and': [ { ownerId: userId } ]
      }];
      $and.push({ $or });
    }else if(auditStatus == '1') { // 审核中
      let $or = [ {
        '$or': [{ auditStatus: 1 }],
        '$and': [ { ownerId: userId } ]
      }];
      $and.push({ $or });
    }else if(auditStatus == '0,3') { // 待审核
      let $or = [ {
        '$or': [{ auditStatus: 0 }, { auditStatus: 3 }],
        '$and': [ { ownerId: userId } ]
      }];
      $and.push({ $or });
    }else if(auditStatus == '2') { // 已审核
      let $or = [ { auditStatus: 2 }];
      $and.push({ $or });
    }
  }
  let match = { deleted: false };
  if($and.length > 0) {
    match.$and = $and;
  }
  const [{
    count: [countResult],
    list: themeList,
  }] = await db.themes.aggregateCursor(
    { $match: match },
    { $sort: { lastModified: -1 } },
    {
      $facet: {
        count: [{ $count: 'count' }],
        list: [
          { $skip: Math.max(currentPage - 1, 0) * pageSize },
          { $limit: pageSize },
        ],
      }
    }
  );
  const totalCount = countResult ? countResult.count : 0;
  // 增加是否已收藏字段
  themeList.forEach(theme => {
    theme.collected = (mycollectionThemes || []).includes(theme._id.toString());
  });
  ctx.data({
    list: themeList,
    total: Math.ceil(totalCount / pageSize)
  });
});

/**
 * @api       {delete}  /api/themes/:themeId  删除主题
 * @apiName   DeleteTheme
 * @apiGroup  Theme
 *
 * @apiDescription  删除选定主题
 *
 * @apiSuccess (200) {Number} errno    错误讯息代号
 * @apiSuccess (200) {String} msg      可读性较好的错误讯息
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *       }
 *
 */
router.delete('/:themeId', async (ctx) => {
  const {
    request: {
      body: { userDeptId },
    },
    params: { themeId }
  } = ctx;

  const { userId } = await ctx.getUserInfo();
  const { ownerId } = await db.themes.findOne({ _id: ObjectId(themeId) });
  try { await validateRoleLimit(ctx, { ownerId, userDeptId, permissionKey: 'deleteTheme' }); } catch (error) { return; }
  await validateThemeWriteAccess(userId, themeId);
  const now = new Date();
  const query = { _id: ObjectId(themeId) };
  const theme = await db.themes.findOne(query);
  const promises = [db.themes.update(
    query,
    {
      $set: {
        deleted: true,
        lastModified: now,
      },
    }
  )];

  if (theme.themeGroupId) {
    promises.push(db.themeGroups.update({ _id: theme.themeGroupId }, {
      $inc: { 'metadata.count': -1 },
    }));
  }

  await Promise.all(promises);

  ctx.data(null);
});
/**
 * @api       {delete}  /api/themes/theme-category/:category  删除模板类型
 * @apiName   DeleteCategory
 * @apiGroup  Categor
 *
 * @apiDescription  删除选定模板类型
 *
 * @apiSuccess (200) {Number} errno    错误讯息代号
 * @apiSuccess (200) {String} msg      可读性较好的错误讯息
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *       }
 *
 */
router.delete('/theme-category/:category', async (ctx) => {
  const {
    params: { category: categoryId }
  } = ctx;
  // 删除模板类型角色校验
  const { userDeptId } = await db.themeCategories.findOne({ _id: ObjectId(categoryId) });
  try { await validateRoleLimit(ctx, { ownerId: '', userDeptId, permissionKey: 'updateThemeGroup' }); } catch (error) { return; }
  const query = { _id: ObjectId(categoryId) };
  // 查询模板类别
  const themeCategory = await validateThemeCategoryId(categoryId);
  const now = new Date();

  // 根据模板类别查找模板组
  const themesGroups = await db.themeGroups.aggregateCursor(
    { $match: { category: themeCategory.key, userDeptId: ObjectId(themeCategory.userDeptId) } },
    { $sort: { lastModified: -1 } }
  );
  // 遍历模板组，修改模板组里面theme的themeGroupId 设置deleted为true， 删除模板组
  await Promise.map(themesGroups, async (group) => {
    const themeGroupObjectId = ObjectId(group._id);
    // 去掉themeGroup 里面theme的themeGroupId 设置deleted为true
    await Promise.all([
      db.themes.update(
        { themeGroupId: themeGroupObjectId },
        {
          $set: {
            themeGroupId: null,
            'revisionData.themeGroupId': null,
            lastModified: now,
            deleted: true,
          },
        },
        { multi: true }
      ),
      db.themeGroups.update(
        { _id: themeGroupObjectId },
        {
          $set: {
            lastModified: now,
            deleted: true,
          },
        }
      )
    ]);
    return null;
  });
  const deleteCategoriesResult = await db.themeCategories.update(
    { ...query },
    {
      $set: {
        lastModified: now,
        deleted: true,
      },
    }
  );
  ctx.data(deleteCategoriesResult);
});

// 修改模板类型名称

router.put('/theme-category/:category', async (ctx) => {
  const {
    params: { category },
    request: { body: { name, reviewerIds } }
  } = ctx;
  const categoryObjectId = ObjectId(category);
  // 修改模板类型角色校验
  const { userDeptId } = await db.themeCategories.findOne({ _id: ObjectId(category) });
  await validateRoleLimit(ctx, { ownerId: '', userDeptId, permissionKey: 'renameThemeGroups' });
  // 审核者校验
  await validateReviewer(reviewerIds);
  await validateThemeCategoryId(category);
  const result = await db.themeCategories.update({
    _id: categoryObjectId,
  }, {
    $set: {
      lastModified: new Date(),
      name: name,
      reviewerIds: reviewerIds || []
    }
  });
  ctx.data(result);
});

// 收藏模版/取消收藏
/**
 * @apiParams   action: 'collect', 'cancel'
 */
router.post('/collect', async (ctx) => {
  const {
    request: { body: { themeId, action } }
  } = ctx;
  const { userId } = await ctx.getUserInfo();
  const isInvalid = await db.themes.findOne({ _id: ObjectId(themeId) });
  if (!isInvalid) {
    throw new InvalidParameterError('没有查找到模板');
  }
  let { themes = [] } = await db.users.findOne({ userId });
  if(action == 'collect') {
    if(themes.includes(themeId)) {
      throw new InvalidParameterError('您已收藏该模板');
    }
    themes.push(themeId);
  }else if(action == 'cancel') {
    if(!themes.includes(themeId)) {
      throw new InvalidParameterError('您还未收藏该模板');
    }
    themes = themes.filter(theme => theme != themeId);
  }
  await db.users.update({
    userId,
  }, {
    $set: {
      themes: themes
    }
  });
  ctx.data({});
});
// 更新模板信息
router.put('/theme/:themeId', async (ctx) => {
  const {
    params: { themeId },
    request: { body: { themeType, themeGroupId } }
  } = ctx;
  const { userDeptId } = await ctx.getUserInfo();
  const { ownerId } = await db.themes.findOne({ _id: ObjectId(themeId) });
  try { await validateRoleLimit(ctx, { ownerId, userDeptId, permissionKey: 'removeTheme' }); } catch (error) { return; }
  await db.themes.update(
    { _id: ObjectId(themeId) },
    {
      $set: {
        origin: themeType,
        themeGroupId: ObjectId(themeGroupId),
        lastModified: new Date(),
      },
    }
  );
  ctx.data(null);
});

module.exports = router;
