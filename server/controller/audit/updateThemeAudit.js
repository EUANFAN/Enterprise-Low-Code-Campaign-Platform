const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;
import { AUDIT_STATUS } from '../../constants';
const status = {
  success: 0,
  fail: 1,
};
const result = {
  [status.success]: {
    message: '更新审核通过',
  },
  [status.fail]: {
    message: '更新审核失败',
  },
};
// 模板审核状态更新
module.exports.post = async function (ctx) {
  const {
    request: {
      body: { auditStatus, themeId },
    },
  } = ctx;
  try {
    let count = null;
    if (AUDIT_STATUS.AUDIT_SUCCESS === Number(auditStatus)) {
      const theme = await db.themes.findOne({ _id: ObjectId(themeId) });
      count = theme.approvedCount + 1;
    }
    await db.themes.update(
      { _id: ObjectId(themeId) },
      {
        $set: Object.assign(
          {
            auditStatus: Number(auditStatus),
            auditOperationTime: new Date(),
          },
          count && {
            approvedCount: count,
          }
        ),
      }
    );
    ctx.data(Object.assign({ code: 0 }, result[status.success]));
  } catch (error) {
    ctx.data(Object.assign({ code: 1 }, result[status.fail]));
  }
};
module.exports.auth = false;
