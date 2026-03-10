const { mongo } = global.app.utils;
const ObjectId = mongo.pmongo.ObjectId;
const db = mongo.db();
module.exports = async function (ctx) {
  let query = ctx.request.body;
  let { id, deleted } = query;
  const { value: deleteWidgetValue, deleteWidgetName } =
    await ctx.validateRoleLimit('deleteWidget');
  if (!deleted && !deleteWidgetValue) {
    return ctx.data(null, 'no_permission', `您没有${deleteWidgetName}权限`);
  }
  const { value: restoreWidgetValue, restoreWidgetName } =
    await ctx.validateRoleLimit('restoreWidget');
  if (deleted && !restoreWidgetValue) {
    return ctx.data(null, 'no_permission', `您没有${restoreWidgetName}权限`);
  }
  let res = {};
  res = await db.components.update(
    {
      _id: ObjectId(id),
    },
    {
      $set: {
        isDeleted: deleted ? false : true,
      },
    }
  );
  ctx.data(res);
};
