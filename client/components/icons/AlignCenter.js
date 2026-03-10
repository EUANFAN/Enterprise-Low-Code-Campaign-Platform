import React from 'react';
import classNames from 'classnames';

export default class AlignCenter extends React.Component {
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
        <path fill="#999999" d="M9 0h1v18H9z" />
        <rect
          fill="#4A82F7"
          transform="rotate(90 9 5.4)"
          x="7.2"
          y="-3.6"
          width="3.6"
          height="18"
          rx="1.8"
        />
        <rect
          fill="#4A82F7"
          transform="rotate(90 9 12.6)"
          x="7.2"
          y="7.2"
          width="3.6"
          height="10.8"
          rx="1.8"
        />
      </svg>
    );
  }
}
