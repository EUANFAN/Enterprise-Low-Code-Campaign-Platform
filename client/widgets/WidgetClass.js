import React from 'react'
import { getBackgroundImageAttribute } from 'utils/ModelUtils'
import { observer } from 'mobx-react'
import animationStore from 'store/animation'
import { getWidgetConfigByType } from 'widgets'
import { loadWidgetConfig } from './index.js'
import { DEFAULT_PADDING } from 'common/constants'
import { context, getPageById, isIphoneX } from 'common/utils'
import capitalize from 'lodash/capitalize'
import WidgetContent from './WidgetContent'
const ANIMATION_MAP = ['swing', 'pulse', 'bounce', 'shake', 'tada', 'flash']
import { observable, toJS } from 'mobx'
import needObservableChange from 'common/observableChange'
import isEqual from 'lodash/isEqual'
god.React = React
@observer
class WidgetClass extends React.Component {
  state = {
    loaded: false
  }

  constructor(props) {
    super(props)
    this._widgetRef = React.createRef()
  }
  // 本处代码改动涉及到server 端截图
  getAlignStyle(offset) {
    let { widget } = this.props
    let {
      alignLeftMargin,
      alignRightMargin,
      alignTopMargin,
      alignBottomMargin,
      align,
      adaptIphoneX
    } = widget
    let [horizontal, vertical] = align.split('-')
    let style = {}

    let origin = {
      x: 0,
      y: 0
    }
    switch (horizontal) {
      case 'left':
        style.left = 0 + alignLeftMargin + offset
        break
      case 'center':
        // 根据屏幕宽度来定位
        style.left = 0
        style.right = 0
        style.margin = '0 auto'
        break
      case 'right':
        style.right = 0 + alignRightMargin + offset
        origin.x = '100%'
        break
      default:
        break
    }
    switch (vertical) {
      case 'top':
        style.top = 0 + alignTopMargin
        break
      case 'center':
        style.top = 0
        style.bottom = 0
        style.margin = 'auto'
        break
      case 'bottom':
        if (adaptIphoneX && isIphoneX()) {
          if (alignBottomMargin < 0) {
            alignBottomMargin += 34
          } else {
            alignBottomMargin = Math.max(alignBottomMargin, 34)
          }
        }
        style.bottom = 0 + alignBottomMargin
        break
      default:
        break
    }
    return style
  }
  /**
   * 获取组件的样式
   *
   * @param  {Object} widget 组件
   * @return {Object}        组件样式
   */
  getStyle(widget) {
    const { store } = this.props
    let project = store.getProject()
    const {
      bgColor,
      opacity,
      rotate,
      hasBorder,
      hasBorderRadius,
      borderRadiusPosition,
      borderDirections,
      borderColor,
      borderWidth,
      borderStyle,
      borderRadius,
      padding,
      hasShadow,
      shadowStyle,
      shadowColor,
      shadowX,
      shadowY,
      shadowBlur,
      shadowSpread,
      overflowY,
      overflow,
      minHeight
    } = widget
    const fontSize = 13

    let transformAttribute = rotate
      ? {
          transform: 'rotate(' + rotate + 'deg)',
          WebkitTransform: 'rotate(' + rotate + 'deg)'
        }
      : {}
    let style = Object.assign(
      {},
      {
        backgroundColor: bgColor,
        overflow: overflow,
        opacity: opacity / 100,
        boxSizing: 'border-box',
        padding: padding || DEFAULT_PADDING,
        position: 'relative',
        fontSize: `${fontSize}px`
      },
      transformAttribute
    )
    if (widget.triggers && widget.triggers.length) {
      style.cursor = 'pointer'
    }
    if (widget.layout != 'flow') {
      style['overflowY'] = overflowY
    }
    Object.assign(style, getBackgroundImageAttribute(widget, project))
    if (hasBorder) {
      ;(borderDirections || []).forEach((direction) => {
        let processedDirection = capitalize(direction)
        style[`border${processedDirection}Color`] = borderColor
        style[`border${processedDirection}Width`] = borderWidth
        style[`border${processedDirection}Style`] = borderStyle
      })
    }

    if (hasBorderRadius) {
      ;(borderRadiusPosition || []).forEach((direction) => {
        style[`border${direction}Radius`] = borderRadius
        style[`border${direction}Radius`] = borderRadius
        style[`border${direction}Radius`] = borderRadius
        style[`border${direction}Radius`] = borderRadius
      })
    }

    if (hasShadow) {
      style[
        'boxShadow'
      ] = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor} ${
        shadowStyle == 'outset' ? '' : shadowStyle
      }`
    }
    if (
      widget.layout === 'flow' &&
      widget.type != 'Image' &&
      !widget.data.autoHeight
    ) {
      style['minHeight'] = `${minHeight}px`
    }
    return style
  }
  /**
   * 获取组件的动画
   *
   * @param  {string} id 组件的ID
   * @return {Object}    动画属性
   */
  getAnimation(widget) {
    let id = widget.id
    let animationProps = {}
    if (
      animationStore.animation.widgetId &&
      animationStore.animation['widget' + id]
    ) {
      let { animationType, property, propertyValue } =
        animationStore.animation['widget' + id]
      if (animationType === 'property') {
        animationProps.animation = {}
        if (property) {
          if (String(Number(propertyValue)) !== 'NaN') {
            propertyValue = Number(propertyValue)
          }
          animationProps.animation[property] = propertyValue
        }
      } else {
        // zhangyan 这里加上一个map表
        let selectAnimation = animationStore.animation['widget' + id]
        let { type, scene } = selectAnimation
        if (ANIMATION_MAP.indexOf(type) > -1) {
          animationProps.animation = `callout.${type}`
        } else {
          animationProps.animation = `transition.${type}${scene}`
        }
      }
      animationProps.duration = animationStore.animation['widget' + id].duration
      animationProps.delay = animationStore.animation['widget' + id].delay
      animationProps.loop = animationStore.animation['widget' + id].loop
      animationProps.scene = animationStore.animation['widget' + id].scene
    }
    return animationProps
  }

  /**
   * 获取组件的内容
   * @param  {string} type    组件类型
   * @param  {string} version 组件版本
   * @return {Object}         组件内容
   */
  getWidgetContent(type, version) {
    let widgetConfig = getWidgetConfigByType(type, version)
    // WARNING: 之前这里会阻止 RichTextEditor 存在时更新目标的 RichText 组件以避免
    // 重复渲染，但为了实作自动调整高度，我们先将这个功能拿掉，以达到更好的完整性
    return (
      this.state.loaded &&
      widgetConfig &&
      widgetConfig.onRender && (
        <WidgetContent
          ctx={this.ctx}
          widgetConfig={widgetConfig}
          scene={this.scene}
        />
      )
    )
  }
  /**
   * 即将装载组件钩子
   *
   * @return {Promise} [description]
   */
  async UNSAFE_componentWillMount() {
    let { widget, store, container, fromLayer, variableMap } = this.props
    // 由于store不同，ctx一定要重新获取project
    this.ctx = context(
      Object.assign(
        {
          widgetRef: this._widgetRef,
          dispatchAction: this._handleAction,
          widget,
          fromLayer: fromLayer,
          container,
          // open: bindOpen(widget),
          project: store.getProject(),
          variableMap: variableMap,
          page: getPageById(widget.path.split('-')[0])
        },
        store,
        this.EditorBridge || {}
      )
    )
    this.state.variableMap = variableMap
    this.state.version = widget.version
    // 外部组件选择日志平台
    let widgetConfig = getWidgetConfigByType(widget.type, widget.version)
    if (!widgetConfig || (widgetConfig && !widgetConfig.onRender)) {
      await loadWidgetConfig(widget)
    }
    this.setState({
      loaded: true
    })
  }

  /**
   * 装载组件后, 调用引入组件的钩子
   */
  async componentDidMount() {}

  /**
   * 组件即将卸载时的钩子
   */
  componentWillUnmount() {}
  /**
   * 组件更新时的钩子
   */
  UNSAFE_componentWillUpdate(nextProps) {
    let { widget, variableMap } = nextProps
    if (widget.version != this.state.version) {
      this.setState({
        version: widget.version,
        loaded: false
      })
      setTimeout(() => {
        this.ctx.widget = widget
        this.setState({
          loaded: true
        })
      }, 10)
    } else {
      // 希望做到组件内给widget.data.xx下新增属性，可以监听
      if (!god.inEditor && needObservableChange(widget.data)) {
        this.ctx.widget.data = observable(toJS(widget.data))
      }
    }
    if (!isEqual(toJS(variableMap), toJS(this.state.variableMap))) {
      this.setState({
        variableMap,
        loaded: false
      })
      setTimeout(() => {
        this.ctx.variableMap = variableMap
        this.setState({
          loaded: true
        })
      }, 10)
    }
  }
}

export default WidgetClass
