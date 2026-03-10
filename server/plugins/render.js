const fs = require('fs')
const request = require('koa2-request')
const _ = require('lodash')
const template = require('handlebars')
const { getDeptList } = require('../utils/dept')
const app = global.app
const { config, utils } = app
const { urls } = utils
const ico = urls.icoUrl()
const STATIC_URL = urls.STATIC_URL
const H5_URL = urls.H5_URL
const host = config.get('app').host
const { getCategory } = utils.uploader
// 注册equal函数
template.registerHelper('equal', function (param1, param2, opts) {
  if (param1 == param2) return opts.fn(this)
  return opts.inverse(this)
})

/**
 * 渲染模板
 *
 * @param  {string} tpl  模板路径
 * @return {string}      html
 */
const path = require('path')
let readTpl = async function (tpl) {
  let result
  if (app.env == 'dev') {
    let pkg = require('../../package.json')
    let proxyPath = 'http://0.0.0.0:' + pkg.clientPort + '/' + tpl + '.html'
    result = (await request(proxyPath)).body
  } else {
    result = fs.readFileSync(
      path.resolve(__dirname, '../../client/page') + '/' + tpl + '.html',
      'utf-8'
    )
  }

  return result
}

module.exports = async function (ctx, next) {
  ctx.render = async function (tpl, data = {}, useHtml, inPreview = false) {
    let basicData = {
      DOMAIN: host.split('.').slice(-2).join('.'),
      STATIC_URL,
      H5_URL,
      scripts: [],
      lazyloadScripts: [],
      styles: [],
      title: '高效、专业的H5在线制作工具',
      keywords: '',
      description: '',
      inPreview,
      inDev: app.env === 'dev',
      env: app.env,
      category: getCategory(app.env)
    }
    let mainHTML = data.mainHTML || ''
    delete data.mainHTML
    // 调整数据结构，转移
    Object.keys(basicData).forEach(function (item) {
      if (data[item]) {
        basicData[item] = data[item]
        delete data[item]
      }
    })
    let result = await readTpl(tpl)
    // 发布端页面
    if (useHtml) {
      const businessLine = data['businessLine']
        ? data['businessLine']
        : 'xueersi'
      return template.compile(result)(
        _.extend(basicData, {
          PageData: JSON.stringify(_.extend(basicData, data)),
          mainHTML,
          ico: ico[businessLine]
        })
      )
    }

    // 编辑端页面
    const {
      userLevel,
      userId,
      workcode,
      isWxUser,
      userDeptId,
      permission,
      userDept,
      role
    } = await ctx.getUserInfo()
    const permissionList = await ctx.getRolePermissionList(role)
    const deptList = await getDeptList(ctx)
    let renderData = _.extend(basicData, {
      PageData: JSON.stringify(
        _.extend(
          basicData,
          {
            userInfo: {
              userId,
              userLevel,
              workcode,
              isWxUser,
              userDeptId,
              permission,
              userDept,
              permissionList
            },
            deptList
          },
          data
        )
      ),
      ico: ico['editor']
    })
    if (data.status) {
      ctx.status = data.status
    }
    ctx.body = template.compile(result)(renderData)
  }

  await next()
}
