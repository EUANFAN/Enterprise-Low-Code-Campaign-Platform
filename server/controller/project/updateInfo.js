// 用于更新项目相关的外部信息，update、rename接口耦合太重，理想状态应该收敛到update接口
// 增量更新
// 1. 名称 name
// 2. 标签 tags
// 3. 时间
const validateRoleLimit = require('../api/utils/validateRoleLimit');
const app = global.app;
let db = app.utils.mongo.db();
let ObjectId = app.utils.mongo.pmongo.ObjectId;

const mergeData = (target, source) => {
  Object.assign(
    target,
    Object.fromEntries(
      Object.entries(source).filter(([, value]) => value !== undefined)
    )
  );
};

module.exports.post = async function (ctx) {
  const {
    params: { id, name, tags, runingEndTime, runingStartTime }
  } = ctx.request.body;
  const query = { _id: ObjectId(id) };
  try {
    const rawData = await db.projects.findOne(query);
    const { ownerId, userDeptId, partner, revisionData } = rawData;
    await validateRoleLimit(ctx, {
      partner,
      ownerId,
      userDeptId,
      permissionKey: 'saveProject',
      permissionGroupKey: 'managerAllProject'
    });

    if (revisionData) {
      mergeData(revisionData, {
        title: name,
        runingEndTime,
        runingStartTime
      });
    }
    mergeData(rawData, { name, tags });
    const result = await db.projects.update(query, { $set: rawData });
    if (!result.errno) {
      ctx.data(
        {
          ...result.data,
          _id: id
        },
        0,
        ''
      );
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports.auth = true;
