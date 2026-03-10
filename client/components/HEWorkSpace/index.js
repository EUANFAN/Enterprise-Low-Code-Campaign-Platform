import React from 'react'
import { observer } from 'mobx-react'
import Stage from '../HEStage'
import Selector from './Selector'
import SwipeableViews from 'react-swipeable-views'
import { connectToStore } from '../StoreContext'
import classnames from 'classnames'
import CanvasRuler from './CanvasRuler'
import throttle from 'lodash/throttle'
import './index.less'
import { computedContentHeight, getSelectChildrenSize } from 'common/getHeight'
import { Tooltip } from 'antd'
import xEditorStore from 'common/xEditorStore'

@observer
class Viewport extends React.Component {
  render() {
    let { viewports, backOrigin, store } = this.props
    let stageStore = store.getStageStore()
    let stages = stageStore.getAllStages()
    // index 0 是 project，1 是 page1，之后的偶数是 widget，奇数是 layer，
    // 只有 page 和 layer 才是 swiper 中的元素
    let containers = stages.filter(function (item, index) {
      return index % 2 === 1
    })
    let viewportList = containers.map((stage, index) => {
      const StageBreadCrumb = containers
        .filter((stage, currentIndex) => {
          if (currentIndex <= index) {
            return true
          }
        })
        .map((stage, index, arr) => {
          const name = stage.component.name
          return (
            <div className="navigator-item" key={'stage-name-' + index}>
              <span
                className="navigator-item-text"
                onClick={() => {
                  backOrigin()
                  stageStore.redirectStage(stage)
                }}
              >
                {name}
              </span>
              {index < arr.length - 1 ? <span>&nbsp;&gt;&nbsp;</span> : null}
            </div>
          )
        })
      return (
        <div
          key={'stage-' + index}
          className={classnames(
            'viewport',
            containers.length == index + 1 ? 'viewport-current' : ''
          )}
          ref={(node) => {
            viewports[index] = node
          }}
          style={{
            height: stage.component.height,
            width: stage.component.width
          }}
        >
          <div className="navigator-list">{StageBreadCrumb}</div>
          <Stage stage={stage} />
        </div>
      )
    })
    let props = {
      axis: 'x',
      slideStyle: {
        position: 'relative',
        overflowY: 'auto'
      },
      containerStyle: {
        height: '100%'
      },
      resistance: true,
      index: stageStore.swiperIndex,
      enableMouseEvents: true,
      disabled: true,
      onTransitionEnd: () => {
        backOrigin()
        stageStore.clearChildrenStage()
      }
    }
    return (
      <SwipeableViews
        className="workspace-swiper-container production-state"
        id="workspace-swiper-container"
        style={{
          flex: 1,
          position: 'relative',
          height: '100%'
        }}
        {...props}
      >
        {viewportList}
      </SwipeableViews>
    )
  }
}
@observer
class WorkSpace extends React.Component {
  viewports = []
  state = {
    viewportContainer: {},
    resetWidth: false,
    stageTop: 0,
    stageLeft: 0
    // TODO：该参数用于当发生了 scroll，新增组件时应加上 Y 轴偏移以
    // 使组件出现在当前可视区域，但目前这个参数并没有被读取
    // verticalRulerScrollTop: 0
  }
  addContainerModified(callback = () => {}) {
    const target = document.querySelector(
      '.editorLeftContainer_container>.context'
    )
    // 创建观察者对象
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        callback(mutation)
      })
    })
    // 配置观察选项:
    var config = { attributes: true }
    // 传入目标节点和观察选项;
    observer.observe(target, config)
  }
  componentDidMount() {
    const { computeWorkspaceWidth } = this.props
    xEditorStore.initEditorStore('scroll')
    let workspace = document.querySelector('.workspace')
    let maxMutationWidth = 0
    this.addContainerModified((mutation) => {
      let mutationWidth = mutation.target.offsetWidth
      maxMutationWidth = Math.max(maxMutationWidth, mutationWidth)
      if (mutationWidth === 0) {
        computeWorkspaceWidth(workspace.offsetWidth - maxMutationWidth)
      } else {
        computeWorkspaceWidth(workspace.offsetWidth + mutationWidth)
      }
    })
    computeWorkspaceWidth(workspace.offsetWidth)
    this.setState({ stageTop: 0, stageLeft: 0 })
    god.addEventListener(
      'resize',
      throttle(() => {
        computeWorkspaceWidth(workspace.offsetWidth)
      })
    )
    god.addEventListener(
      'scroll',
      (e) => {
        // 获取对应滚动区域e.target的scrollTop，scrollLeft
        const swipeFlag =
          e.target.getAttribute && e.target.getAttribute('data-swipeable')
        if (swipeFlag) {
          this.setState({
            stageTop: e.target.scrollTop,
            stageLeft: e.target.scrollLeft
          })
          xEditorStore.setEditorStore('scroll', 'top', e.target.scrollTop)
        }
      },
      true
    )
  }
  // selector 和此处都监听和处理了 mouse 事件，之所以不统一在 selector 中处理
  // 因为 selector 中不包含 widget，无法拿到包含 widget 的 e.target
  unselectWidgets = (e) => {
    const { store } = this.props
    if (e.metaKey) {
      return
    }

    let current = e.target
    let inWidget = false
    while (current) {
      if (/widget/g.test(current.className)) {
        inWidget = true
        break
      }
      current = current.parentNode
    }

    if (!inWidget) {
      const stageStore = store.getStageStore()
      const stage = stageStore.getCurrentStage()
      stage.unselectChildren()
    }
  }

  handleSelection = (startPoint, endPoint, hold) => {
    const { store } = this.props
    if (!startPoint || !endPoint) {
      return
    }
    let stageStore = store.getStageStore()
    let stage = stageStore.getCurrentStage()
    let stages = stageStore.getAllStages()
    let viewport = this.viewports[stages.length / 2 - 1]

    let offset = {
      x: viewport.offsetLeft - viewport.offsetWidth / 2 + 15,
      y: viewport.offsetTop + 15
    }

    let cover = {
      left:
        Math.min(startPoint.x, endPoint.x) +
        viewport.parentNode.scrollLeft -
        offset.x,
      right:
        Math.max(startPoint.x, endPoint.x) +
        viewport.parentNode.scrollLeft -
        offset.x,
      top:
        Math.min(startPoint.y, endPoint.y) +
        viewport.parentNode.scrollTop -
        offset.y,
      bottom:
        Math.max(startPoint.y, endPoint.y) +
        viewport.parentNode.scrollTop -
        offset.y
    }

    let selectedWidgetIds = []
    let maxHeight = 0
    stage.list
      .map((widget) => {
        if (widget.layout == 'flow') {
          const currentWidget = {
            id: widget.id,
            top: maxHeight,
            left: 0,
            width: stage.component.width,
            height: widget.height
          }

          maxHeight += widget.height

          return currentWidget
        }

        return widget
      })
      .map((widget) => {
        if (
          cover.left <= widget.left &&
          cover.right >= widget.left + widget.width &&
          cover.top <= widget.top &&
          cover.bottom >= widget.top + widget.height
        ) {
          if (!widget.locked) {
            selectedWidgetIds.push(widget.id)
          }
        }
      })

    stage.selectChildren(selectedWidgetIds, hold)
  }
  backOrigin = () => {
    // eslint-disable-next-line
    let parentNode = document.querySelector("div[data-swipeable='true']")
    if (parentNode) {
      parentNode.scroll(0, 0)
    }
    this.setState({
      stageTop: 0,
      stageLeft: 0
    })
  }
  render() {
    let me = this
    const { store } = this.props
    let stageStore = store.getStageStore()
    let stage = stageStore.getCurrentStage()
    // 选中多个元素时，重新计算尺寸
    let selectChildren = stage.getSelectedChildren()
    let scale = selectChildren.length && getSelectChildrenSize(selectChildren)
    let currentStage = stage.component
    const { width } = me.props
    let left = (width - currentStage.width) / 2 - this.state.stageLeft
    // zhangyan 滚动时还需计算高度不合理
    let computedHeight = computedContentHeight(
      stage.list,
      currentStage.clazz,
      true
    )
    // 比较高度原因：存在手动调整高度时，computedHeight计算的高度不会变
    let pageSize = {
      width: currentStage.width,
      height:
        computedHeight > stage.component.height
          ? computedHeight
          : stage.component.height
    }
    return (
      <div className="workspace">
        <Selector onSelectionChange={this.handleSelection} />
        <CanvasRuler
          direction="horizontal"
          offsetLeft={left}
          offsetTop={this.state.stageTop}
          scale={scale}
          isDraw={true}
        />
        <div
          id="viewport-container"
          className="viewport-container"
          onMouseDown={this.unselectWidgets}
        >
          <Tooltip title="点我返回原点">
            <div className="corner" onClick={this.backOrigin}></div>
          </Tooltip>
          <CanvasRuler
            direction="vertical"
            pageSize={pageSize}
            offsetTop={this.state.stageTop}
            scale={scale}
            isDraw={true}
          />
          <Viewport
            store={this.props.store}
            viewports={this.viewports}
            backOrigin={this.backOrigin}
          ></Viewport>
        </div>
      </div>
    )
  }
}
export default connectToStore(WorkSpace)
