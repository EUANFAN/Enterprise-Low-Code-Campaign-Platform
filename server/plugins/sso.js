const url = require('url')
const request = require('request')
const _ = require('lodash')
const md5 = require('md5')
const app = global.app
const config = app.config
const sso = config.get('sso')
const threerd = config.get('3rd')
let urls = sso.urls
let params = sso.params

/**
 * 登录
 *
 * @param  {string}  path   路径
 * @param  {Boolean} isAjax 是否是ajax请求
 */
let login = function (path, isAjax) {
  if (isAjax) {
    this.data({ redirect: urls.logout }, -1, '请退出重新登录')
  } else {
    // 区分是否为第三方调用
    if (this.isThirdPartyAccess()) {
      this.data({ redirect: urls.logout }, 401, '登录状态失效')
    } else {
      this.redirect(urls.logout)
    }
  }
}
async function getTicket(appkey, appid) {
  return new Promise((resolve) => {
    request.get(
      { url: urls.checkTicket, qs: { appkey: appkey, appid: appid } },
      (error, res, data) => {
        data = JSON.parse(data)
        if (data.errcode === 0) {
          resolve(data.ticket)
        }
      }
    )
  })
}
async function userGet(ticket, workcode) {
  return new Promise((resolve) => {
    request.get(
      {
        url: urls.userGet,
        qs: { user_type: 'workcode', user_id: workcode, ticket }
      },
      (error, res, resData) => {
        if (JSON.parse(resData).errcode === 0) {
          resolve(JSON.parse(resData).data)
        } else {
          resolve(false)
        }
      }
    )
  })
}
/**
 * Get login info from code
 *
 * @param  {string}          code   Code from single sign on
 * @return {Promise<false|Object>}        Promise that resolves login user info of the
 *                                  provided code
 */
async function getLoginInfoFromCode(token, appkey, appid) {
  let ticket = await getTicket(appkey, appid)
  return new Promise((resolve) => {
    request.get(
      {
        url: urls.getVerify,
        qs: {
          token: token,
          ticket
        }
      },
      async (error, res, resData) => {
        const data = (resData && JSON.parse(resData).data) || {}
        if (JSON.parse(resData).errcode === 0) {
          const userData = await userGet(ticket, data.workcode)
          if (userData) {
            let userDept = await app.utils.dept.getUserDeptInfo(
              userData.dept_info[0]?.dept_full_name
            )
            resolve({
              ticket: ticket,
              username: userData.account,
              workcode: userData.workcode,
              department: userData.dept_info[0].dept_full_name,
              userDeptId: userDept.id,
              userDept: userDept.enname || 'xw'
            })
          }
          resolve(false)
        }
        resolve(false)
      }
    )
  })
}

async function getLoginInfoFromAdmin(token) {
  let timesTamp = new Date().getTime()
  let sign = md5(`${params.admin_app_id}&${timesTamp}${params.admin_app_key}`)
  return new Promise((resolve) => {
    request.get(
      {
        url: threerd.adminCheckLogin,
        headers: {
          'X-Auth-Appid': params.admin_app_id,
          'X-Auth-Sign': sign,
          'X-Auth-TimeStamp': timesTamp
        },
        qs: {
          token: token
        }
      },
      (error, res, data) => {
        data = data && JSON.parse(data)
        if (data && data.stat === 1) {
          resolve({
            username: data.data.email.split('@')[0],
            workcode: data.data.adminId,
            ticket: token
          })
        }
        resolve(false)
      }
    )
  })
}

/**
 * Check if the provided ticket is valid
 *
 * @param  {Object}            data    Ticket info
 * @param  {string}            ticket  Ticket
 * @param  {string}            appId   ID of the app which the provided ticket
 *                                     belongs to
 * @return {Promise<boolean>}
 */
function checkTicket() {
  return new Promise(async (resolve) => {
    resolve(true)
  })
}

/**
 * 注销
 *
 * @param  {string} path 路径
 */
let logout = function (path) {
  let urlComponets = url.parse(urls.logout)
  urlComponets.query = _.extend(urlComponets.query || {}, params, {
    jumpto: path
  })
  this.redirect(urls.logout)
}

module.exports = async function (ctx, next) {
  ctx.sso = {
    login: login.bind(ctx),
    logout: logout.bind(ctx),
    getLoginInfoFromCode,
    checkTicket,
    getLoginInfoFromAdmin
  }

  await next()
}
