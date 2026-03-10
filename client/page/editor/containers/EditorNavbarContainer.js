import React from 'react'
import { withRouter } from 'react-router-dom'
import { insertWidget } from 'common/widget'
import { observer } from 'mobx-react'
import { connectToStore } from 'components/StoreContext'
import { WidgetConfigs } from 'widgets'
import EditorNavbar from '../components/EditorNavbar'
import { connectToast } from 'context/feedback'
@observer
class EditorNavbarContainer extends React.Component {
  state = {
    activeMenu: null
  }

  _handleMenuToggle = (event, key) => {
    this.setState((prevState) => ({
      activeMenu: key == prevState.activeMenu ? null : key
    }))
  }

  _handleMenuClose = () => {
    this.setState({ activeMenu: null })
  }

  _handleAddWidget = async (event, originWidget) => {
    insertWidget(event, originWidget)
    this.setState({ activeMenu: null })
  }

  render() {
    const { store } = this.props
    const { activeMenu } = this.state
    const status = god.PageData.project.status
    const stageStore = store.getStageStore()
    const customWidgets = WidgetConfigs
      // TODO Change isBuildIn to isBuiltIn
      .filter((config) => !config.isBuildIn)
    const userInfo = god.PageData.userInfo
    return (
      <React.Fragment>
        {/*
          TODO: 拆分navBar，比如在 !showWidgets 时，
          组件选项不需要加载，onAddWidget 也不需要
          而 saving 返回 等 action 则永远需要
        */}
        <EditorNavbar
          store={store}
          status={status}
          userInfo={userInfo}
          activeMenu={activeMenu}
          showBetaFeature={stageStore.experimentFlag}
          onMenuOpen={this._handleMenuToggle}
          onMenuClose={this._handleMenuClose}
          onApproConfirmOpen={this._handleApproConfirmOpen}
          onAddWidget={this._handleAddWidget}
          customWidgets={customWidgets}
        />
      </React.Fragment>
    )
  }
}

export default withRouter(connectToast(connectToStore(EditorNavbarContainer)))
