import React from 'react';
import classNames from 'classnames';

export default class AlignLeft extends React.Component {
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
        <path fill="#999999" d="M.9 0h1v18h-1z" />
        <rect
          fill="#4A82F7"
          transform="rotate(90 10.8 5.4)"
          x="9"
          y="-0.9"
          width="3.6"
          height="12.6"
          rx="1.8"
        />
        <rect
          fill="#4A82F7"
          transform="rotate(90 9 12.6)"
          x="7.2"
          y="8.1"
          width="3.6"
          height="9"
          rx="1.8"
        />
      </svg>
    );
  }
}
