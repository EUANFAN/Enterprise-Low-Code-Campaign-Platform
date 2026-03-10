import React from 'react';
import classNames from 'classnames';

import './Loading.less';

const ARRAY_OF_SIZE_12 = new Array(12).fill(null);

export default function Loading(props) {
  const { className: classNameInProps, ...others } = props;
  const className = classNames(['icon', 'loading-icon', classNameInProps]);

  return (
    <svg
      {...others}
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <path
          id="thumb"
          d="M0-6c-.45 0-.75-.3-.75-.75v-4.5c0-.375.3-.75.75-.75.375 0 .75.3.75.75v4.5C.75-6.3.45-6 0-6z"
        />
      </defs>
      <g
        fill="#333"
        fillRule="nonzero"
        opacity=".602"
        transform="translate(12 12)"
      >
        {ARRAY_OF_SIZE_12.map((_, index) => (
          <use key={index} xlinkHref="#thumb" />
        ))}
      </g>
    </svg>
  );
}
