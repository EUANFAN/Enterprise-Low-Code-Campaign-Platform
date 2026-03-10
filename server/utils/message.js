/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-12-17 20:25:28
 * @LastEditors: jielang
 * @LastEditTime: 2021-04-15 17:17:19
 */
const app = global.app
const sso = app.config.get('sso')
const params = sso.params
const crypto = require('crypto')
const appSecret = 'SEC1de0c6dd01e655d1573245a64535cf2a'
const errAppSecret = 'SECfd32fcd6f56afa12f5586a46297607c6'

function getYachSign(timestamp, appSecret) {
  let stringToSign = timestamp + '\n' + appSecret
  const hmac = crypto.createHmac('sha256', appSecret)
  hmac.update(stringToSign)
  let sign = Buffer.from(hmac.digest()).toString('base64')
  return sign
}

let handerRuleUrl = function (remoteUrl, ruleId) {
  const url = new URL(remoteUrl)
  url.searchParams.set('ruleId', ruleId)
  return url.href
}

async function sendMessage(userId, projectId, project, env) {
  // 只有在线上开启下发
  if (app.env !== 'prod') {
    return
  }

  let message
  if (project.ruleWidget && project.remoteUrl) {
    let { name } = project
    let editRuleUrl = app.utils.urls.editRuleUrl(projectId)
    message = {
      msgtype: 'markdown',
      markdown: {
        title: `${userId} 刚刚发布了项目< ${name} >`,
        text:
          `【发布消息】${userId} 刚刚发布了项目< [${name}](${handerRuleUrl(
            project.remoteUrl,
            projectId
          )}) >\n\n` +
          '【发布消息】线上正式\n\n' +
          '【项目类型】规则项目\n\n' +
          `【编辑地址】[点击进入编辑](${editRuleUrl})\n\n` +
          `【网页标题】${name}\n\n`
      },
      at: {
        isAtAll: true
      }
    }
  }
  if (!project.ruleWidget) {
    let { name, revisionData } = project
    let { title, pages } = revisionData

    let editorUrl = app.utils.urls.editUrl(projectId)
    let dataUrl = app.utils.urls.dataUrl(projectId)
    let onlineUrl = app.utils.urls.onlineUrl(projectId, revisionData, true, env)
    // 有ruleId是发布规则模板，需要拼上ruleId
    project.ruleId && (onlineUrl = handerRuleUrl(onlineUrl, project.ruleId))
    message = {
      msgtype: 'markdown',
      markdown: {
        title: `${userId} 刚刚发布了项目< ${name} >`,
        text:
          `【发布消息】${userId} 刚刚发布了项目< [${name}](${onlineUrl}) >\n\n` +
          `【发布消息】${env == 'online_test' ? '线上测试' : '线上正式'}\n\n` +
          '【项目类型】普通项目\n\n' +
          `【编辑地址】[点击进入编辑](${editorUrl})\n\n` +
          `【数据地址】[点击查看](${dataUrl})\n\n` +
          `【网页标题】${title}\n\n` +
          `【页面数量】${pages.length}个\n\n `
      },
      at: {
        isAtAll: true
      }
    }
  }
  // await app.utils.api({
  //   method: 'post',
  //   url: 'https://oapi.dingtalk.com/robot/send?access_token=a7817df032745d1f3708ffa230b6d0f81af237f41aa198ddda50ad93bbf0f055',
  //   data: message
  // });
  let timestamp = new Date().getTime()
  let sign = getYachSign(timestamp, appSecret)
  await app.utils.api({
    method: 'post',
    url: `https://yach-oapi.zhiyinlou.com/robot/send?access_token=TWpzVXREcFVtSHVvbFplbk5QVTNtKzErL0Qwa3VRUVZXU1BObm1rSW5BMWhwdW9uQ09YZDJIeEQ5Vm5QdGorVQ&timestamp=${timestamp}&sign=${sign}`,
    data: message
  })
}

async function sendErrorMessage(options, err, platform) {
  // 只有在线上开启下发
  if (app.env !== 'prod') {
    return
  }

  platform = platform == 1 ? '客户端' : '服务端'

  let message = {
    msgtype: 'markdown',
    markdown: {
      title: `${platform} 报警`,
      text:
        '\n\n' +
        `【错误类型】< ${platform} > 错误\n\n` +
        `【操作用户】< ${options.userId} >\n\n` +
        `【错误URL】< ${options.url} >\n\n` +
        `【错误详情】${err}\n\n`
    },
    at: {
      isAtAll: true
    }
  }

  let timestamp = new Date().getTime()
  let sign = getYachSign(timestamp, errAppSecret)
  // TODO:后续再加
  await app.utils.api({
    method: 'post',
    url: `https://yach-oapi.zhiyinlou.com/robot/send?access_token=c3hidzEwa0s2NTU0ZWVZR1lNYlZXRWVwWjlsbDZDSEUyVytabGhDbXhkdDI0OHpJL0V2alpNOFVNdG1TZzhMLw&timestamp=${timestamp}&sign=${sign}`,
    data: message
  })
}

async function sendMessageToHybrid(projectId, env) {
  // 只有在线上开启下发
  if (app.env !== 'prod' || env == 'online_test') {
    return
  }
  let message = {
    url: `https://h5.xueersi.com/${projectId}.html`,
    id: projectId
  }
  await app.utils.api({
    method: 'post',
    url: 'http://fe.xesv5.com/api/hybrid/update',
    data: message
  })
}

async function getTicket() {
  const cache = app.utils.cache
  let ticket = await cache.get('ticket')
  if (!ticket) {
    const data = await app.utils.api({
      method: 'get',
      url: `https://api-service.saash.vdyoo.com/basic/get_ticket?appkey=${params.app_key}&appid=${params.app_id}`
    })
    ticket = data.ticket
    await cache.set('ticket', ticket, 7200)
  }
  return ticket
}

// 发送审核消息
// TODO: 需要调整 模板审核
async function sendNoticeMessage(options) {
  // 只有在线上开启下发;
  if (app.env !== 'prod') {
    return
  }
  const ticket = await getTicket()
  let message = {
    msgtype: 'action_card',
    action_card: {
      title: '模板审核通知',
      markdown:
        `【申请人】 ${options.userId}\n\n` +
        `【申请说明】${options.info}\n\n` +
        `【项目地址】[点击查看](http://h5.xueersi.com/${options.themeId}.html${
          options.ruleId ? `?ruleId=${options.ruleId}&type=prod` : ''
        })\n\n`,
      content_title: '模板审核通知',
      btn_json_list: [
        {
          title: '同意',
          action_url: `yach://yach.zhiyinlou.com/session/webview?pc_slide=true&url=${encodeURIComponent(
            `https://h5.xueersi.com/60d091eb6bc52c856c1e37a3.html?auditStatus=2&workcode=${options.workcode}&themeId=${options.themeId}`
          )}`,
          btn_type: 1
        },
        {
          title: '拒绝',
          action_url: `yach://yach.zhiyinlou.com/session/webview?pc_slide=true&url=${encodeURIComponent(
            `https://h5.xueersi.com/60d091eb6bc52c856c1e37a3.html?auditStatus=3&workcode=${options.workcode}&themeId=${options.themeId}`
          )}`,
          btn_type: 1
        }
      ],
      btn_type: 1
    }
  }
  await app.utils.api({
    method: 'post',
    url: 'https://api-service.saash.vdyoo.com/cmpts/msgchl/yach/notice/send',
    data: {
      ticket,
      user_type: 'workcode',
      userid_list: options.workcode,
      message: Buffer.from(
        JSON.stringify(options.message || message),
        'utf-8'
      ).toString('base64')
    }
  })
}

module.exports = {
  sendMessage,
  sendMessageToHybrid,
  sendErrorMessage,
  sendNoticeMessage
}
