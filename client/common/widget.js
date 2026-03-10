import store from 'store/stage'
import { loadWidgetConfig, WidgetConfigs } from 'widgets'
import { toJS } from 'mobx'
import { context } from 'common/utils'
import { bindOpen } from 'common/editorModals'
import { widgetCount } from 'apis/WidgetAPI'
import BaseTrigger from 'base/trigger'
import { getDefaultClient } from 'common/utils'

const handleAction = (widget, action, payload) => {
  switch (action) {
    case 'modifyWidgetProperty': {
      widget.modify(payload)
      break
    }
    case 'modifyWidgetData': {
      widget.modify(payload, 'data')
      break
    }
    case 'editInRichTextEditor': {
      let stageStore = store.getStageStore()
      stageStore.setRichTextEditorTargetId(payload.widgetId)
    }
  }
}

const insertWidget = async (event, originWidget, count) => {
  console.log('insertWidget', originWidget)
  let config = WidgetConfigs.find((itemConfig) => {
    // prettier-ignore
    return (itemConfig.type === originWidget.type && itemConfig.version === originWidget.version && itemConfig.isLoaded)
  })
  // 如果没有当前版本的组件
  if (!config && originWidget) {
    console.log(`安装${originWidget.version}版本${originWidget.type}`)
    config = await loadWidgetConfig(originWidget)
  }
  if (count) {
    console.log('🚀 ~ file: widget.js ~ line 38 ~ insertWidget ~ count', count)
    widgetCount(originWidget.type)
  }
  const stageStore = store.getStageStore()
  const project = store.getProject()
  const stage = stageStore.getCurrentStage()
  // 获取当前舞台最后一个元素的高度和top值计算下一个元素的top
  let top = 0
  const lastWidget = stage.list[stage.list.length - 1]
  if (lastWidget) {
    // prettier-ignore
    top = (document.querySelector('.widget_' + lastWidget.id)?.offsetHeight || 0) + lastWidget.top
  }

  let options = {
    layout: project.layout,
    top,
    ...toJS(config),
    isInLayer: stage.type === 'layer'
  }
  options.name = config.name
  // 此处生成的 widget对象，merge了三个位置的数据和方法
  // 1. widgets/[type].js 中的组件数据
  // 2. 上方的 options 对象
  // 3. stage.createChild 调用到的 store/clazz/widget 的数据
  // 这里是为了获取原组件的height属性，支持rem格式
  console.log(
    '🚀 ~ file: widget.js ~ line 67 ~ insertWidget ~ options',
    options
  )
  let widget = stage.createChild(options)
  widget.oldHeight = options.height
  const reg = RegExp(/rem/g)
  if (options.height) {
    if (reg.test(options.height)) {
      const num = options.height.substring(0, options.height.indexOf('rem'))
      widget.height = num * 50
    } else {
      widget.height = options.height
    }
  }

  let ctx = context(
    Object.assign(
      {
        widget: widget,
        dispatchAction: (action, payload) => {
          handleAction(widget, action, payload)
        },
        open: bindOpen(widget),
        project,
        containerWidth: stage.component.width,
        page: stageStore.getCurrentPage()
      },
      store
    )
  )
  const addWiget = () => {
    const pageWidget = stage.addChild(widget)
    stage.selectChildren(pageWidget.id)
    setDefaultTrigger(pageWidget)
    return pageWidget
  }
  // 插入阶段
  if (widget.onEnter) {
    const enterResult = widget.onEnter(ctx)
    if (enterResult && enterResult.then) {
      // 只有imgae才有promise才会进入这个if
      enterResult.then((result) => {
        if (result) {
          addWiget()
        }
      })
    } else {
      addWiget()
    }
  } else {
    const pageWidget = addWiget()
    // 组件加入时 页面自动高度自动计算下高度
    let widgetHeight = pageWidget.height
    if (widgetHeight > stage.component.height) {
      stage.component.height = widgetHeight
    }
  }
}

const setDefaultTrigger = (element) => {
  if (element.type === 'HotArea') {
    const stageStore = store.getStageStore()
    const client = getDefaultClient([], 'client')
    const events = BaseTrigger.event.handler('widget')
    const defaultEvent = events && events[0] && events[0].value
    element.addTrigger({
      event: defaultEvent || '',
      client: client
    })
    stageStore.setActiveTab('triggers')
  }
}

export { insertWidget }
