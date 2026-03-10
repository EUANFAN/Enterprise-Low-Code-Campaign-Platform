const checkLogin = require('./checkLogin');
const Router = require('koa-router');
const Promise = require('bluebird');

const { mongo } = global.app.utils;
const db = mongo.db();
// const ObjectId = mongo.pmongo.ObjectId;
const router = new Router({ prefix: '/home' });
router.use(checkLogin);

/**
 * @api       {get}  /api/home/pages  获取首页类别列表
 * @apiName   GetHomeNavigations
 * @apiGroup  Home
 *
 * @apiDescription  获取首页次级页面资讯，用来提供首页次级导航用。
 *
 * @apiSuccess (200) {Number} errno             Error number or string
 * @apiSuccess (200) {String} msg               Message or error message
 * @apiSuccess (200) {Object} data.category     页面类别列表
 *
 * @apiSuccessExample {json} Success-Response:
 *      {
 *          "errno": 0,
 *          "msg": "ok",
 *          "data": {
 *              "category": [
 *                {
 *                  _id: '', // 部门id
 *                  themeGroupList: [], 类别集合
 *                }
 *              ]
 *           }
 *       }
 *
 */

const COMMON_CATEGORY_PROJECT_PARAMS = {
  name: 1,
  type: 1,
  creator: 1,
  category: 1,
  createdAt: 1,
  lastModified: 1,
  poster: 1,
  userDeptId: 1,
  weight: 1,
};
// 添加 reviewerIds 审核者字段
router.get('/pages', async (ctx) => {
  // let pipeline = [{ $match: { deleted: { $in: [false, null] } } }];
  // pipeline.push({
  //   $group: {
  //     _id: '$userDeptId',
  //     themeGroupList: {
  //       $push: {
  //         name: '$name',
  //         category: '$category',
  //         key: '$key',
  //         userDeptId: '$userDeptId',
  //         _id: '$_id',
  //         creator: '$creator',
  //         createdAt: '$createdAt',
  //         lastModified: '$lastModified'
  //       }
  //     }
  //   }
  // });
  const $match = { deleted: { $in: [false, null] } };
  const { value } = await ctx.validateRoleLimit('chooseBizUnit');
  if (!value) {
    // 切换事业部角色权限校验
    const { userDeptId } = await ctx.getUserInfo();
    $match.userDeptId = userDeptId;
  }
  let category = await db.themeCategories.aggregateCursor(
    { $match },
    {
      $group: {
        _id: '$userDeptId',
        themeGroupList: {
          $push: {
            reviewerIds: '$reviewerIds',
            name: '$name',
            category: '$category',
            key: '$key',
            userDeptId: '$userDeptId',
            _id: '$_id',
            creator: '$creator',
            createdAt: '$createdAt',
            lastModified: '$lastModified',
          },
        },
      },
    }
  );
  await Promise.map(category, async (item) => {
    const { themeGroupList } = item;
    await Promise.map(themeGroupList, async (theme) => {
      const groups = await db.themeGroups.aggregateCursor(
        {
          $match: {
            category: theme.key,
            userDeptId: theme.userDeptId,
            deleted: { $in: [false, null] },
          },
        },
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
              },
            },
          },
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
              defaultThemeId: { $arrayElemAt: ['$publishedThemes._id', 0] },
            },
          },
        },
        { $sort: { lastModified: -1 } }
      );
      theme.groups = groups;
    });
  });
  ctx.data({
    category,
  });
});

module.exports = router;
