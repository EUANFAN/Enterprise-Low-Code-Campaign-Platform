const app = global.app;

const { utils } = app;
const db = utils.mongo.db();
// const ObjectId = utils.mongo.pmongo.ObjectId;

/**
 * 创建hybrid平台应用
 *
 * @param  {Object}   ctx  上下文
 * @param  {Function} next 继续执行函数
 */
module.exports.post = async function (ctx) {
  let { parms } = ctx.request.body;
  let hybridInfo = await app.utils.api({
    method: 'post',
    url: `${process.env.HYBRID_URL}/webhook/application/create`,
    data: {
      webview_id: process.env.HYBRID_WEBVIEW_ID,
      app_key: process.env.HYBRID_APP_KEY,
      app_secret: process.env.HYBRID_APP_SECRET,
      name: parms.name,
      can_build: 1,
      can_publish: 1,
      can_rollback: 1,
      can_delete: 1,
      can_read_version: 1,
    },
  });
  let data = {
    projectId: parms.projectId,
    info: hybridInfo.data,
  };
  db.hybridList.save(data);
  // 将这个信息保存起来
  ctx.data({ data });
};

module.exports.auth = true;
