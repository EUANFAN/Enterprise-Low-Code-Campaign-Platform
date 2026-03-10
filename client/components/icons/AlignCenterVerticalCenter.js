import React from 'react';
import classNames from 'classnames';

export default class AlignCenterVerticalCenter extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg
        {...others}
        className={className}
        viewBox="0 0 18 18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          fill="none"
          fillRule="evenodd"
          stroke="none"
          strokeWidth="1"
          transform="translate(-1)"
        >
          <path fill="#999999" d="M1.8 0h1v18h-1zM15.3 0h1v18h-1z" />
          <rect
            width="3.6"
            height="12.6"
            x="7.2"
            y="2.7"
            fill="#4A82F7"
            rx="1.8"
          />
        </g>
      </svg>
    );
  }
}
