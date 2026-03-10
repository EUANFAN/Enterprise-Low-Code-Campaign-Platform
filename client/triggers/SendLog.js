/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-06-05 18:23:44
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:02:23
 */
import { getWidgetEventName } from 'common/utils'
export default {
  name: '发送日志',
  type: 'SendLog',
  // 设置触发器执行顺序，之后，99是最大值，值越大，越先执行，没有则为0，优先级排序为稳定排序
  priority: 99,
  data: {
    carryUrlQuery: true
  },
  config: {
    options: {
      text: '参数列表',
      type: 'Set',
      optionsUseData: true
    },
    carryUrlQuery: {
      text: '携带参数',
      msg: '发送日志的时候是否携带当前页面URL中的参数',
      type: 'Radio',
      value: false,
      options: [
        {
          text: '是',
          value: true
        },
        {
          text: '否',
          value: false
        }
      ]
    }
  },
  run(ctx, next) {
    const {
      project,
      useDataValue,
      variableMap,
      page,
      widgetType,
      widgetVersion = ''
    } = ctx
    let data = ctx.trigger.data
    let event = ctx.trigger.event
    let { options } = data
    let format = (options) => {
      let obj = {}
      if (options) {
        Object.keys(options).forEach((key) => {
          const content =
            useDataValue(options[key].value, variableMap, page, project) || ''
          obj[key] = String(content)
        })
      }
      return obj
    }
    options = format(options)
    // 如果选择了需要携带当前参数
    if (data.carryUrlQuery) {
      let query = {}
      location.search
        .replace('?', '')
        .split('&')
        .reduce(function (result, item) {
          let segs = item.match(/(.*?)=(.*)/)
          if (segs && segs[1] != 'token' && segs[1] != 'ntoken') {
            result[segs[1]] = segs[2]
          }
          return result
        }, query)
      Object.assign(options, query)
    }
    // hack 服务端下发日志打在模板上，有就merge然后发出
    if (god.PageData.statistics) {
      Object.assign(options, god.PageData.statistics)
    }

    const logType =
      ctx.project.isUseSensor === 'xeslog'
        ? 'xeslog'
        : ctx.project.sensorBusinessType

    let comLogData = format(ctx.project.comLogData)
    let resetOption = {
      projectid: ctx.project._id,
      originhref: `${god.location.origin}${god.location.pathname}`
    }
    if (logType == 'xeslog') {
      resetOption.widgettype = widgetType
      resetOption.widgetversion = widgetVersion
    }
    ctx.setLogCommonParams(Object.assign(comLogData, resetOption))
    if (event == 'willmount') {
      console.log(
        '🚀 ~ file: SendLog.js ~ line 101 ~ run ~ resetOption',
        resetOption
      )
      console.log('🚀 ~ file: SendLog.js ~ line 101 ~ run ~ options', options)
      console.log(
        '🚀 ~ file: SendLog.js ~ line 101 ~ run ~ ctx.project._id',
        ctx.project._id
      )
      console.log('🚀 ~ file: SendLog.js ~ line 100 ~ run ~ willmount')
      // 如果用户自定义字段中有projectid/originhref，则被覆盖掉
      ctx.sendLoadLog(
        Object.assign({ eventid: ctx.project._id }, options, resetOption),
        logType
      )
      console.log('🚀 ~ file: SendLog.js ~ line 100 ~ run ~ willmount')
    } else {
      ctx.sendClickLog(
        Object.assign(
          { clickid: ctx.trigger.id, action: getWidgetEventName(event) },
          options
        ),
        logType
      )
    }
    setTimeout(function () {
      next()
    }, 300)
  }
}
