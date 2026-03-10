import React from 'react';
import classNames from 'classnames';

export default class Text extends React.Component {
  render() {
    const { className: classNameInProps, ...others } = this.props;
    const className = classNames(['icon', classNameInProps]);

    return (
      <svg
        {...others}
        className={className}
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="2866"
        width="24"
        height="24"
      >
        <path
          d="M853.333333 138.666667H170.666667c-17.066667 0-32 14.933333-32 32v128c0 17.066667 14.933333 32 32 32s32-14.933333 32-32V202.666667h277.333333v618.666666H384c-17.066667 0-32 14.933333-32 32s14.933333 32 32 32h256c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32h-96v-618.666666h277.333333V298.666667c0 17.066667 14.933333 32 32 32s32-14.933333 32-32V170.666667c0-17.066667-14.933333-32-32-32z"
          p-id="2867"
        ></path>
      </svg>
    );
  }
}
