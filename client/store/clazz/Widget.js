import { observable } from 'mobx'
import Base from './Base'
import Layer from './Layer'
import Trigger from './Trigger'
import Animation from './Animation'
import history from 'common/record'
import uid from 'uid'
import { modifyAction } from './modifyAction'
import { WIDGETDATA } from 'common/defaultConstant'
class Widget extends Base {
  @observable id = uid(10)
  @observable clazz = WIDGETDATA.clazz
  // 名称
  @observable name = WIDGETDATA.name

  // 类型
  @observable type = WIDGETDATA.type

  // 相对定位方式
  @observable location = WIDGETDATA.location

  // 排列方式
  @observable align = WIDGETDATA.align
  // 边距
  @observable alignLeftMargin = WIDGETDATA.alignLeftMargin
  @observable alignRightMargin = WIDGETDATA.alignRightMargin
  @observable alignTopMargin = WIDGETDATA.alignTopMargin
  @observable alignBottomMargin = WIDGETDATA.alignBottomMargin

  // 尺寸
  @observable width = WIDGETDATA.width
  @observable height = WIDGETDATA.height

  // 位置
  @observable top = WIDGETDATA.top
  @observable left = WIDGETDATA.left

  // 旋转
  @observable rotate = WIDGETDATA.rotate

  // 背景颜色
  @observable bgColor = WIDGETDATA.bgColor

  // 背景图片
  @observable bgImage = WIDGETDATA.bgImage

  // 背景图片位置
  @observable bgImagePosition = WIDGETDATA.bgImagePosition

  // 背景图片位置
  @observable bgImageRepeat = WIDGETDATA.bgImageRepeat

  @observable bgSize = WIDGETDATA.bgSize
  @observable bgSizeScale = WIDGETDATA.bgSizeScale

  // 是否必要
  @observable required = WIDGETDATA.required

  // 可视
  @observable visible = WIDGETDATA.visible

  // 数据
  @observable data = observable({})

  // 动画
  @observable animations = observable([])

  // 触发器
  @observable triggers = observable([])

  // 是否选择
  @observable isSelected = WIDGETDATA.isSelected

  // 布局
  @observable layout = WIDGETDATA.layout

  // 所属页面宽度
  @observable pageWidth = WIDGETDATA.pageWidth

  // 所属页面高度
  @observable pageHeight = WIDGETDATA.pageHeight

  // 不透明度
  @observable opacity = WIDGETDATA.opacity

  // 是否溢出滚动

  @observable overflowY = WIDGETDATA.overflowY

  // 是否有边框
  @observable hasBorder = WIDGETDATA.hasBorder

  // 边框样式
  @observable borderStyle = WIDGETDATA.borderStyle

  // 边框宽度
  @observable borderWidth = WIDGETDATA.borderWidth

  // 边框颜色
  @observable borderColor = WIDGETDATA.borderColor

  // 边框颜色
  @observable borderDirections = WIDGETDATA.borderDirections

  // 圆角
  @observable hasBorderRadius = WIDGETDATA.hasBorderRadius
  @observable borderRadiusPosition = WIDGETDATA.borderRadiusPosition
  @observable borderRadius = WIDGETDATA.borderRadius

  // 是否有阴影
  @observable hasShadow = WIDGETDATA.hasShadow

  // 阴影样式
  @observable shadowStyle = WIDGETDATA.shadowStyle

  // 水平阴影
  @observable shadowX = WIDGETDATA.shadowX

  // 垂直阴影
  @observable shadowY = WIDGETDATA.shadowY

  // 阴影模糊距离
  @observable shadowBlur = WIDGETDATA.shadowBlur

  // 阴影尺寸
  @observable shadowSpread = WIDGETDATA.shadowSpread

  // 阴影颜色
  @observable shadowColor = WIDGETDATA.shadowColor

  // 组件条件
  @observable condition = ''

  // 锁定位置
  @observable locked = WIDGETDATA.locked

  // 是否只读
  @observable readonly = WIDGETDATA.readonly

  @observable layers = []

  @observable hasLayers = WIDGETDATA.hasLayers

  @observable defaultLayerCount = WIDGETDATA.defaultLayerCount

  @observable maxLayerCount = WIDGETDATA.maxLayerCount

  // 内边距
  @observable padding = WIDGETDATA.padding

  // 外编辑
  @observable margin = WIDGETDATA.margin

  @observable adaptIphoneX = WIDGETDATA.adaptIphoneX

  @observable version = WIDGETDATA.version

  @observable methods = {}

  @observable listeners = {}

  @observable overflow = WIDGETDATA.overflow

  @observable originName = WIDGETDATA.originName

  @observable minHeight = WIDGETDATA.minHeight

  @observable path = ''

  @observable isFullPage = false
  @observable oldHeight = '' // 用来辨别原组件是否有height属性

  constructor(data = {}, reset) {
    super()
    let me = this
    if (!data.data) {
      data.data = {}
    }
    Object.assign(this, data)
    this.path = this.parentPath + '-' + this.id
    this.alignLeftMargin = parseFloat(this.alignLeftMargin)
    this.alignRightMargin = parseFloat(this.alignRightMargin)
    this.alignTopMargin = parseFloat(this.alignTopMargin)
    this.alignBottomMargin = parseFloat(this.alignBottomMargin)
    this.width = parseFloat(this.width)
    this.height = parseFloat(this.height)
    this.top = parseFloat(this.top)
    this.left = parseFloat(this.left)
    this.rotate = parseFloat(this.rotate)
    this.defaultLayerCount = parseFloat(this.defaultLayerCount)
    this.borderRadius = parseFloat(this.borderRadius)
    this.pageWidth = parseFloat(this.pageWidth)
    this.pageHeight = parseFloat(this.pageHeight)
    this.opacity = parseFloat(this.opacity)
    this.borderWidth = parseFloat(this.borderWidth)
    this.defaultLayerCount = parseFloat(this.defaultLayerCount)
    this.maxLayerCount = parseFloat(this.maxLayerCount)
    this.shadowX = parseFloat(this.shadowX)
    this.shadowY = parseFloat(this.shadowY)
    this.shadowBlur = parseFloat(this.shadowBlur)
    this.shadowSpread = parseFloat(this.shadowSpread)

    me.triggers = me.triggers.slice().map((trigger) => {
      if (reset) {
        delete trigger.id
      }
      return new Trigger(trigger, reset)
    })
    me.animations = me.animations.map((animation) => {
      if (reset) {
        delete animation.id
      }
      return new Animation(animation, reset)
    })

    // 如果有layer且没有初始化
    if (me.hasLayers) {
      if (!me.layers.length) {
        if (!me.defaultLayerCount) {
          this.addLayer(
            {
              name: '面板-1'
            },
            false
          )
        } else {
          for (let i = 0; i < me.defaultLayerCount; i++) {
            this.addLayer(
              {
                name: '面板-' + (i + 1)
              },
              false
            )
          }
        }
      } else {
        me.layers = me.layers.map((layer) => {
          layer.parentPath = me.path
          return new Layer(layer, reset)
        })
      }
    }
  }

  addLayer(options, reset = false) {
    if (!this.hasLayers) return
    if (!options) {
      const index = this.layers.length + 1
      options = {
        name: '面板-' + index,
        width: this.width,
        height: this.height
      }
    }
    const layer = new Layer(
      Object.assign(options, {
        parentPath: this.path
      }),
      reset
    )
    this.layers.push(layer)
  }

  removeLayer(index) {
    if (!this.hasLayers) return
    this.layers.splice(index, 1)
  }

  modifyCondition(condition) {
    this.condition.merge(condition)
    history.record()
  }

  modifyData(modify) {
    for (let key of Object.keys(modify)) {
      let value = modify[key]
      this.data = { ...this.data, [key]: value }
    }
    history.record()
  }
  modifyListeners(modify) {
    const listeners = {}
    for (let key of Object.keys(modify)) {
      listeners[key] = modify[key]
    }
    this.listeners = listeners
    history.record()
  }
  async modify(modify = {}, namespace, temp = {}) {
    let me = this
    let obj = namespace ? me[namespace] : me
    if (namespace == 'data') {
      this.modifyData(modify)
      return
    }
    if (namespace == 'listeners') {
      this.modifyListeners(modify)
      return
    }
    if (modify.location == 'screen') {
      me.layers = me.layers.map((layer) => {
        layer.closeImgLazyLoad = true
        return new Layer(layer)
      })
    }
    if (modify.free) {
      obj.align = 'free'
      delete modify.free
    }
    for (let key of Object.keys(modify)) {
      let value = modify[key]
      // 某些属性修改需要先经过一些处理
      const modifyActionProperties = [
        'bgSize',
        'height',
        'width',
        'bgSizeScale'
      ]
      if (modifyActionProperties.indexOf(key) !== -1) {
        const modifications = await modifyAction(this, key, value)
        for (let name in modifications) {
          obj[name] = modifications[name]
        }
      } else {
        obj[key] = value
      }
    }
    if (obj.align != 'free') {
      let align = me.align
      let horizontal = align.split('-')[0]
      let vertical = align.split('-')[1]

      let left = me.left
      switch (horizontal) {
        case 'left':
          left = 0 + me.alignLeftMargin
          break
        case 'center':
          left = me.pageWidth / 2 - (temp.width || me.width) / 2
          break
        case 'right':
          left = me.pageWidth - (temp.width || me.width) - me.alignRightMargin
          break
        default:
          break
      }

      let top = me.top
      switch (vertical) {
        case 'top':
          top = 0 + me.alignTopMargin
          break
        case 'center':
          top = me.pageHeight / 2 - (temp.height || me.height) / 2
          break
        case 'bottom':
          top =
            me.pageHeight - (temp.height || me.height) - me.alignBottomMargin
          break
        default:
          break
      }
      obj.left = left
      obj.top = top
    }
    history.record()
  }
}
export default Widget
