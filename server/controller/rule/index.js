const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;

module.exports.getPath = '/rule/:itemId';

module.exports.get = async function (ctx, next) {
  const { itemId } = ctx.params;
  if (!ObjectId.isValid(itemId)) {
    await ctx.render('error', {
      status: 404,
      msg: `, 规则ID: ${itemId} 格式错误`,
    });
    // await next();
    return;
  }
  const project = await db.projects.findOne({ _id: ObjectId(itemId) });
  await ctx.render('rule', { project });
  await next();
};

module.exports.auth = true;
