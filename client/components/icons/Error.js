import React from 'react';
import classNames from 'classnames';

export default class Error extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg
        {...others}
        className={className}
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fillRule="nonzero" fill="none">
          <path
            d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0z"
            fill="#f7551c"
          />
          <path
            d="M9.445 11.23c.111.333.334.555.667.555.334 0 .556-.222.668-.556l.444-6.117c0-.667-.556-1.112-1.112-1.112C9.445 4 9 4.556 9 5.223l.445 6.006zm.667 1.668c-.667 0-1.112.444-1.112 1.112 0 .667.445 1.112 1.112 1.112.668 0 1.112-.445 1.112-1.112 0-.668-.444-1.112-1.112-1.112z"
            fill="#fff"
          />
        </g>
      </svg>
    );
  }
}
