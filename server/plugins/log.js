/*
 * @Author: your name
 * @Date: 2020-03-27 21:36:26
 * @LastEditTime: 2020-03-28 00:13:47
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /x-core/server/plugins/log.js
 */
let Promise = require('bluebird');
const DEFAULT_COUNCURRENCY = 4;
const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;

// TODO: 思考 最佳方案，比如 ProjectUtils.createProject 一样，
// 更优雅的保存日志，而非加在 router 中

module.exports = async function (ctx, next) {
  ctx.log = async function (ids, queryAction, params = {}) {
    let { oldName, name, oldUserId, newUserId, toFolderName, toRoleName } =
      params;
    // let requestHead = method.toLowerCase() + ' ' + path;
    // let actionName = logWhiteListMap[requestHead];
    // // 优先进入业务路由
    // await next();
    // NOTE: 这些
    const { userId } = await ctx.getUserInfo();
    const idList = ids instanceof Array ? ids : ids.split(',');
    const projectList = await db.projects.find({
      _id: { $in: idList.map((id) => ObjectId(id)) },
    });
    let action = 'update';
    if (queryAction) {
      action = queryAction;
    }
    const nowDate = new Date();
    let resultObjList = projectList.map((project) => {
      let res = {
        _id: ObjectId(),
        version: '2.0',
        performer: userId, // 操作者
        createdAt: nowDate, // 日期
        itemId: project._id,
        itemType: 'project',
        content: project.revisionData,
        action, // 动作
        args: {},
        ownerId: project.ownerId,
        name: project.name,
      };
      if (toFolderName) {
        res.toFolderName = toFolderName;
      }
      if (toRoleName) {
        res.toRoleName = toRoleName;
      }
      return res;
    });

    let resultObjListData = resultObjList;
    let updatedLogInstances = [];
    if (queryAction == 'rename') {
      resultObjListData = resultObjList.map((item) => {
        item.data = 'From ' + oldName + ' To ' + name;
        return item;
      });
    } else if (queryAction == 'transfer') {
      resultObjListData = resultObjList.map((item) => {
        item.data = 'From ' + oldUserId + ' To ' + newUserId;
        return item;
      });
    }
    updatedLogInstances = await Promise.map(
      resultObjListData,
      (key) => {
        return db.logs.save(key);
      },
      { concurrency: DEFAULT_COUNCURRENCY }
    );

    await Promise.map(
      updatedLogInstances,
      (log) => {
        return db.projects.update(
          { _id: log.itemId },
          { $set: { logId: log._id } }
        );
      },
      { concurrency: DEFAULT_COUNCURRENCY }
    );
  };
  await next();
};
