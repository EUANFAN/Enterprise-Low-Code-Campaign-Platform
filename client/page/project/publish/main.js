import 'globals'
import './main.less'

import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { getStageConfig } from 'common/config'

const PageData = god.PageData

getStageConfig('PUBLISH').then((res) => {
  if (res.loaded) {
    ReactDOM.render(
      <App
        config={res.config}
        normalLink={PageData.url}
        shortlink={PageData.shortUrl}
        jsonlink={PageData.jsonUrl}
        miniprogramId={PageData.miniprogramId} // 小程序id
        miniprogramUrl={PageData.miniprogramUrl} // 小程序基础路径
        minicodeUrl={PageData.minicodeUrl} // 小程序二维码
        themeGroupType={PageData.themeGroupType}
        pages={PageData.pages}
        project={PageData.project}
        name={PageData.project.name}
        componentPlat={PageData.project.revisionData.componentPlat}
        userInfo={PageData.userInfo}
        projectId={PageData.project._id}
      />,
      document.getElementById('main')
    )
  }
})
