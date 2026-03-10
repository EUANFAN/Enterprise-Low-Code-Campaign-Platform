import React from 'react';
import classNames from 'classnames';

export default class VerticalCenter extends React.Component {
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
          transform="rotate(-90 9 9)"
        >
          <path fill="#999999" d="M9 0h1v18H9z" />
          <rect
            width="3.6"
            height="18"
            x="7.2"
            y="-3.6"
            fill="#4A82F7"
            rx="1.8"
            transform="rotate(90 9 5.4)"
          />
          <rect
            width="3.6"
            height="10.8"
            x="7.2"
            y="7.2"
            fill="#4A82F7"
            rx="1.8"
            transform="rotate(90 9 12.6)"
          />
        </g>
      </svg>
    );
  }
}
