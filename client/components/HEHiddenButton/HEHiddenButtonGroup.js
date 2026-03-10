import React from 'react';
import classNames from 'classnames';
import './HEHiddenButtonGroup.less';

export default class HEHiddenButtonGroup extends React.Component {
  static defaultProps = {
    className: '',
  };

  render() {
    const { className: classNameFromProp, children } = this.props;
    const className = classNames(['he-hidden-button-group', classNameFromProp]);

    return (
      <div className={className}>
        {React.Children.toArray(children).map((child, index, array) => {
          if (index !== array.length - 1) {
            return <React.Fragment key={index}>{child}</React.Fragment>;
          }
          return React.cloneElement(child, { key: index });
        })}
      </div>
    );
  }
}
