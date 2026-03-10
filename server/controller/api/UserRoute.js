/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:02:09
 */
const checkLogin = require('./checkLogin');
const Router = require('koa-router');

const { mongo } = global.app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;

const router = new Router({ prefix: '/users' });

// Check login in all handlers in this route
router.use(checkLogin);

/**
 * @api       {get}  /api/users/ids  Request all users in database
 * @apiName   GetUserIds
 * @apiGroup  User
 *
 * @apiDescription  Get all the user IDs. This endpoint is provided for
 * autocomplete and try to provide the minimun information of a user.
 * Please also note that this should be the only public API in UserRoute
 *
 * @apiSuccess (200) {Number} errno    Error number or string
 * @apiSuccess (200) {String} msg      Message or error message
 * @apiSuccess (200) {Object} data     List of user ID
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {
 *              "list": [
 *                  "chenbangjing",
 *                  "zhangjiealex"
 *              ]
 *           }
 *       }
 *
 */
router.get('/ids', async (ctx) => {
  const results = await db.users.distinct('userId');
  ctx.data(results);
});
// 获取用户信息
router.post('/info', async (ctx) => {
  const {
    request: {
      body: { userIds },
    },
  } = ctx;
  const userInfo = await db.users.aggregateCursor(
    {
      $match: {
        userId: {
          $in: userIds,
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        userId: '$userId',
        department: '$department',
      },
    },
    {
      $sort: {
        lastLoginDate: -1,
      },
    }
  );
  ctx.data(userInfo);
});
// 获取所有的用户列表
router.get('/list', async (ctx) => {
  const {
    query: { idType, page, pageSize, keyword, userDeptId },
  } = ctx;

  const currentPage = Number(page);
  const currentIdType = Number(idType);
  const currentPageSize = Number(pageSize);
  const { userDeptId: myUserDeptId } = await ctx.getUserInfo();
  let dbQuery = {};
  dbQuery.$and = [];
  if (keyword) {
    dbQuery.$and.push({ userId: { $regex: keyword } });
  }

  // 如果是超管有query.userDeptId，则按照部门查询，如果是部门管理员，按myUserDeptId查询
  // 切换事业部角色权限
  const { value: chooseBizUnitValue } = await ctx.validateRoleLimit(
    'chooseBizUnit'
  );
  // 是否能够管理本事业部所有的项目
  const { value: managerAllProjectValue } = await ctx.validateRoleLimit(
    'managerAllProject'
  );
  if (chooseBizUnitValue && managerAllProjectValue && userDeptId) {
    // 所有事业部
    dbQuery.$and.push({ userDeptId: ObjectId(userDeptId) });
  } else if (managerAllProjectValue) {
    // 本事业部
    dbQuery['userDeptId'] = ObjectId(myUserDeptId);
  }
  !dbQuery.$and.length && delete dbQuery.$and;

  if (currentIdType) {
    dbQuery['status'] = currentIdType;
  }
  const count = await db.users.count(dbQuery);
  const totalPage = Math.ceil(count / currentPageSize);
  const list = await db.users
    .find(dbQuery)
    .sort({
      lastLoginDate: -1,
    })
    .skip((currentPage - 1) * currentPageSize)
    .limit(currentPageSize);
  ctx.data({
    list: list,
    pagination: {
      total: Number(totalPage),
      current: Number(currentPage),
      pageSize: Number(currentPageSize),
    },
  });
});

// 创建新用户, 更新用户权限
// TODO 创建入口已经屏蔽，只可更新操作
router.post('/create', async (ctx) => {
  const {
    request: {
      body: { userId, idType },
    },
  } = ctx;
  // 修改用户信息角色校验
  const { value, name } = await ctx.validateRoleLimit('modifyUserRole');
  if (!value) {
    return ctx.data(null, 'no_permission', `您没有${name}权限`);
  }
  let status = idType * 1;
  if (!status) {
    status = 3;
  }
  const result = await db.users.update(
    { userId: userId },
    {
      $set: {
        status: status,
      },
    },
    {
      upsert: true, // 没有就创建
      multi: false,
    }
  );

  ctx.data(result);
});

// 删除账户
router.delete('/delete/:userId/:id', async (ctx) => {
  const {
    params: { id },
  } = ctx;
  const now = new Date();
  // 修改用户信息角色校验
  const { value, name } = await ctx.validateRoleLimit('modifyUserRole');
  if (!value) {
    return ctx.data(null, 'no_permission', `您没有${name}权限`);
  }
  const userObjectId = ObjectId(id);
  const [result] = await Promise.all([
    db.users.update(
      { _id: userObjectId },
      {
        $set: {
          userId: null,
          lastModified: now,
          deleted: true,
        },
      },
      { multi: true }
    ),
    db.users.remove({ _id: userObjectId }),
  ]);

  return ctx.data({ result });
});

module.exports = router;
