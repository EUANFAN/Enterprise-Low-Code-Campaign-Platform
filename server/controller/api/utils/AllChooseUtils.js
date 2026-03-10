const app = global.app;
const { utils } = app;
const { mongo } = utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;
const getAllChooseResult = async (ctx, noSelectIds, roleId, folderId) => {
  let queryCondition = {};
  if (noSelectIds) {
    queryCondition['_id'] = {
      $nin: noSelectIds.split(/,/).map((id) => ObjectId(id)),
    };
    queryCondition['parentId'] = {
      $nin: noSelectIds.split(/,/).map((id) => ObjectId(id)),
    };
  }
  queryCondition['deleted'] = {
    $ne: true,
  };
  if (roleId === 'my') {
    let userInfo = await ctx.getUserInfo();
    queryCondition['ownerId'] = userInfo.userId;
  }
  if (folderId && folderId != 'undefined') {
    queryCondition['parentId'] = ObjectId(folderId);
  }
  return await db.projects.find(queryCondition);
};
module.exports = getAllChooseResult;
