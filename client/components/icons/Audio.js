import React from 'react';
import classNames from 'classnames';

export default class Audio extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg {...others} className={className} viewBox="0 0 162 162">
        <g transform="translate(54 57)" fillRule="evenodd" fill="#fff">
          <rect x="24" width="4" height="46" rx="2" />
          <rect x="36" y="8" width="4" height="30" rx="2" />
          <rect x="48" y="15" width="4" height="16" rx="2" />
          <rect y="8" width="4" height="30" rx="2" />
          <rect x="12" y="15" width="4" height="16" rx="2" />
        </g>
      </svg>
    );
  }
}
