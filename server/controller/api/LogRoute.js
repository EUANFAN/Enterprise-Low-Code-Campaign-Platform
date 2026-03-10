/*
 * @Author: your name
 * @Date: 2020-03-27 21:36:26
 * @LastEditTime: 2020-03-28 00:13:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /x-core/server/controller/api/LogRoute.js
 */
const Router = require('koa-router');
const router = new Router({ prefix: '/logs' });
const { mongo } = global.app.utils;
const db = mongo.db();
const { ObjectId } = mongo.pmongo;

router.get('/all', async (ctx, next) => {
  const { query } = ctx;
  const pageSize = parseInt(query.pageSize, 10);
  const current = parseInt(query.current);
  const projectId = ObjectId(query.projectId);
  let count = await db.logs.find({ itemId: projectId }, {}).count();
  let logs = await db.logs
    .find(
      { itemId: projectId },
      {
        performer: 1,
        createdAt: 1,
        action: 1,
        ownerId: 1,
        toFolderName: 1,
        toRoleName: 1,
      }
    )
    .sort({ createdAt: -1 })
    .skip((current - 1) * pageSize)
    .limit(pageSize);
  ctx.data({
    list: logs,
    total: Math.ceil(count / pageSize),
  });
  await next();
});
module.exports = router;
