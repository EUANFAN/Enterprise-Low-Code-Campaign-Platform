import React from 'react';
import './Tip.less';
export default class Tip extends React.Component {
  render() {
    const { show } = this.props;
    return (
      <div className={show ? 'tip-box remove-in' : 'tip-box'}>
        {this.props.children}
      </div>
    );
  }
}
