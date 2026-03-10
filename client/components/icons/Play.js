import React from 'react';
import classNames from 'classnames';

export default class Arrow extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg {...others} className={className} viewBox="0 0 29 29">
        <path
          d="M14.5 0a14.5 14.5 0 1 0 0 29 14.5 14.5 0 0 0 0-29zm0 27.55a13.05 13.05 0 1 1 0-26.1 13.05 13.05 0 0 1 0 26.1zm6.58-14.08c-2.25-1.53-6.35-3.83-8.68-5.26-.95-.6-1.75-.36-1.83.7-.06 2.86 0 8.36 0 11.26.05 1.08 1 1.22 1.83.78l8.66-5.25c-.01 0 1.78-1 .02-2.23z"
          fill="#FFF"
          fillRule="nonzero"
          opacity=".8"
        />
      </svg>
    );
  }
}
