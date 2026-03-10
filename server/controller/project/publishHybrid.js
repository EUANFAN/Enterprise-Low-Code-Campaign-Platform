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
async function onlineToOffline(
  applicationId,
  projectId,
  url,
  appKey,
  appSecret
) {
  // hp.100tal.com/docsify/#/o2o_api?id=%e5%9c%a8%e7%ba%bf%e8%bd%ac%e7%a6%bb%e7%ba%bfapi%e9%a1%b5%e9%9d%a2%e6%8a%bd%e5%8f%96%e5%88%b0hybrid
  return await app.utils.api({
    method: 'post',
    url: `${process.env.HYBRID_ONLINE_TO_OFFLINE}/hybrid/o2oExtract`,
    data: {
      //   url: 'https://h5.xueersi.com/_online_test_/_test_/60f525b6f136ebd016b20d57.html',
      url,
      id: applicationId, // application id, eg: 576c62cd-5c4e-411b-810d-3f7223a990bd
      appKey: appKey, // appKey
      appSecret: appSecret, // appSecret
      action: 'create', // 当前发布的类型，更新：update, 创建：create, 删除：delete 默认 "create"
      prefixUrl: '', // 应用内的所有url的最大公共子前缀字符串，eg: https://h5.xueersi.com
      ignoreDomains: ['dj.xesimg.com'], // 不想缓存的资源的 域名通配符, eg: ["*.log.xesv5.com", "*.sensor.com"]
      excludeExtensions: ['**.zip', '.map', '.mp4', '.mp3'], // 不想打包哪类资源，就以扩展名表示，默认 [".gz", "txt", "**.zip", ".map"],
      mode: 'history', // 默认 "history"
    },
  });
}
module.exports.post = async function (ctx) {
  let { parms } = ctx.request.body;
  const dbQuery = { projectId: parms.projectId };
  let data = await db.hybridList.findOne(dbQuery);
  if (data) {
    // 调用在线转离线
    let applicationId = data.info.application.application_id;
    let projectId = data.projectId;
    let appKey = data.info.cli.key;
    let appSecret = data.info.cli.secret;
    let onlineToOfflineDdata = await onlineToOffline(
      applicationId,
      projectId,
      parms.url,
      appKey,
      appSecret
    );
    ctx.data(onlineToOfflineDdata);
  } else {
    // 没有存相关的构建信息，说明是老项目，不支持
    ctx.data({ message: '此项目不支持hybrid平台发布' });
  }
};

module.exports.auth = true;
