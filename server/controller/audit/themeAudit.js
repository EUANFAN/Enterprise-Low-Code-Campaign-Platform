const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;
const message = app.utils.message;
const Moment = require('moment');
const { AUDIT_STATUS } = require('../../constants');
const md5 = require('md5');

module.exports.post = async function (ctx) {
  const {
    request: {
      body: { auditStatus, workcode, themeId, rejectReason, sign },
    },
  } = ctx;

  const validateSign = md5(
    `${workcode}-${themeId}-ADY3110-${Moment().format('YYYY-MM-DD')}`
  );
  if (validateSign !== sign) {
    ctx.data({}, -1, 'sign不匹配');
    return;
  }
  const user = await db.users.findOne({ workcode: workcode });
  const theme = await db.themes.findOne({ _id: ObjectId(themeId) });
  const isAuditSuccess = AUDIT_STATUS.AUDIT_SUCCESS === Number(auditStatus);
  db.themes.update(
    { _id: ObjectId(themeId) },
    {
      $set: Object.assign(
        {
          auditStatus: Number(auditStatus),
          auditOperationTime: new Date(),
          auditer: user.userId,
        },
        isAuditSuccess && {
          approvedCount: 1,
        }
      ),
    }
  );

  let options, msg;
  // 审核通过
  if (AUDIT_STATUS.AUDIT_SUCCESS === Number(auditStatus)) {
    const time = Moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    options = {
      workcode: theme.commiterWorkCode,
      message: {
        msgtype: 'text',
        text: {
          content: `您的模板审核已通过。审核者：${user.userId}。通过时间：${time}。`,
        },
      },
    };
    msg = '审核通过';
  } else if (AUDIT_STATUS.AUDIT_REJECT === Number(auditStatus)) {
    // 拒绝
    options = {
      workcode: theme.commiterWorkCode,
      message: {
        msgtype: 'text',
        text: {
          content: `您的模板审核已被拒绝。审核者：${user.userId}。 原因：${rejectReason}。`,
        },
      },
    };
    msg = '审核拒绝';
  }
  message.sendNoticeMessage(options);

  ctx.data({}, 0, msg);
};
module.exports.auth = false;
