import './index.less';
import React from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
@observer
class WidgetCard extends React.Component {
  render() {
    const { widget, isSelected, onToggleSelect } = this.props;
    const className = classNames(['widget-card-box'], {
      'widget-card-box-selected': isSelected,
    });
    return (
      <div className={className} onClick={onToggleSelect}>
        <div className="widget-card-frame">
          <img src={widget.widgetUrl}></img>
        </div>
        <div className="widget-card-name">{widget.name}</div>
      </div>
    );
  }
}
export default WidgetCard;
