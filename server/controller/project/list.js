// let _ = require('lodash');

let _DEFAULT_PAGE_SIZE_ = 20;
let _DEFAULT_PAGE_NUMBER_ = 1;
const app = global.app;
let db = app.utils.mongo.db();
let ObjectId = app.utils.mongo.pmongo.ObjectId;

// 本路径是旧版项目列表页
module.exports.get = async function (ctx) {
  ctx.redirect('/projects');
};

module.exports.getPath = '/project/list/:roleId?';

module.exports.post = async function (ctx, next) {
  let { userLevel, userId } = await ctx.getUserInfo();
  let query = ctx.request.body;

  // 活动activiyId
  let s = query.s || '';
  let groupId = query.groupId;

  // 1. 获取group id 没有则读取全部 file
  // 2. 通过 group id  获取file列表 id
  // 3. 根据 列表id 获取file 列表

  let pageSize = query.pageSize || _DEFAULT_PAGE_SIZE_;
  let pageCurrent = query.current || _DEFAULT_PAGE_NUMBER_;

  let list = [];
  let count = 0;

  // 支持项目name，title 模糊搜索
  // 支持项目 _id，搜索

  let searchQueryArray = [{ name: { $regex: s } }, { title: { $regex: s } }];

  if (ObjectId.isValid(s)) {
    searchQueryArray.push({ _id: ObjectId(s) });
  }

  if (userLevel == 1) {
    searchQueryArray.push({
      ownerId: {
        $regex: s,
      },
    });
  }

  try {
    pageCurrent = +pageCurrent - 1;
    pageSize = +pageSize;

    pageSize = Math.min(pageSize, _DEFAULT_PAGE_SIZE_);
    pageCurrent = Math.max(0, pageCurrent);
  } catch (e) {
    // Do nothing
  }

  let startPageNumber = pageCurrent * pageSize;

  // 没有分组
  if (!groupId) {
    let queryObj = { ownerId: userId };

    if (s) {
      queryObj['$or'] = searchQueryArray;
    }

    if (userLevel == 1) {
      delete queryObj.ownerId;
    }

    let list = await db.projects
      .find(queryObj, { revisionData: 0 })
      .sort({ lastModified: -1 })
      .skip(startPageNumber)
      .limit(pageSize)
      .toArray();

    let count = await db.projects.count(queryObj);

    ctx.body = {
      errno: 0,
      msg: 'ok',
      data: {
        list: list,
        pagination: {
          current: pageCurrent + 1,
          total: count || list.length,
          pageSize: pageSize,
        },
      },
    };

    return;
  }

  let ids = [];

  let queryGroupObj = {
    _id: {
      $in: ids,
    },
  };

  if (s) {
    queryGroupObj['$or'] = searchQueryArray;
  }

  list = await db.projects.find(queryGroupObj).sort({ lastModified: -1 });

  ctx.data({
    list: list,
    pagination: {
      current: pageCurrent + 1,
      total: count || list.length,
      pageSize: pageSize,
    },
  });

  await next();
};

module.exports.auth = true;
