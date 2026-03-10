import React from 'react';
import ColorUtil from 'utils/ColorUtils';

function ColorText(props) {
  const { color, alpha, size = 24, ...others } = props;

  return (
    <svg
      width={size}
      height={size}
      {...others}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        fill={ColorUtil.hexToRgba(color, alpha) || 'currentColor'}
        d="M0 20h24v4H0z"
      />
      <path d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z" />
    </svg>
  );
}
export default ColorText;
