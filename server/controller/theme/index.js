module.exports.getPath = '/theme(/.*)?'

// module.exports.get = async (ctx, next) => {
module.exports.get = async (ctx) => {
  // TODO: 暂时关闭模板中心，后续修复后打开.
  ctx.redirect('/projects/my')
  // const { value, name } = await ctx.validateRoleLimit('themesCenter')
  // if (!value) {
  //   return ctx.render('error', {
  //     status: 403,
  //     msg: `您没有${name}访问权限`
  //   })
  // }
  // await ctx.render('theme')
  // await next()
}

// module.exports.auth = true
