import React from 'react';
import WidgetLibrary from 'components/HEWidgetLibrary';
import { Button } from 'antd';
import { observer } from 'mobx-react';

@observer
class WidgetTab extends React.Component {
  _widgetBox = React.createRef();
  _handleWidgetModalOpen = () => {
    this._widgetBox.current.show();
  };
  render() {
    const { project } = this.props;
    return (
      <div className="sub-btn-widget">
        <Button onClick={this._handleWidgetModalOpen} style={{ width: '100%' }}>
          {'行为组件管理'}
        </Button>
        <WidgetLibrary
          ref={this._widgetBox}
          project={project}
        />
      </div>
    );
  }
}
export default WidgetTab;