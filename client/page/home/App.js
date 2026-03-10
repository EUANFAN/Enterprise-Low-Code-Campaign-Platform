import React from 'react'
import { withRouter } from 'react-router-dom'
// HENavbar 头部 HENavbarPageList 头部中间的ul
import HENavBarGroup from 'components/HENavBarGroup'
import NoticeTip from 'components/NoticeTip'
import { toastSuccess, toastError } from 'components/HEToast'
import CreateProjectModal from '../components/CreateProjectModal'
import { ModalContext, connectToast } from 'context/feedback'
import Home from './index'
import { createProject } from 'apis/ProjectAPI'
import { delayPromise } from 'utils/FunctionUtils'
import './App.less'
import BUSINESS_LIST from 'common/businessList'
import { createRuleByTheme, setConfigData } from 'apis/RuleAPI'
const { userInfo } = god.PageData
class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      createProjectTarget: null,
      menuList: false,
      componentPlat: 'h5'
    }
  }
  _handleModalClose = () => {
    this._handleCreateProject(null)
  }

  _handleCreateProject = (event, target, componentPlat, theme) => {
    this.setState({
      createProjectTarget: target,
      componentPlat,
      theme
    })
  }

  _handleProjectSubmit = async (
    event,
    {
      name,
      pageCount,
      layoutType,
      roleId,
      folderId,
      runingStartTime,
      runingEndTime,
      componentPlat,
      miniProgramId
    }
  ) => {
    const { createProjectTarget, theme } = this.state
    console.log(name, pageCount)
    if (!name) return toastError('请输入项目名称！')
    if (!runingStartTime || !runingEndTime)
      return toastError('请输入项目时间！')
    if (runingStartTime.valueOf() > runingEndTime.valueOf())
      return toastError('开始时间不能小于结束时间！')
    let projectId,
      type = 'project',
      origin
    toastSuccess('创建项目中' + `: ${name}`)
    let result, ruleId
    try {
      if (theme.ruleId) {
        const rule = await createRuleByTheme({
          themeRuleId: theme.ruleId,
          themeId: theme._id,
          name
        })
        ruleId = rule._id

        // 此处给新建的规则项目在草稿箱保存一下规则模版的数据，防止一进入页面时没有数据
        await setConfigData({
          activityName: rule.name,
          member: rule.ownerId,
          sGroupId: 0,
          ruleId: rule._id,
          config: JSON.stringify(rule.revisionData),
          publicConfig: null,
          type: 'gray',
          business: rule.business || 'clientView'
        })
      } else {
        result = await createProject({
          roleId,
          path: folderId,
          name,
          pageCount,
          themeId: createProjectTarget,
          layoutType,
          type,
          runingTime: JSON.stringify({ runingStartTime, runingEndTime }),
          componentPlat,
          miniProgramId
        })
        projectId = result.projectId
        origin = result.origin
      }
    } catch (err) {
      toastError(err.message)
      return
    }
    toastSuccess('创建成功，即将跳转')
    console.log('projectId', projectId, 'ruleId', ruleId)

    // 延迟只是为了使用者体验，没有其他含义
    await delayPromise()
    if (ruleId) {
      god.location.href = `/customRule/${ruleId}`
    } else {
      god.location.href = BUSINESS_LIST[origin]
        ? `/rule/${projectId}`
        : `/editor/${projectId}`
    }
  }

  _handleLogOut = async () => {
    god.location.href = '/logout/index'
  }

  _handleMenuOpen = () => {
    this.setState((preState) => ({
      menuList: !preState.menuList
    }))
  }
  _handleMenuClose = () => {
    this.setState({
      menuList: false
    })
  }
  _handleSelect = (department) => {
    this.home._handleDrawerSelectNav(department)
  }
  render() {
    const { createProjectTarget, componentPlat } = this.state
    return (
      <ModalContext.Provider
        value={{
          onCreateProject: this._handleCreateProject
        }}
      >
        <NoticeTip></NoticeTip>
        <div className="h5">
          <div className="h5__navbar">
            <HENavBarGroup
              showDepartmentSelect={true}
              onSelect={this._handleSelect.bind(this)}
            />
          </div>
          <div className="h5__content">
            <Home userInfo={userInfo} onRef={(node) => (this.home = node)} />
          </div>
          {createProjectTarget != null && (
            <CreateProjectModal
              roles={userInfo.roles}
              componentPlat={componentPlat}
              onClose={this._handleModalClose}
              onSubmit={this._handleProjectSubmit}
            />
          )}
        </div>
      </ModalContext.Provider>
    )
  }
}

export default connectToast(withRouter(App))
