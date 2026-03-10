import React from 'react';
import './index.less';
class HEOnlineTestTip extends React.Component {
  state = {
    show: true,
  };
  closeModalTip() {
    this.setState({
      show: false,
    });
  }
  showModalTip() {
    this.setState({
      show: true,
    });
  }
  render() {
    return (
      <>
        {this.state.show && (
          <div id="testTips">
            <div className="testTipsContent">
              <p style={{ fontWeight: 'bold' }}>重要提示！</p>
              <p style={{ fontWeight: 'bold' }}>
                本页面仅为<span style={{ color: 'red' }}>线上测试</span>
                使用，请勿发送给用户，包括且不限于以下情况：
              </p>
              <p>1、禁止将本页面链接、二维码、小程序码发送给用户</p>
              <p>
                2、禁止将本页面链接、二维码、小程序码投放在抖音、微信等渠道
              </p>
              <p>3、禁止将本页面链接、二维码、小程序码使用在其他页面中</p>
              <div
                className="closeTestTips"
                onClick={this.closeModalTip.bind(this)}
              >
                关闭
              </div>
            </div>
          </div>
        )}
        <div id="testTipsBtn" onClick={this.showModalTip.bind(this)}>
          测试专用
        </div>
      </>
    );
  }
}
export default HEOnlineTestTip;
