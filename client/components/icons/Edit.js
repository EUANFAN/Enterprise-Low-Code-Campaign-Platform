import React from 'react';
import classNames from 'classnames';

export default class Edit extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg
        {...others}
        className={className}
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M825.6 448a37.12 37.12 0 0 0-37.12 37.76v243.2a56.96 56.96 0 0 1-56.32 56.32H291.84a56.96 56.96 0 0 1-56.32-56.32v-441.6a56.96 56.96 0 0 1 56.32-56.32h248.32A37.12 37.12 0 0 0 576 192a33.28 33.28 0 0 0-37.12-32.64H291.84a128 128 0 0 0-128 128v439.68a128 128 0 0 0 128 128h439.68a128 128 0 0 0 128-128V488.32c-1.28-23.04-15.36-40.32-33.92-40.32z"
          fill="#4D4D4D"
          p-id="1181"
        ></path>
        <path
          d="M362.24 647.68a33.92 33.92 0 0 0 46.72 0l412.16-412.16a36.48 36.48 0 1 0-51.2-51.2L362.24 600.96a42.24 42.24 0 0 0 0 46.72z"
          fill="#4D4D4D"
          p-id="1182"
        ></path>
      </svg>
    );
  }
}
