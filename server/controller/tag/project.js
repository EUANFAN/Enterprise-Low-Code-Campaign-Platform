const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();

module.exports.getPath = '/tag/project/list';
module.exports.get = async function (ctx, next) {
  const tagList = await db.projectTags.find({});
  ctx.body = {
    errno: 0,
    status: 1,
    msg: 'ok',
    data: {
      list: tagList
    }
  };

  await next();
};

module.exports.auth = true;
