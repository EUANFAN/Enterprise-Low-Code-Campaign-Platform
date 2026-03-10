import React from 'react'
import { setEventCallBack, frezzPage } from 'common/utils'
import emitter from 'common/event'
import { observer } from 'mobx-react'
import attributeWhiteMap from 'common/attributeWhiteMap'
@observer
class WidgetContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false
    }
  }

  handlerEventListener = (options, next, listenerName) => {
    const { widgetConfig, ctx } = this.props
    const { widget } = ctx
    widgetConfig.listeners[listenerName].callback.bind(widget)(
      options,
      ctx,
      next
    )
  }

  UNSAFE_componentWillMount() {
    const { widgetConfig, ctx, scene } = this.props
    const { widget } = ctx
    const data = {}
    Object.keys(widget || {}).forEach((attr) => {
      // 如果widgetConfig有，则用widgetConfig，没有，则用默认值
      if (attributeWhiteMap.hasOwnProperty(attr)) {
        widget[attr] =
          widgetConfig[attr] === undefined
            ? attributeWhiteMap[attr]
            : widgetConfig[attr]
      }
    })
    // 外部组件升级后data合并
    for (let key in widgetConfig.data) {
      data[key] =
        widget.data[key] === undefined
          ? widgetConfig.data[key]
          : widget.data[key]
    }
    // 前面new Widget()里data虽然是可监听的对象，但是对新增的属性不会监听。将data重新变为可监听的对象
    widget.modify(data, 'data')
    widget.modify(widgetConfig.listeners || {}, 'listeners') // 组件更新更新listener
    // 处理原有的方法
    for (let key in widgetConfig.methods) {
      Object.assign(widget, {
        [key]: widgetConfig.methods[key].bind(widget)
      })
    }
    // 注册本组件上的监听器, 服务端不去注册
    if (
      scene == 'view' &&
      widgetConfig.listeners &&
      typeof window !== 'undefined'
    ) {
      for (let key in widgetConfig.listeners) {
        emitter.on(key, this.handlerEventListener)
      }
    }
    if (widgetConfig.willMount) {
      try {
        widgetConfig.willMount.bind(ctx.widget)(ctx)
      } catch (err) {
        const error = `${widgetConfig.type}@${widgetConfig.version}willMount ${err}`
        console.error(error)
      }
    }
  }
  componentDidMount() {
    const { widgetConfig, ctx, scene } = this.props
    if (widgetConfig.onMount) {
      try {
        widgetConfig.onMount.bind(ctx.widget)(ctx)
      } catch (err) {
        const error = `${widgetConfig.type}@${widgetConfig.version}onMount ${err}`
        console.error(error)
      }
    }
    if (scene == 'view') {
      if (widgetConfig && widgetConfig.onScroll) {
        setEventCallBack('scroll', widgetConfig.onScroll.bind(ctx.widget))
      }
    }
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const { widgetConfig, ctx } = nextProps
    if (widgetConfig.willUpdate) {
      try {
        widgetConfig.willUpdate.bind(ctx.widget)(ctx)
      } catch (err) {
        const error = `${widgetConfig.type}@${widgetConfig.version}willUpdate ${err}`
        console.error(error)
      }
    }
  }
  componentDidUpdate() {
    const { widgetConfig, ctx } = this.props
    if (widgetConfig.onUpdated) {
      try {
        widgetConfig.onUpdated.bind(ctx.widget)(ctx)
      } catch (err) {
        const error = `${widgetConfig.type}@${widgetConfig.version}onUpdated ${err}`
        console.error(error)
      }
    }
  }
  componentWillUnmount() {
    const { widgetConfig, ctx, scene } = this.props
    if (scene == 'view' && widgetConfig.listeners) {
      for (let key in widgetConfig.listeners) {
        emitter.removeListener(key, this.handlerEventListener)
      }
    }
    if (ctx.widget.isFullPage) {
      frezzPage(false)
    }
    if (widgetConfig.unMount) {
      try {
        widgetConfig.unMount.bind(ctx.widget)(ctx)
      } catch (err) {
        const error = `${widgetConfig.type}@${widgetConfig.version}unMount ${err}`
        console.error(error)
      }
    }
  }

  componentDidCatch() {
    const { ctx, widgetConfig } = this.props
    this.setState({ hasError: true })
    ctx.sendClickLog({
      clickid: 'error',
      widgetName: widgetConfig.name,
      widgetType: `${widgetConfig.type}@${widgetConfig.version}`
    })
  }

  render() {
    const { widgetConfig, ctx } = this.props
    let content = null

    if (this.state.hasError) {
      content = <div className="widget-error">当前组件异常</div>
    } else if (widgetConfig.onRender) {
      try {
        if (ctx.widget.visible) {
          content = widgetConfig.onRender.bind(ctx.widget)(ctx)
        }
      } catch (err) {
        // 服务端不展示组件异常，直接跳过
        if (typeof window == 'undefined') {
          content = <div className="widget-error"></div>
        } else {
          const error = `${widgetConfig.type}@${widgetConfig.version} ${err}`
          console.error(error)
          content = <div className="widget-error">当前组件异常</div>
        }
      }
    }
    return content
  }
}

export default WidgetContent
