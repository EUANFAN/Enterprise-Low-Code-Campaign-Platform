import god from 'common/god'
import React from 'react'
import { observer } from 'mobx-react'
import Container from 'common/Container'
import loadScript from 'common/loadScript'
import { installTrigger } from 'triggers'
import { Provider, connectToStore } from 'components/StoreContext'
import { PROJECT_RUNNING_STATUS } from 'common/constants'
import { xesLogInit, sendLoadLog, getUrlParmas } from '@k9/x-com'
import Offline from 'components/Offline'
import { observable } from 'mobx'
import Project from './Project'
import store from 'store/preview'

let CurrentProject = Project
god.inPreview = true
@observer
class Preview extends Container {
  constructor(props) {
    super(props)
  }
  render() {
    let { ProjectClazz, store, projectStatus } = this.props
    let project = store.getProject()
    if (ProjectClazz) {
      CurrentProject = ProjectClazz
    }

    if (projectStatus && PROJECT_RUNNING_STATUS[projectStatus]) {
      return (
        <Offline projectRunningStatus={PROJECT_RUNNING_STATUS[projectStatus]} />
      )
    }

    return (
      <CurrentProject
        resources={PageData.resources}
        page={store.getPageIndex()}
        project={project}
        ref={(component) => {
          god.shortcutEle = component
        }}
      />
    )
  }
  UNSAFE_componentWillMount() {
    const { store } = this.props
    let PageData = god.PageData
    let project = store.getProject()

    let clientSize = god.clientSize
    // prettier-ignore
    let width = project.stageWidth ? Math.min(project.maxWidth, clientSize.width) : Math.min(750, clientSize.width)
    god.stageSize = observable({ height: clientSize.height, width })
    if (typeof window !== 'undefined') {
      // prettier-ignore
      const logType = project.isUseSensor === 'xeslog' ? 'xeslog' : project.sensorBusinessType
      console.log('project.comLogData => ', project.comLogData)
      xesLogInit(
        logType,
        project.comLogData.eventid && project.comLogData.eventid.value
      )
      if (logType === 'xeslog') {
        // 默认增加 页面加载前pv埋点
        if (!this.hasPageSendLogTrigger()) {
          console.log(
            '🚀 ~ file: App.js ~ line 73 ~ Preview ~ UNSAFE_componentWillMount ~ sendLoadLog'
          )
          sendLoadLog({
            ...getUrlParmas(),
            // prettier-ignore
            clickid: (project.comLogData.viewid && project.comLogData.viewid.value) || '',
            projectid: PageData.project._id,
            originhref: `${god.location.origin}${god.location.pathname}`
          })
          console.log(
            '🚀 ~ file: App.js ~ line 73 ~ Preview ~ UNSAFE_componentWillMount ~ sendLoadLog'
          )
        }
      }
    }
  }
  hasPageSendLogTrigger = () => {
    // 是否页面加载前定义了发送日志
    let pages = god.PageData.project.pages || []
    for (let i = 0; i < pages.length; i++) {
      // prettier-ignore
      if (pages[i].triggers && pages[i].triggers.findIndex((item) => item.event === 'willmount' && item.type === 'SendLog') > -1) {
        return true
      }
    }
    return false
  }
  componentDidMount() {
    // 预先加载行为组件
    PageData.lazyloadScripts &&
      PageData.lazyloadScripts.forEach((url) => {
        loadScript(url).then(function () {
          for (let componentName in god.__components__) {
            let component = god.__components__[componentName]
            if (component.category !== 'widget') {
              installTrigger(component)
            }
          }
        })
      })
  }
}
let PreviewApp = connectToStore(Preview)
class App extends React.Component {
  UNSAFE_componentWillMount() {
    const ProjectData = PageData.project
    store.initProject(ProjectData)
  }
  render() {
    return (
      <Provider value={store}>
        <PreviewApp {...this.props} />
      </Provider>
    )
  }
}

export default App
