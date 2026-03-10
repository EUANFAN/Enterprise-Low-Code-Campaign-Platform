module.exports = async function (ctx) {
  let query = ctx.request.query;
  let db = global.app.utils.mongo.db();
  // 找到对应组件名称，给该组件对应的count +1
  let component = await db.components.find({
    type: query.type,
  });
  // 更新版本
  await db.components.update(
    {
      type: query.type,
    },
    {
      $set: {
        count: component[0].count ? component[0].count + 1 : 1,
      },
    }
  );
  ctx.data({
    errno: 0,
  });
};

module.exports.auth = true;
