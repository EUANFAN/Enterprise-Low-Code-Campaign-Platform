const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();

module.exports.getPath = '/tag/list';

let formatData = (list) => {
  let tagData = {
    common: [],
    custom: [],
  };
  list.forEach((item) => {
    if (item.type == 'common') {
      tagData['common'].push(item);
    } else {
      tagData['custom'].push(item);
    }
  });
  return tagData;
};
module.exports.get = async function (ctx, next) {
  let query = ctx.request.query;
  let dbQuery = {};
  if (query.component) {
    dbQuery['component'] = query.component;
  }
  if (query.type) {
    dbQuery['type'] = query.type;
  }
  let tagList = await db.tags.find(dbQuery);
  tagList = tagList.filter(item => item.name !== '其他').concat(tagList.filter(item => item.name === '其他'));
  ctx.body = {
    errno: 0,
    status: 1,
    msg: 'ok',
    data: {
      list: query.type ? tagList : formatData(tagList),
    },
  };

  await next();
};

module.exports.auth = true;
