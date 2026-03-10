/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-04-14 18:23:28
 * @LastEditors: jielang
 * @LastEditTime: 2021-04-15 16:26:05
 */

// 路由入口文件
const app = global.app;
let message = app.utils.message;

module.exports.post = async function (ctx) {
  const {
    request: {
      body: {
        options: { url, userId },
        err: stack,
      },
    },
  } = ctx;
  await message.sendErrorMessage({ url, userId }, stack, 1);
  return ctx.data({ stack });
};

module.exports.post.auth = true;
