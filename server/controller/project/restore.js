/*
 * @Author: your name
 * @Date: 2020-03-27 21:36:26
 * @LastEditTime: 2020-03-28 00:15:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /x-core/server/controller/project/restore.js
 */
const { PermissionDeniedError } = require('../../errors');
const app = global.app;
const db = app.utils.mongo.db();
const ObjectId = app.utils.mongo.pmongo.ObjectId;

module.exports = async function (ctx) {
  const {
    request: {
      body: { id: projectId, logId },
    },
  } = ctx;

  const log = await db.logs.findOne({ _id: ObjectId(logId) });

  let result = null;
  if (log) {
    if (log.action == 'trans') {
      throw new PermissionDeniedError(
        '项目转移不允许回滚，请直接使用项目转移功能'
      );
    }
    if (log.action == 'move') {
      throw new PermissionDeniedError(
        '项目移动不允许回滚，请直接使用项目移动功能'
      );
    }
    result = await db.projects.update(
      { _id: ObjectId(projectId) },
      {
        $set: {
          revisionId: log._id,
          revisionData: log.content,
          name: log.name,
        },
      }
    );
  }

  ctx.data(result);
};

module.exports.auth = true;
