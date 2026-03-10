import React from 'react';
import classNames from 'classnames';
import HEPaper from 'components/HEPaper';
import HEIcon from 'components/HEIcon';
import './HEDrawer.less';
import QrcodeImg from 'static/imgs/qrcode.png';

export default class HEDrawer extends React.Component {
  static defaultProps = {
    className: '',
  };
  _handleHelp = () => {
    if (god.location.hostname.indexOf('editor-dev') > -1) {
      god.open('https://editor.xiwang.com/docs/');
    } else {
      god.open(god.location.protocol + '//' + god.location.hostname + '/docs/');
    }
  };
  render() {
    const { className: classNameFromProp, children } = this.props;
    const className = classNames(['he-drawer', classNameFromProp]);

    return (
      <HEPaper className={className}>
        {children}
        <div className="he-drawer__footer">
          <span className="he-drawer__footer__item he-drawer__footer__item__suggestion">
            <HEIcon
              className={'he-drawer__footer__item__icon'}
              type={'icon-fankui'}
            />
            <span>反馈</span>
            <div className="he-drawer__footer__item__suggestion-content">
              <img src={QrcodeImg} />
              <div>{'知音楼反馈群'}</div>
            </div>
          </span>
          {/* TODO：暂时关闭帮助入口 */}
          {/* <span className="he-drawer__footer__item" onClick={this._handleHelp}>
            <HEIcon
              className={'he-drawer__footer__item__icon'}
              type={'icon-bangzhu'}
            />
            <span>帮助</span>
          </span> */}
        </div>
      </HEPaper>
    );
  }
}
