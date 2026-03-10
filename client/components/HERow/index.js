import './index.less';
import React from 'react';
function Row(props) {
  return <div className="he-row">{props.children}</div>;
}

function Label(props) {
  return <label className="he-row__label">{props.children}</label>;
}

function Text(props) {
  const { children, ...elseProps } = props;
  return (
    <span {...elseProps} className="he-row__text">
      {children}
    </span>
  );
}

export { Label, Row, Text };
