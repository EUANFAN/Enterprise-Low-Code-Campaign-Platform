import React from 'react'
import './index.less'

export default class Offline extends React.Component {
  onJump = () => {
    god.location.href = 'https://www.xiwang.com'
    return
  }
  render() {
    const { projectRunningStatus } = this.props
    return (
      <div className="offline-wrap">
        <div className="offline-wrap-logo">
          <img src="https://m.xiwang.com/resources/xiwang-silogan-lAuJaOxibUVlnRHrjPaKh.png"></img>
        </div>
        <div className="offline-wrap-content">
          <p>此活动{projectRunningStatus},</p>
          <p>快去参加更多精彩活动吧</p>
        </div>
        <button className="offline-wrap-more-btn" onClick={this.onJump}>
          参与更多精彩活动
        </button>
      </div>
    )
  }
}
