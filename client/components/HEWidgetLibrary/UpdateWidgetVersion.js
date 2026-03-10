import './index.less';
import React from 'react';
import { Select, Button, Modal } from 'antd';
import { getWidgetList } from 'apis/WidgetAPI';
const { Option } = Select;
import store from 'store/stage';
import { loadTriggerConfig } from 'triggers';
import { loadWidgetConfig } from 'widgets';
const confirm = Modal.confirm;

const updateWidgetVersion = (targetWidget, callback) => {
  confirm({
    title: '确认',
    content:
      '你真的将' +
      '【' +
      targetWidget.name +
      '】' +
      '组件更新到' +
      targetWidget.version +
      '版本吗？',
    async onOk() {
      callback(
        targetWidget,
        targetWidget.category === 'widget'
          ? await loadWidgetConfig({
              type: targetWidget.type,
              version: targetWidget.version,
            })
          : await loadTriggerConfig({
              type: targetWidget.type,
              version: targetWidget.version,
            })
      );
    },
  });
};

class UpdateWidgetVersion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedVersion: '',
      widgetHistory: [],
    };
  }
  async getWidgetHistoryList() {
    const widget = await this.getWidget();
    return widget ? widget.historys : [];
  }
  // 获取当前页面内使用的组件
  getUsedComponents() {
    let stageStore = store.getStageStore();
    return stageStore.getUsedComponents() || {};
  }
  onSelectChange(value) {
    this.setState({ selectedVersion: value });
  }
  async getWidget() {
    const { WidgetConfig } = this.props;
    const components = await getWidgetList({
      q: WidgetConfig.type,
      type: WidgetConfig.category,
      precise: true,
    });
    return components.widgets.find((item) => {
      return item.type === WidgetConfig.type;
    });
  }
  async update(selectedVersion) {
    const widget = await this.getWidget();
    const { updateAfterCallback } = this.props;
    widget.version = selectedVersion;
    updateWidgetVersion(widget, updateAfterCallback);
  }
  async componentDidMount() {
    const widgetHistory = await this.getWidgetHistoryList();
    this.setState({
      widgetHistory,
    });
  }
  render() {
    const { widgetHistory, selectedVersion } = this.state;
    const { installedVersion } = this.props;

    if (!widgetHistory.length) return null;
    const Options = widgetHistory.map((widget) => {
      return (
        <Option key={widget.version} value={widget.version}>
          {widget.version}
        </Option>
      );
    });
    return (
      <React.Fragment>
        <Select
          defaultValue={installedVersion}
          onChange={this.onSelectChange.bind(this)}
          style={{ width: '100px' }}
        >
          {Options}
        </Select>
        {selectedVersion && selectedVersion !== installedVersion && (
          <Button
            type="primary"
            onClick={this.update.bind(this, selectedVersion)}
            style={{ marginLeft: '10px' }}
          >
            {'更新'}
          </Button>
        )}
      </React.Fragment>
    );
  }
}
export default UpdateWidgetVersion;
