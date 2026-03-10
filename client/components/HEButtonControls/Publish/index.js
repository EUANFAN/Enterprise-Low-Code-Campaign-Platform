import React from 'react'
import HEIconButton from 'components/HEIconButton'
import Send from 'components/icons/Send'
import { getOnlineUrl } from 'common/utils'
import { toastError, toastLoading, toastSuccess } from 'components/HEToast'
import {
  updateProject,
  //   webhookApplicationCreateApi,
  projectsPublishHybridApi
} from 'apis/ProjectAPI'
import { context } from 'common/utils'
import { beforePublish } from 'common/lifecycle'
import ConfirmPublishModal from 'components/ConfirmPublishModal'
import { validateRoleLimit } from 'common/utils'
import AuditStatusManage from 'components/AuditStatusManage'
@AuditStatusManage
export default class Publish extends React.Component {
  state = {
    publishing: false,
    showPublishModal: false
  }

  _handleCloseModel = () => {
    this.setState({
      showPublishModal: false
    })
  }
  // 是否是模板编辑状态
  get isUpdateAuditStatus() {
    // 2 审核成功  0 未审核
    return PageData.isTheme && PageData.project.auditStatus === 2
  }
  get themeId() {
    return PageData.project.themeId || PageData.project._id
  }
  auditStatusManageFinish() {
    PageData.project.auditStatus = 0
  }
  _handlePublish = async () => {
    this.props.handleTempleteAudit.call(this)
    const { config } = this.props
    // 添加点击发布按钮的钩子，返回结果为true的时候才往下执行
    try {
      let beforeShowPublishResult = true
      if (config && typeof config['beforeShowPublish'] === 'function') {
        beforeShowPublishResult = await config.beforeShowPublish(context())
      }
      if (!beforeShowPublishResult) {
        return
      }
      this.setState({
        showPublishModal: true
      })
    } catch (err) {
      toastError('操作失败')
    }
  }

  _handleOnlinePublish = async () => {
    const { publishing } = this.state
    if (publishing) {
      return
    }
    this.setState({ publishing: true })
    const { store, config } = this.props
    const project = store.getProject()
    const targetId = project._id
    toastLoading('正在发布')
    try {
      /* 项目发布前组件的调用的方法 */
      await beforePublish(project)
      if (config && typeof config['beforePublish'] === 'function') {
        await config.beforePublish(context())
      }
      await updateProject(targetId, project, 'publish')
      if (config && typeof config['afterPublish'] === 'function') {
        await config.afterPublish(context())
      }
      // 获取hybrid信息
      //  await this._projectsPublishHybrid(project._id);
      toastSuccess('发布成功准备跳转')
      let url =
        project.editorType === 'theme'
          ? `/project/publish?id=${targetId}&editorType=theme`
          : `/project/publish?id=${targetId}`
      god.location.replace(url)
    } catch (err) {
      toastError(err.message || '发布失败')
      return
    } finally {
      this.setState({ publishing: false })
    }
  }
  async _projectsPublishHybrid(projectId) {
    const PageData = god.PageData
    let normalLink = PageData.url
    let project = PageData.project
    let { currentUrl } = await getOnlineUrl(normalLink, project)
    let parms2 = {
      projectId: projectId,
      url: currentUrl
    }
    return await projectsPublishHybridApi(parms2)
  }
  _handleOnlineTestPublish = async () => {
    const { publishing } = this.state
    if (publishing) {
      return
    }
    this.setState({ publishing: true })

    const { store, config } = this.props
    const project = store.getProject()
    const targetId = project._id

    toastLoading('正在发布')

    try {
      /* 项目发布前组件的调用的方法 */
      await beforePublish(project)
      if (config && typeof config['beforeTestPublish'] === 'function') {
        await config.beforeTestPublish(context())
      }
      await updateProject(targetId, project, 'online_test_publish')
      if (config && typeof config['afterTestPublish'] === 'function') {
        await config.afterTestPublish(context())
      }
      //   let parms = {
      //     productId: '',
      //     app_key: '',
      //     app_secrete: '',
      //     name: '',
      //     description: '',
      //     prefix_url: '',
      //     creator: '',
      //   };
      //   // 调用hybrid平台创建应用接口
      //   await webhookApplicationCreateApi(parms);

      // 获取hybrid信息
      await this._projectsPublishHybrid(project._id)
      toastSuccess('发布成功准备跳转')
      let url =
        project.editorType === 'theme'
          ? `/project/publish?id=${targetId}&env=online_test&editorType=theme`
          : `/project/publish?id=${targetId}&env=online_test`
      god.location.replace(url)
    } catch (err) {
      toastError(err.message || '发布失败')
      return
    } finally {
      this.setState({ publishing: false })
    }
  }

  render() {
    const { publishing, showPublishModal } = this.state
    if (!validateRoleLimit('publishProject')) {
      return null
    }
    return (
      <React.Fragment>
        <HEIconButton
          className="editor-navbar__actions__icon-button"
          iconElement={<Send />}
          disabled={publishing}
          titleElement={'发布'}
          onClick={this._handlePublish}
        />
        {showPublishModal && (
          <ConfirmPublishModal
            onClose={this._handleCloseModel}
            publishOnlineTest={this._handleOnlineTestPublish}
            publishOnline={this._handleOnlinePublish}
          />
        )}
      </React.Fragment>
    )
  }
}
