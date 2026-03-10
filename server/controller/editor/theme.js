const { validateThemeWriteAccess } = require('../api/utils/ThemeUtils');
const validateRoleLimit = require('../api/utils/validateRoleLimit');
const getInnerWidgets = require('../../common/getInnerWidgets');
const { config, utils } = global.app;
const { mongo } = utils;
const db = mongo.db();
const services = config.get('3rd').services;
const ObjectId = mongo.pmongo.ObjectId;

// 管理员从首页模板的编辑态可进入该路径，用以对 theme 进行编辑
module.exports.getPath = '/editor/theme/:themeId';

module.exports.get = async function (ctx) {
  const {
    params: { themeId },
  } = ctx;
  const { userId } = await ctx.getUserInfo();
  if (!ObjectId.isValid(themeId)) {
    await ctx.render('error', {
      status: 404,
      msg: '模板ID不合法',
    });
    return;
  }
  try {
    let result;
    let permissionUserId;
    try {
      const { ownerId } = await db.themes.findOne({ _id: ObjectId(themeId) });
      permissionUserId = ownerId;
      if (ownerId) {
        // 修改模板角色校验
        const { userDeptId } = await db.users.findOne({ userId: ownerId });
        await validateRoleLimit(
          ctx,
          { ownerId, userDeptId, permissionKey: 'modifyTheme' },
          false
        );
      }
      result = await validateThemeWriteAccess(userId, themeId);
    } catch (err) {
      return ctx.render('error', {
        status: 403,
        msg: `您没有${err.message}访问权限 ${
          permissionUserId ? `请联络 ${permissionUserId} 以取得存取权限` : ''
        }`,
      });
    }

    const project = result && result[1];
    project.editable = true;
    // 获取用户安装组件列表
    let user = await db.users.findOne({
      userId: userId,
    });
    let components = [];
    for (var key in user.components) {
      components.push(key);
    }
    let installedComponents = await db.components.find({
      type: { $in: components },
      isDeleted: {
        $ne: true,
      },
    });
    let installedComponentInfos = {};
    installedComponents.map((component) => {
      let { name, type, category, version, isInner, isCommon, group } =
        component;
      installedComponentInfos[component.type] = {
        name,
        type,
        category,
        version,
        isInner,
        isCommon,
        group,
      };
    });
    const innerWidgets = await getInnerWidgets();

    await ctx.render('editor/edit', {
      innerWidgets,
      title: project.name,
      project: project,
      services: services,
      isTheme: true,
      editorType: 'theme',
      installed: installedComponentInfos,
      client: project.client,
    });
  } catch (error) {
    console.log('error', error);
  }
};

module.exports.auth = true;
