const checkLogin = require('./checkLogin');
const validateRoleLimit = require('./utils/validateRoleLimit');
const Router = require('koa-router');
const { uniq } = require('lodash');
const { mongo } = global.app.utils;
const db = mongo.db();
const ObjectId = mongo.pmongo.ObjectId;
const router = new Router({ prefix: '/roles' });

router.use(checkLogin);

const getChildrenProjects = async (projectList, project) => {
  if (project.isFolder) {
    const childProjects = await db.projects.find({ parentId: project._id });
    projectList.push(...childProjects);
    return Promise.all(
      childProjects.map((childProject) => {
        return getChildrenProjects(projectList, childProject);
      })
    );
  }
};
router.post('/partner/add', async (ctx) => {
  const {
    request: {
      body: { partnerIdList, projectId },
    },
  } = ctx;
  let projects = await db.projects.find({ _id: ObjectId(projectId) });
  const { ownerId, userDeptId, partner } = projects[0];
  try {
    await validateRoleLimit(ctx, {
      ownerId,
      userDeptId,
      partner,
      permissionKey: 'inviteUserManagerProject',
      permissionGroupKey: 'managerAllProject',
    });
  } catch (error) {
    return;
  }
  await getChildrenProjects(projects, projects[0]);
  await Promise.all(
    projects.map(async (projectData) => {
      if (projectData && !projectData.partner) {
        projectData.partner = [];
      }
      return db.projects.update(
        { _id: projectData._id },
        {
          $set: {
            partner: uniq(projectData.partner.concat(partnerIdList)),
          },
        }
      );
    })
  ).then(() => {
    ctx.data({
      stat: 1,
      msg: '添加成功',
    });
  });
});

router.post('/partner/get', async (ctx) => {
  const {
    request: {
      body: { projectId },
    },
  } = ctx;
  const projects = await db.projects.find({ _id: ObjectId(projectId) });
  const { partner } = projects[0];
  ctx.data({
    stat: 1,
    msg: 'ok',
    partner,
  });
});

router.post('/partner/remove', async (ctx) => {
  const {
    request: {
      body: { partnerId, projectId },
    },
  } = ctx;
  const projects = await db.projects.find({ _id: ObjectId(projectId) });
  await getChildrenProjects(projects, projects[0]);
  await Promise.all(
    projects.map(async (projectData) => {
      if (projectData && !projectData.partner) {
        projectData.partner = [];
      }
      projectData.partner = projectData.partner.filter(
        (item) => item !== partnerId
      );
      return db.projects.update({ _id: projectData._id }, projectData);
    })
  ).then(() => {
    ctx.data({
      stat: 1,
      msg: '移除成功',
    });
  });
});

module.exports = router;
