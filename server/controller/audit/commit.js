const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;
const { AUDIT_STATUS } = require('../../constants');
const validateRoleLimit = require('../api/utils/validateRoleLimit');
const message = app.utils.message;

module.exports.post = async function (ctx) {
  const {
    request: {
      body: { info, ruleId, key, themeId },
    },
  } = ctx;
  const { userId, workcode } = await ctx.getUserInfo();
  const { ownerId } = await db.themes.findOne({ _id: ObjectId(themeId) });
  const { userDeptId } = await db.users.findOne({ userId: ownerId });
  await validateRoleLimit(ctx, {
    ownerId,
    userDeptId,
    permissionKey: 'themeAppro',
  });
  await db.themes.update(
    { _id: ObjectId(themeId) },
    {
      $set: {
        auditStatus: AUDIT_STATUS.AUDITING,
        auditCommitTime: new Date(),
        commiterWorkCode: workcode,
      },
    }
  );
  const categories = await db.themeCategories.findOne({ key });

  const options = {
    userId,
    workcode: categories.reviewerIds.join('|'),
    themeId,
    ruleId,
    info,
  };
  message.sendNoticeMessage(options);
  ctx.data({});
};

module.exports.auth = true;
