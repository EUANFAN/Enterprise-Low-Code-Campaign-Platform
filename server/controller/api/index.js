/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-03-28 00:37:27
 * @LastEditors: jielang
 * @LastEditTime: 2021-04-13 18:26:29
 */
const Router = require('koa-router');
const RoleRoute = require('./RoleRoute');
const UserRoute = require('./UserRoute');
const ProjectRoute = require('./ProjectRoute');

const ThemeRoute = require('./ThemeRoute');
const HomeRoute = require('./HomeRoute');
const ResourceRoute = require('./ResourceRoute');

const ThirdPartyRoute = require('./ThirdPartyRoute');
const DataRoute = require('./DataRoute');
const ErrorNumbers = require('../../constants');
const LogRoute = require('./LogRoute');
const RuleRoute = require('./RuleRoute');
const NoticeRoute = require('./NoticeRoute');

const router = new Router({
  prefix: '/api',
});

router.use(async (ctx, next) => {
  const {
    request: { url },
  } = ctx;
  if (url.indexOf('/api/projects/approcallback') > -1) {
    await next();
    return;
  }
  let logined = await ctx.checkAuthenticate();
  if (!logined) {
    ctx.data(
      {
        redirect: '/logout/index',
      },
      -1,
      ''
    );
  } else {
    try {
      await next();
    } catch (err) {
      // console.error(err);
      await ctx.data(
        null,
        err.errNumber != null ? err.errNumber : ErrorNumbers.UNCATCHED_ERROR,
        err.message
      );
      ctx.throw(err);
    }
  }
});

router.use(ResourceRoute.routes()).use(ResourceRoute.allowedMethods());
router.use(HomeRoute.routes()).use(HomeRoute.allowedMethods());
router.use(ThemeRoute.routes()).use(ThemeRoute.allowedMethods());
router.use(UserRoute.routes()).use(UserRoute.allowedMethods());
router.use(RoleRoute.routes()).use(RoleRoute.allowedMethods());
router.use(ProjectRoute.routes()).use(ProjectRoute.allowedMethods());
router.use(ThirdPartyRoute.routes()).use(ThirdPartyRoute.allowedMethods());
router.use(LogRoute.routes()).use(LogRoute.allowedMethods());
router.use(DataRoute.routes()).use(DataRoute.allowedMethods());
router.use(RuleRoute.routes()).use(RuleRoute.allowedMethods());
router.use(NoticeRoute.routes()).use(NoticeRoute.allowedMethods());

module.exports = router;
