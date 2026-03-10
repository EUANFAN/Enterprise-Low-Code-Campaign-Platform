const checkLogin = require('./checkLogin');
const Router = require('koa-router');

const { mongo } = global.app.utils;
const db = mongo.db();

const router = new Router({ prefix: '/notices' });
router.use(checkLogin);

// 获取所有的用户列表
router.get('/list', async (ctx) => {
  const {
    query: { page, pageSize },
  } = ctx;
  const currentPage = Number(page);
  const currentPageSize = Number(pageSize);
  let dbQuery = {};
  const count = await db.notices.count(dbQuery);
  const totalPage = Math.ceil(count / currentPageSize);
  const list = await db.notices
    .find(dbQuery)
    .sort({
      lastModified: -1,
    })
    .skip((currentPage - 1) * currentPageSize)
    .limit(currentPageSize);
  list.forEach((item) => {
    item.content = decodeURIComponent(item.content);
  });
  ctx.data({
    list: list,
    pagination: {
      total: Number(totalPage),
      current: Number(currentPage),
      pageSize: Number(currentPageSize),
    },
    now: new Date(),
  });
});

module.exports = router;
