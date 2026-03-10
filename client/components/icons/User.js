import React from 'react';
import classNames from 'classnames';

export default class User extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg
        {...others}
        className={className}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          fillOpacity="0.297412817"
          fill="#4A82F7"
          cx="12"
          cy="12"
          r="12"
        />
        <path
          d="M12 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm-3 1h6a3 3 0 0 1 0 6H9a3 3 0 0 1 0-6z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }
}
