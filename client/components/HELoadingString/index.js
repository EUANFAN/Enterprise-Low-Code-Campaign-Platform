import React from 'react';
import classNames from 'classnames';

import './index.less';

const DEFAULT_FONT_SIZE = 12;
const DEFAULT_LENGTH = 48;
const DEFAULT_LINE_HEIGHT = 1.2;

export default function HELoadingString(props) {
  const {
    className: classNameFromProp,
    fontSize = DEFAULT_FONT_SIZE,
    lineHeight = DEFAULT_LINE_HEIGHT,
    length = DEFAULT_LENGTH,
  } = props;
  const className = classNames(['he-loading-string', classNameFromProp]);

  return (
    <div
      className={className}
      style={{ height: fontSize * lineHeight, width: length }}
    />
  );
}
