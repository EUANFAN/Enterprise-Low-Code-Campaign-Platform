import React from 'react';
import classNames from 'classnames';

export default class Success extends React.Component {
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
        <path
          d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zM7.994 14.056l-3.627-3.563.64-.938 2.987 2.153 7.014-5.764.625.486-7.64 7.626z"
          fill="#49c468"
          fillRule="nonzero"
        />
      </svg>
    );
  }
}
