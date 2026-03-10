// 编辑内容区域
import React from 'react'
import Rnd from '@k9/react-rnd'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Animation from '../../components/HEAnimation'
import { getWidgetConfigByType } from 'widgets'
import store from 'store/stage'
import { connectToStore } from 'components/StoreContext'
import MoveWidgetOperation from 'components/HEMoveWidgetOperation'
import WidgetClass from '../WidgetClass'
import { bindOpen } from 'common/editorModals'
import './index.less'
import { afterUpdateHook, beforeUpdateHook } from 'common/attributeHook'
import {
  getSelectChildrenSize,
  noNeedAgainComputeHeight
} from 'common/getHeight'

const HandlerClasses = {
  bottom: 'handler handler-point handler-bottom',
  bottomLeft: 'handler handler-point handler-bottom-left',
  bottomRight: 'handler handler-point handler-bottom-right',
  left: 'handler handler-point handler-left',
  right: 'handler handler-point handler-right',
  top: 'handler handler-point handler-top',
  topLeft: 'handler handler-point handler-top-left',
  topRight: 'handler handler-point handler-top-right'
}

@observer
class BaseWidget extends WidgetClass {
  enterFlag = false
  /**
   * 场景值：edit表示当前组件是在编辑状态下使用
   *
   * @type {String}
   */
  scene = 'edit'

  /**
   * 提供组件与编辑器之间沟通的桥梁
   *
   * @type {Object}
   */
  EditorBridge = {
    open: bindOpen
  }
  state = {
    isEditor: false
  }
  constructor(props) {
    super(props)
    // 若不存在oldHeight则说明原组件没有提供height属性，要走两次render获取渲染后的原组件初始高度
    // 这里的sessionStorage用id为key，主要是为了记录刷新次数
    if (!this.props.widget.oldHeight) {
      sessionStorage.setItem(this.props.widget.id, 0)
    }
  }

  /**
   * 调整组件的位置
   *
   * @param  {Object} e         事件对象
   * @param  {Object} data      移动信息
   */
  modifyWidgetPosition = (e, data) => {
    const { widget, store } = this.props
    let stageStore = store.getStageStore()
    let stage = stageStore.getCurrentStage()
    let selectedChildren = stage.getSelectedChildren()

    // 必须放在return前（组件移动后可能最后移回原位）
    let delta = {
      left: data.x - widget.left,
      top: data.y - widget.top
    }
    selectedChildren.forEach((child) => {
      if (child.layout === 'normal') {
        child.modify({
          left: child.left + delta.left,
          top: child.top + delta.top,
          free: true
        })
      }
    })
    afterUpdateHook(
      widget,
      'left',
      null,
      'height',
      noNeedAgainComputeHeight(selectedChildren)
    )
  }

  _handleAction = (action, payload) => {
    switch (action) {
      case 'modifyWidgetProperty': {
        this.props.widget.modify(payload)
        break
      }
      case 'modifyWidgetData': {
        this.props.widget.modify(payload, 'data')
        break
      }
      case 'editInRichTextEditor': {
        let stageStore = store.getStageStore()
        stageStore.setRichTextEditorTargetId(payload.widgetId)
      }
    }
  }

  /**
   * 拖动事件
   *
   * @param  {Object} e    事件对象
   * @param  {Object} data 位置数据
   */
  onDrag = (e, data) => {
    this.setState({ isEditor: true })
    const { widget } = this.props
    let widgetType = widget.type
    let widgetVersion = widget.version
    let widgetConfig = getWidgetConfigByType(widgetType, widgetVersion)
    this.modifyWidgetPosition(e, data)
    if (widgetConfig && widgetConfig.onDrag) {
      try {
        widgetConfig.onDrag.bind(widget)(this.ctx)
      } catch (err) {
        console.error(err)
      }
    }
  }

  /**
   * 开始拖动
   *
   * @param  {Object} e    事件对象
   * @param  {Object} data 位置数据
   */
  onResizeStart = () => {
    const { widget } = this.props
    this.width = widget.width
    this.height = widget.height
    this.top = widget.top
    this.left = widget.width
  }

  /**
   * 调整尺寸
   *
   * @param  {Object} e         事件对象
   * @param  {string} direction 方向
   * @param  {Object} node      元素
   * @param  {Object} delta     改变数据
   */
  onResize = async (e, direction, node, delta, position) => {
    this.setState({ isEditor: true })
    const { widget } = this.props
    let widgetType = widget.type
    let widgetVersion = widget.version
    let widgetConfig = getWidgetConfigByType(widgetType, widgetVersion)
    let currentPosition = {
      left: position.x,
      top: position.y
    }
    let computedAttribute = await beforeUpdateHook(
      Object.assign(widget, {
        width: this.width + delta.width,
        height: this.height + delta.height,
        left: position.x,
        top: position.y
      }),
      'autoHeight',
      widget.data['autoHeight'],
      'data'
    )
    let height = computedAttribute.height
      ? computedAttribute.height
      : widget.height
    let width = this.width + delta.width
    await widget.modify({
      height,
      left: position.x,
      top: position.y,
      width: width
    })
    afterUpdateHook(widget, 'width', null, 'hasLayers')
    afterUpdateHook(
      widget,
      'width',
      null,
      'height',
      noNeedAgainComputeHeight([widget])
    )
    if (widgetConfig && widgetConfig.onResize) {
      try {
        widgetConfig.onResize(this.ctx, currentPosition)
      } catch (err) {
        console.error(err)
      }
    }
  }
  getNormalContainer = (widget, content, canDragAndResize) => {
    const { store } = this.props
    let width = widget.width
    let height = widget.height
    let left = widget.left
    let top = widget.top
    let { id, type, isSelected, readonly, locked, isFullPage } = widget
    width = width || 0
    // 拖拽布局初次载入自适应高度兼容代码
    if (!widget.oldHeight) {
      // 没有oldHeight代表组件中不存在height
      // 用组件id记录刷新的次数，存在sessionStorage中，删除组件时清空，第二次就可以拿到this.ele从而获得真是高度
      // 通过刷新次数判断是否要走这段逻辑，若不加判断onResize后高度始终为初始高度
      let widthInit = isNaN(parseInt(sessionStorage.getItem(id)))
        ? 0
        : parseInt(sessionStorage.getItem(id))
      if (widthInit <= 1) {
        // 为0时在Object.assign({}, widget)的作用下再次render更新为1
        Object.assign({}, widget) // 强制render一次，用来兼容没有写height的情况
        sessionStorage.setItem(id, ++widthInit)
        if (this.ele && this.ele.firstElementChild) {
          const { widget } = this.props
          height = isFullPage
            ? '100%'
            : this.ele.firstElementChild.getBoundingClientRect().height
          // 获得真实高度赋值给组件的height属性，防止失焦后再次回弹之前高度，此后再不进入该方法
          widget.modify({ height })
        }
      }
    }
    const className = classNames(
      ['widget-wrapper', `widget_${id}`, 'widget-wrapper-normal'],
      {
        'widget-wrapper-selected': isSelected,
        'widget-locked': locked,
        'widget-readonly': readonly
      }
    )
    let stageStore = store.getStageStore()
    let stage = stageStore.getCurrentStage()
    let selectedChildren = stage.getSelectedChildren()
    let selectedIds = selectedChildren.map((child) => child.id)
    let alignStyle = {}
    if (widget.align != 'free') {
      alignStyle = widget.align ? this.getAlignStyle(0) : {}
    }
    // top left 对照样式 transform: translate(left, top);
    left = alignStyle.left ? alignStyle.left : left
    top = alignStyle.top ? alignStyle.top : top

    if (isFullPage) {
      top = 0
      left = 0
    }
    return (
      <Rnd
        index={id}
        position={{
          x: left,
          y: top
        }}
        data-id={id}
        size={{ width, height }}
        lockAspectRatio={type == 'Image'}
        className={className}
        resizeHandleClasses={HandlerClasses}
        dragGrid={[5, 5]}
        onDragStart={(e) => {
          if (selectedIds.indexOf(id) <= -1) {
            if (e.metaKey) {
              selectedIds = selectedIds.concat([id])
            } else {
              selectedIds = [id]
            }
            stage.selectChildren(selectedIds)
          }
        }}
        onDrag={canDragAndResize ? this.onDrag : null}
        onResizeStop={() => this.setState({ isEditor: false })}
        onDragStop={() => this.setState({ isEditor: false })}
        onResizeStart={canDragAndResize ? this.onResizeStart : null}
        onResize={canDragAndResize ? this.onResize : null}
        // 未选中的元素周边八个小方块不显示
        enableResizing={
          canDragAndResize ? (selectedIds.length == 1 ? undefined : {}) : {}
        }
        disableDragging={false}
      >
        {content}
      </Rnd>
    )
  }

  getFlowContainer(widget, content, canDragAndResize) {
    // 此样式由其栅格系统赋予
    let { id, isSelected } = widget
    const className = classNames(['widget-wrapper', `widget_${id}`], {
      'widget-wrapper-selected': isSelected
    })
    // 编辑区域无法将widget的高变为100%，因为有其他元素进行拖拽
    const style = {
      position: 'relative',
      height: widget.height
    }

    if (this.ele && this.ele.firstElementChild) {
      style['height'] =
        this.ele.firstElementChild.getBoundingClientRect().height
    }

    if (!widget.margin) {
      widget.margin = '0 0 0 0'
    }
    style.margin = (widget.margin + 'px').split(' ').join('px ')
    if (
      widget.align != 'free' &&
      widget.location == 'screen' &&
      god.inPreview
    ) {
      let alignStyle = widget.align ? this.getAlignStyle(0) : {}
      alignStyle.position = 'absolute'
      alignStyle.width = '100%'
      Object.assign(style, alignStyle)
    }
    return (
      <div key={id} style={style} className={className} data-id={id}>
        {content}
        {canDragAndResize && isSelected && (
          <MoveWidgetOperation options={this.props.moveWidgetOptions} />
        )}
      </div>
    )
  }
  // 自动移动到指定位置
  autoMoveSelectPostion(canDragAndResize, widget) {
    const { isEditor } = this.state
    if (canDragAndResize && widget.isSelected && !isEditor) {
      // eslint-disable-next-line
      let parentNode = document.querySelector("div[data-swipeable='true']")
      const { top } = getSelectChildrenSize([widget])
      if (parentNode) {
        parentNode.scroll({
          top: top,
          behavior: 'smooth'
        })
      }
    }
  }
  render() {
    let { widget, config } = this.props
    let { id, type, version, locked } = widget
    const { STAGE } = config
    const forbidEdit = !(STAGE && STAGE.MOUSE)
    // 是否是在编辑器中
    let canDragAndResize = forbidEdit ? false : !locked
    // 自动移动到指定位置;
    this.autoMoveSelectPostion(canDragAndResize, widget)
    let style = this.getStyle(widget)
    let animationProps = this.getAnimation(widget)
    let content = this.getWidgetContent(type, version)
    style['overflowY'] = 'hidden'
    let widgetInnerContent = (
      <div
        className={classNames([`widget_${type}`, 'content'])}
        style={style}
        ref={(ele) => {
          this.ele = ele
        }}
      >
        {content}
      </div>
    )
    let widgetContent
    if (Object.keys(animationProps).length) {
      widgetContent = [
        <Animation key={id} {...animationProps}>
          {widgetInnerContent}
        </Animation>
      ]
    } else {
      widgetContent = widgetInnerContent
    }

    if (widget.layout == 'normal') {
      return this.getNormalContainer(widget, widgetContent, canDragAndResize)
    }

    return this.getFlowContainer(widget, widgetContent, canDragAndResize)
  }
}

export default connectToStore(BaseWidget)
