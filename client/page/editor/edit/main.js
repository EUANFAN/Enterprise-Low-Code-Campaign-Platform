import 'globals'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { observer } from 'mobx-react'
import store from 'store/stage'
import App from './App'
import { Provider, ConfigProvider } from 'components/StoreContext'
import { PAGE_WIDTH, PAGE_HEIGHT } from 'common/constants'
import { getStageConfig } from 'common/config'
const WrappedApp = observer(App)

god.stageSize = {
  width: PAGE_WIDTH,
  height: PAGE_HEIGHT
}

god.inEditor = true

const PageData = god.PageData
// 加载 editor 的几种情况 see [doc](doc/tech.md #进入 editor 现在有三种情况)
const editorType = PageData.isTheme ? 'theme' : 'project'
// TODO：defaultPageIndex 的逻辑当前已失效，需要FIX
// const defaultPageIndex = (god.location.hash.replace(/^#(\d+)$/g, '$1')).trim();
// TODO：改为 store.init(PageData.project, pageIndex);
PageData.project.revisionData.componentPlat =
  PageData.project.revisionData.componentPlat || 'h5' // 对于没有componentPlat的项目 默认为h5

store.init({
  ...PageData.project.revisionData,
  themeGroupId: PageData.project.themeGroupId,
  editable: PageData.project.editable,
  _id: PageData.project._id,
  origin: PageData.project.origin || '',
  thirdPartyConfig: PageData.project.thirdPartyConfig || '',
  editorType,
  ruleId: PageData.project.ruleId,
  name: PageData.project.name,
  ownerId: PageData.project.ownerId
})

getStageConfig('EDITOR').then(async (res) => {
  if (res.loaded) {
    ReactDOM.render(
      <Provider value={store}>
        <ConfigProvider value={res.config}>
          <BrowserRouter>
            <WrappedApp />
          </BrowserRouter>
        </ConfigProvider>
      </Provider>,
      // $FlowFixMe
      document.getElementById('main')
    )
  }
})
