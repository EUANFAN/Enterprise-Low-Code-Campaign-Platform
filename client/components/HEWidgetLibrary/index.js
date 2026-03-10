import './index.less';
import React from 'react';
import { observer } from 'mobx-react';
import WidgetSelector from './WidgetSelector';
import { Modal } from 'antd';
@observer
class WidgetLibrary extends React.Component {
  _target = null;
  constructor(props) {
    super(props);
    this._target = this._getModalLayer();
  }
  _getModalLayer = () => {
    let target = document.getElementById('modal-layer');
    if (target) {
      return target;
    }

    const skyLayerElement = document.createElement('div');
    skyLayerElement.id = 'modal-layer';
    if (document.body) {
      document.body.appendChild(skyLayerElement);
    }
    return skyLayerElement;
  };
  state = {
    pagination: {},
  };
  show = () => {
    this.props.project.widgetLibraryVisible = true;
  };
  onCancel = () => {
    this.props.project.widgetLibraryVisible = false;
  };
  render() {
    const { onAddWidget, project } = this.props;
    return (
      <div>
        {project.widgetLibraryVisible ? (
          <Modal
            getContainer={this._target}
            title="行为组件"
            visible={project.widgetLibraryVisible}
            footer={null}
            width={860}
            maskClosable={false}
            onCancel={this.onCancel}
            wrapClassName="widget-library-box"
            centered
          >
            <div className="widget-library-box__body">
              <WidgetSelector
                project={project}
                onAddWidget={onAddWidget}
                onCancel={this.onCancel}
              ></WidgetSelector>
            </div>
          </Modal>
        ) : null}
      </div>
    );
  }
}
export default WidgetLibrary;
