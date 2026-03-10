import React from 'react'
// 更新审核状态.
import { updateAuditStatus } from 'apis/ThemeAPI'

const HOCAuditStatusManage = (Component) => {
  class AuditStatusManage extends React.Component {
    get isUpdateAuditStatus() {
      throw new Error('必须重写该属性')
    }

    get themeId() {
      throw new Error('必须重写该属性')
    }

    auditStatusManageFinish() {
      throw new Error('必须重写该方法')
    }

    // 处理模板审核状态
    async handleTempleteAudit() {
      if (!this.isUpdateAuditStatus) return false

      try {
        const reqData = { auditStatus: 0 }
        const { code } = await updateAuditStatus(this.themeId, reqData)

        if (code === 0) {
          this.auditStatusManageFinish()
        }
      } catch (error) {
        console.error(error.message)
      }
    }

    render() {
      return (
        <Component
          handleTempleteAudit={this.handleTempleteAudit}
          {...this.props}
        />
      )
    }
  }

  return AuditStatusManage
}

export default HOCAuditStatusManage
