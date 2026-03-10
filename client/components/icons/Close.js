import React from 'react';
import classNames from 'classnames';

export default class Close extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg {...others} className={className} viewBox="0 0 16 16" version="1">
        <path
          d="M8 6l6-6a1 1 0 1 1 1 2L9 8l6 6a1 1 0 1 1-1 1L8 9l-6 6a1 1 0 0 1-2-1l6-6-6-6a1 1 0 1 1 2-2l6 6z"
          fill="#D6D6D6"
          fillRule="evenodd"
        />
      </svg>
    );
  }
}
