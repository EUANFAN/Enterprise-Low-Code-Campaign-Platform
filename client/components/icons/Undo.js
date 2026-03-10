import React from 'react';
import classNames from 'classnames';
import Redo from 'components/icons/Redo';
import './Undo.less';

export default class Undo extends React.Component {
  render() {
    const { className: classNameInProps } = this.props;
    const className = classNames(['redo--undo', classNameInProps]);

    return <Redo className={className} />;
  }
}
