import React from 'react';
import classNames from 'classnames';
import './HEModalActions.less';

export default class HEModal extends React.Component {
  _skyLayer;

  static defaultProps = {
    className: '',
  };

  render() {
    const { className: classNameFromProp, children } = this.props;
    const className = classNames(['he-modal-actions', classNameFromProp]);

    return (
      <div className={className}>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, {
            className: classNames([
              child.props.className,
              'he-modal-actions__action he-button--large',
            ]),
          })
        )}
      </div>
    );
  }
}
