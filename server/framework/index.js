import Koa from 'koa';
import loader from './loader';
import _ from 'lodash';
import Router from 'koa-router';
import koaHelmet from 'koa-helmet';
import koaBody from 'koa-body';
import path from 'path';
import http from 'http';
require.extensions['.scss'] = function () {
  return null;
};
require.extensions['.css'] = function () {
  return null;
};
require.extensions['.less'] = function () {
  return null;
};
require.extensions['.png'] = function (module, file) {
  return module._compile('module.exports = ""', file);
};
require.extensions['.svg'] = function () {
  return null;
};

require.ensure = function () {};

const BODY_CONFIG = {
  jsonLimit: 5 * 1024 * 1024,
  formLimit: 5 * 1024 * 1024,
  textLimit: 5 * 1024 * 1024,
  multipart: true,
  strict: false,
  formidable: {
    onFileBegin: (fileKey, file) => {
      file.path = path.join(path.dirname(file.path), file.name);
    },
  },
};

const DIRS = {
  CONFIG: 'config',
  CONTROLLER: 'controller',
  PLUGINS: 'plugins',
  UTILS: 'utils',
};

let SERVER_DIR = '';
let hooks = {};

/**
 * 初始化
 *
 * @param  {string} env 环境名称
 */
const initialize = function (env) {
  // TODO REMOVE GLOBAL!!!!!!
  const app = (global.app = new Koa());
  app.env = env;

  SERVER_DIR = 'server/';

  // load config
  app.config = loader.loadConfig([
    process.cwd() + '/' + SERVER_DIR + DIRS.CONFIG + '/' + 'common',
    process.cwd() + '/' + SERVER_DIR + DIRS.CONFIG + '/' + env,
  ]);

  // load utils
  app.utils = loader.loadPlugin(
    process.cwd() + '/' + SERVER_DIR + DIRS.UTILS + '/'
  );

  // load plugins
  const plugins = loader.loadPlugin(
    process.cwd() + '/' + SERVER_DIR + DIRS.PLUGINS + '/'
  );
  const pluginSequence = loader.loadPluginSequence(
    process.cwd() + '/' + SERVER_DIR + DIRS.PLUGINS + '/'
  );
  app.use(koaHelmet());
  app.use(koaBody(BODY_CONFIG));
  Object.keys(plugins).forEach(function (pluginName) {
    if (!~pluginSequence.indexOf(pluginName)) {
      pluginSequence.push(pluginName);
    }
  });
  pluginSequence.forEach(function (pluginName) {
    app.use(plugins[pluginName]);
  });
};

/**
 * router处理
 *
 * @param  {Router}     router     router实例
 * @param  {string}     path       路径
 * @param  {Controller} controller controller
 */
const routerProcessor = function (router, path, controller) {
  if (typeof controller == 'function') {
    router.all(path, controller);
  } else {
    // TODO 未来往 API 与 前端服务器分离，且分为多个 route 各自管理。目前先简单修复
    if (controller.get) {
      router.get(controller.getPath || path, controller.get);
    }

    if (controller.post) {
      router.post(controller.postPath || path, controller.post);
    }
  }
};

function setAPI() {
  const app = global.app;
  const APIRoute = require('../controller/api');
  // 加载子路由
  app.use(APIRoute.routes()).use(APIRoute.allowedMethods());
}

/**
 * 设置路由
 */
const setRouter = function () {
  const app = global.app;
  const router = new Router();
  // load controllers
  const { controllers, regexController } = loader.loadController(
    process.cwd() + '/' + SERVER_DIR + DIRS.CONTROLLER
  );
  router.use(async function (ctx, next) {
    const { request } = ctx;
    const method = request.method.toLowerCase();
    const path = request.path;
    let controller =
      controllers[path] ||
      controllers[path + (/\/$/g.test(path) ? '' : '/') + 'index'] ||
      controllers[path + (/\/$/g.test(path) ? '' : '/') + 'index/index'];
    if (!controller) {
      const regexPairs = regexController[method];

      for (let i = 0; i < regexPairs.length; i++) {
        const { regex, router } = regexPairs[i];
        if (regex && regex.test(path)) {
          controller = router;
        }
      }
    }
    if (controller) {
      var auth = controller.auth;
      if (controller[method] && controller[method].auth !== undefined) {
        auth = controller[method].auth;
      }
      // 不要登录，直接通过
      if (!auth) {
        await next();
        return;
      }
      let loggedIn = await hooks.checkAuth(ctx);
      if (!loggedIn) {
        return ctx.sso.login(ctx.request.url, ctx.isAjax());
      }

      await next();
    }
  });

  _.map(controllers, function (controller, path) {
    routerProcessor(router, path, controller);
    if (/\/index$/.test(path)) {
      routerProcessor(router, path.replace(/\/index$/, ''), controller);
    }
    if (/\/index\/index$/.test(path)) {
      routerProcessor(router, path.replace(/\/index\/index$/, ''), controller);
    }
  });
  // 加载路由中间件
  app.use(router.routes()).use(router.allowedMethods());
};

/**
 * Create an Koa application to be used in http server and testing environment.\
 * @param  {string} env       Environment
 * @return {Koa}               Koa instance
 */
function createApp(env) {
  initialize(env);

  setAPI();
  setRouter(env);

  return global.app;
}

/**
 * 启动
 *
 * @param  {string}     env       环境名称
 * @return {Application}          app
 */
const bootstrap = function (env, useHooks = {}) {
  hooks = useHooks;
  const app = createApp(env);
  const port = app.config.get('app').port || 3000;
  const server = http.createServer(app.callback()).listen(port);

  console.log('listening port: %s', port);
  console.log('visit http://127.0.0.1:%s', port);
  return server;
};

module.exports = {
  // initialize,
  createApp,
  bootstrap,
};

/**
 * TODO：优化 此处的逻辑  把过程写入 doc，然后去除此处的注释
 *
 * 目前的登录过程
 * 如果是请求 page，验证 auth
 * 如果需要 auth 则验证是否有 sessionInfo，
 * 如果没有则
 * 1、跳转 sso
 * 2、sso 跳转 /login 并且带上 code
 * /login 通过 code 请求 api 得到 {errno, data: {username, ticket}}
 * username 就是我们需要的 userId,
 *
 * ticket 用来重复验证是否在有效期，
 * 其中我们做了一步 redis.set(key = ticket string, value = 1, 有效期1小时）
 * 每次检查ticket有效性，先从本地redis.get查询，
 * 如果有，就说明该用户一个小时内登录过，放行
 * 如果本地没有，说明登录超过一个小时了，或者没有登录，但不一定改ticket不合法
 * 我们继续使用该ticket 去server验证是否合法，
 * 如果合法继续使用，如果不合法error
 *
 * 生成 sessionId，写入 ctx.session (使用 koa-session plugin)
 * 通过 koa-session 中的 autoCommit(deafult is true) 参数 决定
 * 每次 session 的修改都会自动保存value session.toJSON() 到 设置的key h5:ssid
 * 这样新的请求发送 cookie 过来时，koa-session 可以把之前写入 cookie 的key
 * 转化成 之前 的 session object
 *
 * 在 redis 中写入 sessionId -> userInfo 以便不同的请求可以通过 sessionId 调用 userInfo
 *
 * 在 mongo 中 查看是否有该 user，没有则写入
 *
 * 在 db.roles 中注册其 个人群组 以便关联个人的项目文件夹、资源文件夹
 *
 * 在 db.groups 中注册 files\themes\projects 群组
 *
 * 3、login 跳转回到 原请求path，
 *
 * 4、原 path 重新验证 auth 通过
 *
 * 如果请求的是接口
 * 1、则在接口调用前，先执行该接口 router.use(checkLogin)
 * 2、checkLogin 验证是否有 sessionId，通过 sessionId 查找 userInfo，复杂过程如上方步骤2
 * 3、userInfo 写入 await ctx.getUserInfo()
 * 4、确保 userId 有各 files、groups等表的item
 * 5、执行接口调用，通过 await ctx.getUserInfo().userInfo 去进行数据查询
 * 6、返回数据
 *
 * > page 请求未登录 -> 跳转sso登录
 * > api 请求未登录 -> 回复 error msg
 */

/**
 * 思考：是否应该在 /login 时 确认 “在 files\groups\projects 表中是否存在”
 * 思考：我们是否存在请求的 page 不需要 auth 的？
 *
 * 思考：是否应该在每次 checkLogin 时确认 “在 files\groups\projects 表中是否存在”
 * 思考：我们的接口请求是否都需要 checkLogin
 */

/**
 * 注释 1：为什么要有在 db.groups 中检查 'project' | 'file' | 'theme'
 *
 * 先说 project
 * db.groups.type = project (也就是 项目文件夹 或者 项目群组)
 * 改版前 project 的逻辑是，
 * 假如一个用户通过sso 登录之后，是可以直接创建项目的，
 * 而创建项目执行的操作是
 *
 * db.groups.query
 * type = project
 * roleId = db.roles.findOne({userId, access: private})._id
 *
 * 然后 update (query result).list
 *
 * 所以，是需要的
 * 但现在 projectFolder 已经不存储在 groups 当中了，
 * 关于 project 的此处的逻辑，是否可以直接去掉，是否会有什么影响？
 * 暂且不说
 *
 * db.groups.type = file
 * 同理，用户想要上传 资源 也一样，
 * 需要在 db.groups 中建立一个 { type = file, roleId }
 * 此处通过 roleId 来区别 资源文件夹所属的个人 或者 群组
 *
 * 为什么要通过 roleId 来区别？
 * 不同用户之间的区分，我们通过 userId 就可以了
 * 但是之前（应该是）因为把三种类型的group 放在同一个 groups 集合中
 *
 * 首先需要另一个参数来区分 同一个用户的不同类型的文件夹
 * 也就是 type
 *
 * 但是在 type = project 时，依然存在 个人群组 和 团体群组
 * 所以需要一个参数来指向 该文件夹 所属的群组
 *
 * 但是假如对 file、project（theme可能不需要）都采用fileSystem 之后
 * 应该是不需要这么麻烦了，
 * 到时候预计，file、fileFolder 会都存储在db.files 集合中
 * 而 project、projectFolder会都存储在db.projects 集合中
 * 同理 theme、themeFolder 都存在 db.themes 集合中
 *
 * 此时，就可以去掉 groups 集合
 * 此时，也就可以去掉 roles.access = private 的逻辑了（ 如何区别每个人的fileFolder，可以考虑使用owner 代替 roleId，来指向个人还是群组，如果是个人，就是只有 owner，没有群组Id，如果有群组ID，就说明该文件夹属于某个群组，但群组依然应该有 owner，也就是 群组管理员。如果人离职就可以把群组转移给其他人，仅仅修改owner就可以了，这样也就意味着一个群组只有一个管理员，这样合理吗？好像也不太合理。所以是否取消owner，改为 creater + admin 的逻辑，admin 为数组）
 * 此时，可以考虑完全取消 access 的逻辑了（在合理的范围内，尽量简化概念）
 * 此时，db.roles 可以考虑更名为 db.groups, 也就是变为真正的群组的概念 (其实，相当于 project\ projectFolder 的逻辑，群组相当于是 user 的集合，类似于 userFolder 的逻辑，所以这些逻辑是否能够统一？)
 *
 */
