import React from 'react'
import { observer } from 'mobx-react' // 将React组件转变为响应式组件
import {
  getPageIndexById,
  checkPageBack,
  xEditorStore,
  ssrRender
} from 'common/utils'
import { handlePageDataByVariableStore } from 'common/handlePageDataByVariable'
import Page from './Page'
import { connectToStore } from 'components/StoreContext'
import './Project.less'
import loadingComponent from 'components/LoadingComponent'
import HEOnlineTestTip from 'components/HEOnlineTestTip'
import Loadable from 'react-loadable'
import { autorun } from 'mobx'
import { weChatShare } from 'common/share'
import { getBackgroundImageAttribute, useDataValue } from 'utils/ModelUtils'
const WithRouter = Loadable({
  loader: () => import(/* webpackChunkName: "withRouter" */ './withRouter'),
  loading: loadingComponent
})
let ANIMATION_MAP = {
  PUSH: '',
  POP: ''
}
@observer
class Project extends React.Component {
  constructor(props) {
    super(props)
    this._container = null
    this.state = {
      show: false,
      onlineTestUrl: false
    }
  }
  async UNSAFE_componentWillMount() {
    let project = this.props.project
    switch (project.pageTransition) {
      case 'fade':
        ANIMATION_MAP = {
          PUSH: 'fade',
          POP: 'fade'
        }
        break
      case 'horizontalSlide':
        ANIMATION_MAP = {
          PUSH: 'hforward',
          POP: 'hback'
        }
        break
      case 'verticalSilde':
        ANIMATION_MAP = {
          PUSH: 'vforward',
          POP: 'vback'
        }
        break
      default:
        break
    }
    if (project.pages.length > 1 && typeof window !== 'undefined') {
      import('common/history').then((result) => {
        xEditorStore['history'] = result.default
      })
    }
    if (!ssrRender(project, project)) {
      await handlePageDataByVariableStore(project, project)
    }
    // 设置微信分享
    weChatShare()
    this.setState({
      show: true
    })
    // 只有线上正式链接才remove DOM结构
    if (
      /h5sandbox|_online_test|(debug=true)|(type=gray)/.test(location.href) &&
      !/h5\.(100tal|xesv5)\.com/.test(location.href)
    ) {
      this.setState({
        onlineTestUrl: true
      })
    }
  }
  /**
   * 页面后退时
   */
  onBack = () => {
    const currentPageIndex = getPageIndexById(xEditorStore.currentPageId)
    if (currentPageIndex == -1) return
    const pageBack = checkPageBack(currentPageIndex) // 当前页面是否有back行为
    if (!pageBack) return
    xEditorStore.history.goForward() // 阻止页面离开
    if (currentPageIndex != -1 && this.pages[currentPageIndex]) {
      this.pages[currentPageIndex].onBack()
    }
  }

  render() {
    if (!this.state.show) return null
    let me = this
    let project = me.props.project
    me.pages = []
    // 背景颜色设置
    if (project.backgroundColor) {
      const bodyBgColor = useDataValue(
        project.backgroundColor,
        project.pages[0].variableStore,
        project.pages[0],
        project
      )
      document.body.style.backgroundColor = bodyBgColor
    }
    let backgroundStyle = getBackgroundImageAttribute(project, project)
    Object.keys(backgroundStyle).forEach((style) => {
      document.body.style[style] = backgroundStyle[style]
    })
    if (project.pages.length > 1 && typeof window !== 'undefined') {
      this.listen =
        xEditorStore.history &&
        xEditorStore.history.block((location) => {
          let currentPageId = location.pathname.substring(1)
          let currentPageIndex = currentPageId
            ? getPageIndexById(currentPageId)
            : 0
          // 当前页面索引大于上一个页面，说明是push，否则是pop
          xEditorStore.action =
            currentPageIndex > xEditorStore.lastPageIndex ? 'PUSH' : 'POP'
        })
    }
    let pages = project.pages.map((page, index) => {
      return (
        <Page
          project={project}
          key={page.id}
          container={page}
          widgets={page.widgets}
          onAction={this._handleAction}
          getRef={(node) => {
            me.pages[index] = node
          }}
        />
      )
    })
    let page = project.pages[0]
    return (
      <>
        <div
          className="main-container"
          ref={(el) => {
            this._container = el
          }}
          style={{
            userSelect: project.userSelect,
            WebkitUserSelect: project.userSelect
          }}
        >
          {project.pages.length > 1 && typeof window !== 'undefined' ? (
            <WithRouter
              ANIMATION_MAP={ANIMATION_MAP}
              xEditorStore={xEditorStore}
              project={project}
              pages={pages}
              onBack={this.onBack}
            />
          ) : (
            <Page
              project={project}
              key={page.id}
              container={page}
              widgets={page.widgets}
              onAction={this._handleAction}
              getRef={(node) => {
                me.pages[0] = node
              }}
            />
          )}
        </div>
        {this.state.onlineTestUrl && <HEOnlineTestTip />}
      </>
    )
  }

  updateDimensions() {
    // 解决resize执行两次问题
    let project = this.props.project
    let clientSize = god.clientSize
    clientSize.width = document.documentElement.clientWidth
    clientSize.height = document.documentElement.clientHeight

    let width = project.stageWidth
      ? Math.min(project.maxWidth, clientSize.width)
      : Math.min(clientSize.width, 750)
    let height = document.documentElement.clientHeight
    // 更改只触发一次渲染
    let disposer = autorun(() => {
      god.stageSize.width = width
      god.stageSize.height = height
    })

    disposer()
  }

  componentDidMount() {
    var delay
    let onResize = () => {
      // 为什么横屏变为竖屏执行两次，竖屏变为横屏执行一次
      // 解决resize执行两次的问题
      clearTimeout(delay)
      delay = setTimeout(this.updateDimensions.bind(this), 100)
    }
    god.addEventListener('resize', onResize)
  }
}

export default connectToStore(Project)
