import './index.less'
import React from 'react'
import { observer } from 'mobx-react'
import BaseWidget from 'widgets/Base'
import ContextMenu from '../HEContextMenu'
import { context, getPageById } from 'common/utils'
import { SortableContainer, SortableElement } from '@k9/react-sortable-hoc'
import { message } from 'antd'
import { connectToStore } from '../StoreContext'
import { getBackgroundImageAttribute } from 'utils/ModelUtils'
import ClipboardUtils from 'utils/ClipboardUtils'
import { getWidgetConfigByType } from 'widgets'
import RichTextEditorContainer from '../../containers/RichTextEditorContainer'
import { bindOpen } from 'common/editorModals'
import store from 'store/stage'
import { setWidgetSize } from 'common/component'
import {
  getDataContainerData,
  setDataToProjectVariableStore
} from 'common/handlePageDataByVariable'
import { useDataValue } from 'utils/ModelUtils'

const copyText = ClipboardUtils.copyTextToClipboard

@observer
class Stage extends React.Component {
  onDrag = (layout) => {
    const { stage } = this.props
    const order = layout.sort((a, b) => a.y >= b.y).map((widget) => widget.i)
    stage.sortChildren(order)
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

  onMouseUp = (e) => {
    const me = this
    // 右键显示右键菜单
    const { stage, store, config } = this.props
    // 是否关闭右键显示菜单
    const showMouseRight = config.STAGE && config.STAGE.MOUSE
    if (!showMouseRight) return
    if (e.button == 2) {
      stage.selectChildren(e.target.dataset.id)
      // 选中
      let selectedWidgets = stage.getSelectedChildren()
      let widget = selectedWidgets[0]
      if (!widget) return
      let widgetType = widget.type
      let widgetVersion = widget.version
      let widgetConfig = getWidgetConfigByType(widgetType, widgetVersion)
      let baseItems = [
        { key: 'copy', icon: 'copy', text: '复制', disabled: 0 },
        { key: 'cut', icon: 'check', text: '剪切', disabled: 0 },
        { key: 'delete', icon: 'close', text: '删除', disabled: 0 },
        { key: 'forward', icon: 'up', text: '置顶', disabled: 0 },
        { key: 'backward', icon: 'down', text: '置底', disabled: 0 }
      ]
      let arr = []
      if (
        (widgetConfig.onNext || widgetConfig.hasLayers) &&
        typeof widget.readonly !== 'undefined' &&
        !widget.readonly
      ) {
        arr = [
          {
            key: 'next',
            icon: 'arrow-right',
            text: '进入',
            disabled: 0
          }
        ]
      }
      new ContextMenu({
        pageX: e.pageX,
        pageY: e.pageY,
        items: arr.concat(baseItems),
        onClick(e, key) {
          if (key === 'copy' || key === 'cut') {
            const success = copyText(
              JSON.stringify({ project: 'h5', widgets: selectedWidgets })
            )

            if (success) {
              message.success(
                '操作成功，已放置在剪贴板中，请使用 ctrl + v 粘贴'
              )
            } else {
              message.error('操作失败')
            }
          }

          if (key === 'delete' || key === 'cut') {
            stage.removeChildren(selectedWidgets.map((widget) => widget.id))
          }

          if (key === 'forward' || key === 'backward') {
            selectedWidgets.forEach((widget) => {
              let currentIndex = stage.list.indexOf(widget)
              stage.list.splice(currentIndex, 1)
              // normal布局的元素数组中，后面的元素层级更高，所以在右侧展示图层那里做了reverse，flow布局的数组正常
              if (widget.layout == 'flow') {
                if (key === 'forward') {
                  stage.list.unshift(widget)
                } else if (key === 'backward') {
                  stage.list.push(widget)
                }
              } else {
                if (key === 'forward') {
                  stage.list.push(widget)
                } else if (key === 'backward') {
                  stage.list.unshift(widget)
                }
              }
            })
          }
          if (key === 'next') {
            let stageStore = store.getStageStore()
            let project = store.getProject()
            me.ctx = context(
              Object.assign(
                {
                  dispatchAction: me._handleAction,
                  widget,
                  scale: 1,
                  open: bindOpen(widget),
                  project,
                  page: getPageById(widget.path.split('-')[0])
                },
                store
              )
            )
            const widgetWidth = widget.width
            const widgetHeight = widget.height
            if (widgetConfig) {
              // fix 如果容器高度增加,面板的高度也同步
              // container | tab | form | exam
              // fixHeight 存在容器不想执行高度调整的逻辑
              if (widgetConfig.hasLayers) {
                stageStore.setCurrentStage(widget, 'widget')
                if (!widgetConfig.fixHeight) {
                  let heightSetting = 'handAdjust'
                  if (widget.layout == 'flow') {
                    heightSetting = 'autoAdjust'
                  }
                  // 瀑布流布局的容器，layer页面高度自动调整
                  // 拖拽布局的容器,如果layer页面高度高于widget高度,那么layer高度不变
                  // 如果layer页面高度低于widget高度，则layer页面高度和widget高度保持一致
                  widget.layers.forEach((layer) => {
                    layer.width = widgetWidth
                    layer.height =
                      widgetHeight > layer.height ? widgetHeight : layer.height
                    layer.heightSetting = heightSetting
                    layer.widgets.forEach((currentWidget) => {
                      currentWidget.pageHeight = layer.height
                      currentWidget.pageWidth = layer.width
                    })
                  })
                }
                setWidgetSize(project, widget)
                stageStore.getCurrentStage().selectChildren(widget.layers[0].id)
                stageStore.setCurrentStage(widget.layers[0], 'layer')
              }
              if (widgetConfig.onNext) {
                // 图片进入功能可以更换图片
                widgetConfig.onNext(me.ctx)
              }
            }
          }
        }
      })
    }
  }

  onFlowListSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex == newIndex) {
      return
    }
    const { stage } = this.props

    const components = stage.list
    let originOrder = []
    let originOrderAll = []

    components.forEach((widget) => {
      const { visible, layout } = widget
      if (layout === 'flow') {
        if (visible) {
          originOrder.push(widget.id)
        }
        originOrderAll.push(widget.id)
      }
    })
    // stage.list 当中的组件包含隐藏组件，所以此处在移动显示组件的同时
    // 重新计算了对包含隐藏组件在内的所有组件的排序影响
    const oldIndexId = originOrder[oldIndex]
    const newIndexId = originOrder[newIndex]
    // 1. 先干掉老的位置的元素
    const entireListIds = originOrderAll.filter((id) => id !== oldIndexId)
    // 2. 找到新位置在所有瀑布流布局元素列表中的下标
    let insertIndex = entireListIds.findIndex((id) => id === newIndexId)
    // 3. 根据移动方向设置插入位置
    if (newIndex > oldIndex) {
      insertIndex += 1
    }
    entireListIds.splice(insertIndex, 0, oldIndexId)
    stage.sortChildren(entireListIds)
  }

  render() {
    let me = this
    const { stage, store, config } = this.props
    // 禁止拖动
    const { STAGE } = config
    const forbidSort = !(STAGE && STAGE.MOUSE)
    const stageStore = store.getStageStore()
    let project = store.getProject()

    let container = stage.component
    let components = stage.list
    let flows = []
    let normals = []
    let richTextEditorTargetWidget = null
    components.forEach(function (widget) {
      const { visible, layout } = widget
      if (stageStore.richTextEditorTargetId === widget.id) {
        richTextEditorTargetWidget = widget
      }
      if (!visible) {
        return
      }
      if (layout == 'normal') {
        normals.push(widget)
      } else if (layout == 'flow') {
        flows.push(widget)
      }
    })

    // define item class
    let FlowSortableItem = SortableElement(({ value, index }) => {
      let widget = value
      let moveWidgetOptions = {
        up: index !== 0,
        down: index < flows.length - 1,
        index: index,
        clickMethod: this.onFlowListSortEnd
      }
      return (
        <BaseWidget
          key={widget.id}
          widget={widget}
          variableMap={container.variableMap}
          container={container}
          moveWidgetOptions={moveWidgetOptions}
          parent={me}
        />
      )
    })

    // define item list class
    let FlowSortableList = SortableContainer(({ items }) => {
      let widgets = items
      // 使用此排序组件，内部点击事件被吞剥，使用distance!=0 打开
      // float: 'left' 瀑布流布局元素选中后，存在外边距合并问题
      return (
        <div
          style={{ width: '100%', height: '100%', float: 'left' }}
          onMouseDown={(e) => {
            stage.selectChildren(e.target.dataset.id)
          }}
        >
          {widgets.map((widget, index) => (
            <FlowSortableItem
              key={'item-' + widget.id}
              index={index}
              value={widget}
              disabled={forbidSort}
            />
          ))}
        </div>
      )
    })

    let normalWidgets = []
    normals.forEach((widget) => {
      normalWidgets.push(
        <BaseWidget
          key={widget.id}
          widget={widget}
          container={container}
          parent={me}
          variableMap={container.variableMap}
          getRef={(node) => {
            me[widget.id] = node
          }}
        />
      )
    })
    const containerHeight = container.height
    const containerWidth = container.width
    const containerBgColor = container.bgColor
    let bodyBgColor = useDataValue(
      project.backgroundColor,
      project.pages[0].variableStore,
      project.pages[0],
      project
    )
    bodyBgColor === 'undefined' && (bodyBgColor = '#fff')
    const isFullPage = container.isFullPage
    let bodyStyle = {
      backgroundColor: bodyBgColor
    }
    Object.assign(bodyStyle, getBackgroundImageAttribute(project, project))
    let style = {
      height: containerHeight,
      width: containerWidth,
      backgroundColor: containerBgColor
    }
    if (isFullPage) {
      Object.assign(style, {
        height: 603
      })
    }
    Object.assign(style, getBackgroundImageAttribute(container, project))
    let richTextRect
    if (richTextEditorTargetWidget) {
      const richTextTargetWidgetLeft = richTextEditorTargetWidget.left
      const richTextTargetWidgetTop = richTextEditorTargetWidget.top
      const richTextTargetWidgetWidth = richTextEditorTargetWidget.width
      const richTextTargetWidgetHeight = richTextEditorTargetWidget.height
      const paddings = richTextEditorTargetWidget.padding.split(' ')
      const top = parseInt(paddings[0], 10)
      const right = parseInt(paddings[1], 10)
      const bottom = parseInt(paddings[2], 10)
      const left = parseInt(paddings[3], 10)

      richTextRect = {
        left: Math.round(richTextTargetWidgetLeft) + left,
        top: Math.round(richTextTargetWidgetTop) + top,
        width: Math.round(richTextTargetWidgetWidth - (left + right)),
        height: Math.round(richTextTargetWidgetHeight - (top + bottom))
      }
    }

    return (
      <div className="stage-body" style={bodyStyle}>
        <div
          className="stage-container"
          style={style}
          // 坑：此处如果使用onMouseDown，会造成FlowItem  首次无法拖动
          // onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
        >
          <div className="boundary">
            <div className="vertical-line top"></div>
            <div className="vertical-line bottom"></div>
            <div className="horizontal-line left"></div>
            <div className="horizontal-line right"></div>
          </div>
          {/* 此处是富文本组件V2的编辑器的container实例化的节点 */}
          {stageStore.richTextEditorTargetId !== null && (
            <RichTextEditorContainer
              widgetId={stageStore.richTextEditorTargetId}
              style={richTextRect}
            />
          )}
          <FlowSortableList
            helperClass={'dragging'}
            lockAxis={'y'}
            items={flows}
            onSortEnd={this.onFlowListSortEnd}
            helperContainer={function () {
              return document.getElementById('workspace-swiper-container')
            }}
            disableAutoscroll={true}
          />
          {normalWidgets}
        </div>
      </div>
    )
  }

  componentDidMount() {
    god.oncontextmenu = function () {
      return false
    }
  }

  async UNSAFE_componentWillMount() {
    const { store } = this.props
    let project = store.getProject()
    let container = project.pages[0]
    if (
      project &&
      project.useData &&
      container.dataBox &&
      container.dataBox.dataOrigin == 'request' &&
      container.dataBox.requestUrl
    ) {
      const result = await getDataContainerData(
        container.dataBox.method,
        container.dataBox.requestUrl,
        container.dataBox.params
      )
      if (result.code == 0) {
        setDataToProjectVariableStore(container, result.data)
      }
    }
  }
}

export default connectToStore(Stage)
