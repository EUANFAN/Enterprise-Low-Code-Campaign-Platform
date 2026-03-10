const { mongo } = global.app.utils;
const ObjectId = mongo.pmongo.ObjectId;
module.exports = async function (ctx, next) {
  let query = ctx.request.body;
  let { versionId } = ctx.request.query;
  let db = global.app.utils.mongo.db();
  let dbQuery = {
    _id: ObjectId(query.widgetId),
  };
  let updateObj = { tag: [] };
  if (query.tag) {
    updateObj.tag = query.tag.map((tag) => ObjectId(tag));
  }
  if (query.tagType) {
    updateObj.tagType = query.tagType;
  }
  if (query.userDeptId) {
    updateObj.userDeptId = ObjectId(query.userDeptId);
  }
  if (query.versionId) {
    updateObj.versionId = versionId;
  }
  // TODO 修改所有部门报错
  if (Object.keys(updateObj).length) {
    // 更新版本
    await db.components.update(dbQuery, {
      $set: updateObj,
    });
  }

  // 结果
  let result = await db.components.findOne(dbQuery);
  ctx.data(result);
  await next();
};
module.exports.auth = true;
