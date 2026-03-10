import React from 'react';
import logoSrc from 'static/imgs/logo2.png';
export default class Logo extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const logoStyle = {
      width: '130px',
      margin: '0 auto',
    };
    return <img src={logoSrc} style={logoStyle} onClick={this.props.onClick} />;
  }
}
