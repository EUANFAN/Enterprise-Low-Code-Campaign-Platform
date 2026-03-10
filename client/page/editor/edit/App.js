import React, { Fragment } from 'react'
import { observer } from 'mobx-react'
import Hotkeys from 'react-hot-keys'
import { Modal, message } from 'antd'
// 对json数据做处理
import jsonpatch from 'fast-json-patch'
import store from 'store/stage'
// 中部工作空间
import WorkSpace from 'components/HEWorkSpace'
import { connectToStore } from 'components/StoreContext'
// 右侧配置面板
import SettingsPanel from 'components/HESettingsPanel'
// 左侧页面列表
import EdiotrLeftTabContainer from '../containers/EditorLeftTabContainer'
// 顶部导航空间
import EditorNavbarContainer from '../containers/EditorNavbarContainer'
import { hasInputFocus } from 'common/utils'
import LocalStorage from 'common/localStorage'
import { PROJECT_STATUS } from 'common/constants'
import ClipboardUtils from 'utils/ClipboardUtils'
import './App.less'

const copyText = ClipboardUtils.copyTextToClipboard
const projectOrThemeId = god.PageData.project._id

function getValue(project, path) {
  return path
    .split('/')
    .slice(1)
    .reduce((result, seg) => result[seg], project)
}

// 忽略某些成分
function isValidPatch(patches, project) {
  let rs = []
  for (let i = 0; i < patches.length; i++) {
    let p = patches[i]
    let ignored = false
    let whiteList = [
      '/lastModified',
      '/lastModifyTime',
      '/logId',
      '/lastPublished',
      '/_id',
      '/themeId',
      /pages\/\d+\/widgets\/\d+\/isSelected/,
      /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/isSelected/,
      /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/adjusted/
    ]

    if (p.op == 'remove' && typeof getValue(project, p.path) == 'function') {
      continue
    }

    whiteList.forEach((item) => {
      if (item instanceof RegExp) {
        if (item.test(p.path)) {
          ignored = true
        }
      } else {
        if (item == p.path) {
          ignored = true
        }
      }
    })

    if (ignored) {
      continue
    }
    rs.push(p)
  }
  return rs.length > 0
}
@observer
class Editor extends React.Component {
  StageSidePanelWidth = 697
  state = {
    workspace: { width: document.body.offsetWidth - this.StageSidePanelWidth }
  }

  setWorkspaceWidth = (width, dis) => {
    width = (width ? width : this.state.workspace.width) + (dis ? dis : 0)
    this.setState({ workspace: { width: width } })
  }

  getIdTree = (nodes = []) => {
    return nodes.map((node) => {
      return {
        id: node.id,
        children: this.getIdTree(node.layers || node.widgets || [])
      }
    })
  }

  getTriggers = (nodes = []) => {
    let result = []
    nodes.map((node) => {
      if (node.triggers && node.triggers.length) {
        node.triggers.forEach((trigger) => {
          result.push(trigger)
        })
      }

      let children = node.layers || node.widgets || []

      if (children.length) {
        result = result.concat(this.getTriggers(children))
      }
    })

    return result
  }

  getNewIds = (ids, cursor = 0, origin, current) => {
    let result = []
    let seg = ids[cursor]
    origin.forEach((component, index) => {
      if (component.id == seg) {
        result.push(current[index].id)
        result = result.concat(
          this.getNewIds(
            ids,
            ++cursor,
            component.children,
            current[index].children
          )
        )
      }
    })

    return result
  }

  // 快捷键
  shift = (changeLeft, changeTop) => {
    let stage = store.getStageStore().getCurrentStage()
    let widgets = stage.getSelectedChildren()
    if (widgets.length && !hasInputFocus()) {
      widgets.forEach(function (widget) {
        let modifyPosition = {
          left: widget.left + changeLeft,
          top: widget.top + changeTop
        }
        // 锁定时上下左右移动不生效
        !widget.locked && widget.modify(modifyPosition, '', null, true)
      })
    }
  }

  // 快捷键
  selectAll = () => {
    let stage = store.getStageStore().getCurrentStage()

    if (!hasInputFocus()) {
      let selectWidgetIds = stage.list.map((widget) => widget.id)
      stage.selectChildren(selectWidgetIds)
    }
  }

  // 快捷键
  copy = () => {
    let stage = store.getStageStore().getCurrentStage()
    let selectWidgets = stage.getSelectedChildren()

    if (selectWidgets.length && !hasInputFocus()) {
      const success = copyText(
        JSON.stringify({
          project: 'h5',
          pageId: stage.component.id,
          widgets: selectWidgets
        })
      )
      if (success) {
        message.success('操作成功，已放置在剪贴板中，请使用 ctrl + v 粘贴')
      } else {
        message.error('操作失败')
      }
    }
  }

  // 快捷键
  cut = (page) => {
    let me = this
    if (!hasInputFocus()) {
      me.copy(page)
      me.delete(page)
    }
  }

  // 快捷键
  delete = () => {
    let stage = store.getStageStore().getCurrentStage()
    let widgets = stage.getSelectedChildren()
    if (widgets.length && !hasInputFocus()) {
      let ids = widgets.map((widget) => widget.id)
      stage.removeChildren(ids, null, true)
    }
  }

  _handleNavigateBack = () => {
    god.history.back()
  }

  _handleExperimentMode = () => {
    const stage = store.getStageStore()
    stage.toggleExperimentFlag()
  }

  getHotKeys = () => {
    return (
      <Fragment>
        <Hotkeys
          key="left"
          keyName="left"
          onKeyDown={() => this.shift(-1, 0)}
        />
        <Hotkeys key="up" keyName="up" onKeyDown={() => this.shift(0, -1)} />
        <Hotkeys
          key="right"
          keyName="right"
          onKeyDown={() => this.shift(1, 0)}
        />
        <Hotkeys key="down" keyName="down" onKeyDown={() => this.shift(0, 1)} />
        <Hotkeys
          key="toggleExperiment"
          keyName="control+shift+e"
          onKeyDown={this._handleExperimentMode}
        />
        <Hotkeys
          key="backspace"
          keyName="backspace,delete"
          onKeyDown={() => this.delete()}
        />
        <Hotkeys
          key="selectall"
          keyName="control+a,⌘+a"
          onKeyDown={() => this.selectAll()}
        />
        <Hotkeys
          key="copy"
          keyName="control+c,⌘+c"
          onKeyDown={() => this.copy()}
        />
        <Hotkeys
          key="cut"
          keyName="control+x,⌘+x"
          onKeyDown={() => this.cut()}
        />
      </Fragment>
    )
  }

  async componentDidMount() {
    document.body.addEventListener('paste', (e) => {
      let stage = store.getStageStore().getCurrentStage()

      if (!hasInputFocus()) {
        let pastedText = e.clipboardData.getData('Text')
        let data = {}
        try {
          data = JSON.parse(pastedText)
        } catch (e) {
          data = {}
        }

        if (data.project === 'h5') {
          let widgets = data.widgets
          stage.unselectChildren()
          let map = {}
          stage.addChildren(widgets, map)
        }
      }
    })

    // 阻止向上向下箭头 导致页面滚动
    god.document.addEventListener('keydown', function (e) {
      if (!hasInputFocus() && ['ArrowDown', 'ArrowUp'].indexOf(e.code) !== -1) {
        e.preventDefault()
      }
    })

    // 第一次进入.
    let isFirstEnter = await LocalStorage.getItem('isFirstEnter')
    if (!isFirstEnter) {
      LocalStorage.clear().then(() => {
        LocalStorage.setItem('isFirstEnter', true)
      })
    }

    // 加载历史记录.
    LocalStorage.getItem(projectOrThemeId).then(function (data) {
      let stageStoreDataInLocal = null
      if (!data) return
      try {
        stageStoreDataInLocal = JSON.parse(data)
      } catch (__) {
        // do nothing
      }
      let patches = jsonpatch.compare(
        god.PageData.project.revisionData,
        stageStoreDataInLocal
      )
      // 说明有差异
      if (isValidPatch(patches, god.PageData.project.revisionData)) {
        Modal.confirm({
          title: '编辑中断？',
          // prettier-ignore
          content: `本地改动已经保存，上次修改时间为${new Date(stageStoreDataInLocal.lastModifyTime)}是否加载本地修改？`,
          okText: '加载本地改动',
          cancelText: '忽略吧~',
          onOk() {
            store.init(stageStoreDataInLocal)
          },
          onCancel() {
            LocalStorage.removeItem(projectOrThemeId)
          }
        })
      }
    })
  }

  render() {
    const { config } = this.props
    const {
      workspace: { width }
    } = this.state
    const status = god.PageData.project.status
    const stageStore = store.getStageStore()
    // prettier-ignore
    const backgroundUrl = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><text x="0" y="50" fill="Silver" transform="rotate(-45 50,20)">${PROJECT_STATUS[status] ? PROJECT_STATUS[status].text : ''}</text></svg>')  20px top repeat`
    const isHotKeys = config.STAGE && config.STAGE.MOUSE

    return (
      <div className="main-content h5-editor-edit-page">
        <EditorNavbarContainer />
        <div className="h5-editor-edit-page__layout">
          <EdiotrLeftTabContainer clickLeftTab={this.setWorkspaceWidth} />
          <div
            className="main-center h5-editor-edit-page__layout__content"
            style={{
              background: backgroundUrl,
              backgroundSize: '30% 30%',
              backgroundColor: '#E8EAED'
            }}
          >
            <WorkSpace
              getRef={(node) => {
                this.workspace = node
              }}
              width={width}
              computeWorkspaceWidth={this.setWorkspaceWidth}
            />
          </div>
          <SettingsPanel />
          {!stageStore.closeHotKeys && isHotKeys && this.getHotKeys()}
        </div>
      </div>
    )
  }
}

let EditorApp = connectToStore(Editor)

export default class App extends React.Component {
  render() {
    return (
      <div className="editor-page">
        <EditorApp />
      </div>
    )
  }
}
