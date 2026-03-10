const app = global.app;

module.exports = async function (ctx, next) {
  let query = ctx.request.query;
  let db = app.utils.mongo.db();
  const { userId } = await ctx.getUserInfo();
  let userQuery = {
    userId: userId,
  };

  let user = await db.users.findOne(userQuery);
  let components = user.components || {};
  const detailComponent = await db.components.findOne({
    type: query.type,
  });
  // 查询components表中的userDeptId， widgetUrl
  const { widgetUrl } = detailComponent;
  // 安装卸载
  let result;
  // 安装
  if (query.setup == 'true') {
    // if (!components[query.type]) {
    components[query.type] = query.version;
    result = await db.users.update(userQuery, {
      $set: {
        components: components,
      },
    });
    result['widgetUrl'] = widgetUrl;
    // }
  } else {
    delete components[query.type];
    result = await db.users.update(userQuery, {
      $set: {
        components: components,
      },
    });
  }
  ctx.data(result);
  await next();
};

module.exports.auth = true;
