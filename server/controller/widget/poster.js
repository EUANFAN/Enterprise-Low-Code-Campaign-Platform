/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-12-07 15:23:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2021-01-12 17:53:42
 */
const { mongo } = global.app.utils;
const ObjectId = mongo.pmongo.ObjectId;
const db = mongo.db();

module.exports = async function (ctx, next) {
  const {
    request: {
      body: { fields, files },
    },
  } = ctx;
  const { widgetId } = fields;
  const { file } = files;
  let uploadResult = await global.app.utils.uploader.uploadFileByPath(
    file.name,
    file.path,
    {
      uploadTo: 'snapshot',
      removeAfterUploaded: true,
    }
  );
  const { errno, data } = uploadResult;
  if (errno) {
    throw new Error(errno);
  }
  let dbQuery = { _id: ObjectId(widgetId) };
  await db.components.update(dbQuery, {
    $set: { widgetUrl: data.file_url_https },
  });
  let result = await db.components.findOne(dbQuery);
  ctx.data(result);
  await next();
};
module.exports.auth = true;
