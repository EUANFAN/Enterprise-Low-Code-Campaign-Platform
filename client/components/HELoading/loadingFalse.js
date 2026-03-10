import React from 'react';
import classNames from 'classnames';

import LoadingFalse from 'components/icons/LoadingFalse';

import './loadingFalse.less';

export default class HELoadingFalse extends React.Component {
  static defaultProps = {
    className: '',
  };

  _handleReLoad = () => {
    god.location.reload();
  };

  render() {
    const { className: classNameFromProp } = this.props;
    const className = classNames(['he-loading-false', classNameFromProp]);

    return (
      <div className={className}>
        <div className="he-loading-false__content">
          <LoadingFalse />
          <span className="he-loading-false__content__network">
            {'加载失败，请检查网络设置'}
          </span>
          <span
            className="he-loading-false__content__reload"
            onClick={(event) => this._handleReLoad(event)}
          >
            {'重新加载'}
          </span>
        </div>
      </div>
    );
  }
}
