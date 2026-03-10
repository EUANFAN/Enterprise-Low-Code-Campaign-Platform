import React from 'react';
import classNames from 'classnames';

import Checkbox from 'components/icons/Checkbox';

import './index.less';

export default class HESelectable extends React.Component {
  static defaultProps = {
    className: '',
    selected: false,
  };

  render() {
    const {
      selectable,
      selected,
      children,
      onToggleSelect,
      className: classNameFromProp,
    } = this.props;

    const className = classNames(['he-selectable', classNameFromProp], {
      'he-selectable--selected': selected,
    });
    return (
      <div className={className}>
        {React.Children.only(children)}
        {selectable && (
          <div className="he-selectable__overlay" onClick={onToggleSelect}>
            <Checkbox
              className="he-selectable__overlay__checkbox"
              checked={!!selected}
            />
          </div>
        )}
      </div>
    );
  }
}
