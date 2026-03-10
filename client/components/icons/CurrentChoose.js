import React from 'react';
import classNames from 'classnames';

export default class Move extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);
    return (
      <svg
        {...others}
        className={className}
        viewBox="0 0 1024 1024"
        version="1"
        width="24"
        height="24"
      >
        <path
          d="M864 896h-704a32 32 0 0 1-32-32v-704a32 32 0 0 1 32-32h704a32 32 0 0 1 32 32v704a32 32 0 0 1-32 32zM192 832h640V192H192z"
          p-id="1652"
        ></path>
        <path
          d="M416 704a30.08 30.08 0 0 1-22.4-9.6l-128-128a31.36 31.36 0 0 1 44.8-44.8L416 626.56l297.6-296.96a31.36 31.36 0 0 1 44.8 44.8l-320 320a30.08 30.08 0 0 1-22.4 9.6z"
          p-id="1653"
        ></path>
      </svg>
    );
  }
}
