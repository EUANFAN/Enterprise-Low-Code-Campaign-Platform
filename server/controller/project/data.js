const app = global.app;
const { mongo } = app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;

module.exports.post = async function (ctx) {
  const { query } = ctx;
  const { id } = query;
  const dbQuery = {
    _id: ObjectId(id),
  };

  const project = await db.projects.findOne(dbQuery);
  ctx.data(project);
};

module.exports.auth = true;
