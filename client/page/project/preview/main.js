import 'globals'
import './main.less'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
let PageData = god.PageData
import { ActionKeys } from 'common/constants'
// 项目数据源可能会用到
// import handlePageDataByVariable from 'common/handlePageDataByVariable';
// 用iframe会有两种情况：
// 1、在h5中的预览
// 2、在h5容器中渲染
god.inPreview = true
let needHydrate = PageData.needHydrate
async function renderDom() {
  // 需要支持截图
  if (god.top != god && !~location.host.indexOf(PageData.DOMAIN)) {
    import(/* webpackChunkName: "Shortcut" */ './Shortcut').then(
      (ShortcutProject) => {
        ReactDOM.render(
          <App ProjectClazz={ShortcutProject.default} />,
          document.getElementById('main')
        )

        // 消息传递，用于截图
        god.addEventListener('message', (event) => {
          const { action, payload } = event.data
          switch (action) {
            case ActionKeys.SCREENSHOT: {
              return god.shortcutEle
                .screenshot(payload.scale)
                .then((images) => {
                  event.source.postMessage(
                    {
                      action: ActionKeys.SCREENSHOT_RESULT,
                      payload: {
                        images,
                        screenshotId: payload.screenshotId
                      }
                    },
                    event.origin
                  )
                })
            }
          }
        })
      }
    )
  } else {
    const { runingStartTime, runingEndTime } = PageData.project
    const now = Date.now()
    let projectStatus = 'NORMAL'

    if (now < new Date(runingStartTime).getTime()) {
      projectStatus = 'NO_START'
    }

    if (now > new Date(runingEndTime).getTime()) {
      projectStatus = 'COMPLETE'
    }
    // 如果项目状态为未开始或已结束，那就重新渲染，不用水合
    if (projectStatus != 'NORMAL') {
      needHydrate = false
    }

    ReactDOM[needHydrate ? 'hydrate' : 'render'](
      <App projectStatus={projectStatus} />,
      document.getElementById('main')
    )
  }

  let loadingBox = document.getElementById('loading-mask')
  loadingBox && loadingBox.remove()
}

if (
  PageData.project &&
  PageData.project.pages &&
  PageData.project.pages.length > 1
) {
  god.addEventListener(
    'load',
    function () {
      renderDom()
    },
    false
  )
} else {
  renderDom()
}
