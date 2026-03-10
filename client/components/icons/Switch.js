import React from 'react';
import classNames from 'classnames';

export default class Switch extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg
        {...others}
        className={className}
        viewBox="0 0 24 17"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24 11.25L17.99 6v2.933H9v4.636h8.991V16.5L24 11.25zm-9-8.317H6.009V0L0 5.25l6.01 5.25V7.569H15V2.933z"
          fillRule="nonzero"
        />
      </svg>
    );
  }
}
