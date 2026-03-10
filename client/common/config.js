import { difference, merge } from 'lodash'
import { loadWidgetConfig } from 'widgets'

const NORMAL = {
  page: [
    'pageTitle',
    'name',
    'bgColor',
    'bgImage',
    'bgSizeScale',
    'isFullPage',
    'heightSetting',
    'height'
  ],
  project: [
    'title', // 网页标题
    'keywords', // 网页关键字
    'description', // 网页描述
    'pageTransition', // 页面动效
    'runingStartTime', // 上线时间
    'runingEndTime', // 下线时间
    'isUseSensor', // 日志平台
    'checkLogin' // 检测登录
  ],
  widget: [
    'name',
    'layout',
    'opacity',
    'location',
    'bgColor',
    'bgImage',
    'isFullPage'
  ],
  layer: [
    'name',
    'bgColor',
    'isFullPage',
    'heightSetting',
    'height',
    'bgColor'
  ],
  share: [
    'shareTitle',
    'shareContent',
    'shareUrl',
    'shareImgUrl',
    'menuItem',
    'wxMiniId',
    'wxMiniPath',
    'wxMiniImageUrl'
  ]
}

const getModelConfig = (configList, type, model) => {
  const pureProfessionalList = difference(configList, NORMAL[type] || [])
  const normalList = difference(configList, pureProfessionalList)
  if (model === 'Normal') return normalList
  return configList
}

/* 获取规则配置 */
const getRlueConfig = async (ruleType) => {
  // 通过组件库中规则组件，建立规则；
  const PageData = god.PageData
  if (PageData.project && PageData.project.ruleWidget) {
    const [type, version] = PageData.project.ruleWidget.split('-')
    const info = await loadWidgetConfig({ type, version })
    const { config, data } = info
    return {
      config,
      data
    }
  }
  // 通过项目中的规则模板建立
  return import('../config/rules/' + ruleType + '.js').then((target) => {
    return target.default
  })
}

/* page: 页面类型，编辑页/发布页； */
const getStageConfig = (pageType, projectOrigin = '') => {
  // projectOrigin 是为了在个人中心时区分项目来源
  const PageData = god.PageData
  // 加载 editor 的几种情况 see [doc](doc/tech.md #进入 editor 现在有三种情况)
  const userDept = PageData.userInfo.userDept
  let loaded = false
  if (PageData.isTheme) {
    // 进入到模板的编辑区域，目前的模板氛围两种类型，一种是带规则的模板，一种是以前的模板，走以前的逻辑，如果有模板绑定了规则，走有规则的模板配置文件
    return new Promise((resolve) => {
      import('../config/permission/' + userDept + '/index.js').then(
        (target) => {
          const departmentConfig = target.default //  部门配置

          if (PageData.project.ruleId) {
            import('../config/permission/theme/rule.js').then((target1) => {
              // 模板特性配置
              const themeConfig = merge(departmentConfig, target1.default)
              loaded = true
              resolve({
                loaded: loaded,
                config: themeConfig[pageType]
              })
            })
          } else {
            const origin = PageData.project
              ? PageData.project.origin
              : projectOrigin // 此处的判断是因为在我的项目并没有project
            let fileName = origin ? `${origin}` : 'index'
            import('../config/permission/theme/' + fileName + '.js')
              .then((target1) => {
                // 模板特性配置
                const themeConfig = merge(departmentConfig, target1.default)
                loaded = true
                resolve({
                  loaded: loaded,
                  config: themeConfig[pageType]
                })
              })
              .catch(() => {
                import('../config/permission/theme/index').then((target2) => {
                  const themeConfig = merge(departmentConfig, target2.default)
                  loaded = true
                  resolve({
                    loaded: loaded,
                    config: themeConfig[pageType]
                  })
                })
              })
          }
        }
      )
    })
  } else {
    // 此处的判断是因为在我的项目并没有project
    const origin = PageData.project ? PageData.project.origin : projectOrigin
    let fileName = origin ? `${userDept}/${origin}` : `${userDept}/index`

    return import('../config/permission/' + fileName + '.js')
      .then((target) => {
        loaded = true

        return { loaded, config: target.default[pageType] }
      })
      .catch(() => {
        return import('../config/permission/xw/index').then((target) => {
          loaded = true

          return { loaded, config: target.default[pageType] }
        })
      })
  }
}

export { getModelConfig, getStageConfig, getRlueConfig }
