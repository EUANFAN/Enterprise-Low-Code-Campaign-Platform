const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
module.exports.getPath = '/bizunit/list';

module.exports.get = async function (ctx, next) {
  const bizunitList = await db.bizunit.find({});
  ctx.body = {
    errno: 0,
    status: 1,
    msg: 'ok',
    data: {
      list: bizunitList,
    },
  };

  await next();
};

module.exports.auth = true;
