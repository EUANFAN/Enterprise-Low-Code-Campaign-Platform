import React, { Fragment } from 'react';
import { observer } from 'mobx-react';
import './index.less';
import { Col, Row, Modal, Input, TreeSelect } from 'antd';
import { getRuleConfig } from 'apis/RuleAPI.js';
import QueryString from 'common/queryString';
import { loadTriggerConfig } from 'triggers';
@observer
class EditWidgetList extends React.Component {
  render() {
    const { project, onTreeSelectChange, value } = this.props;
    // let list = [];
    const treeData = project.pages.map((page) => {
      const children = page.widgets.map((widget) => {
        return {
          title: widget.name,
          value: widget.path,
          data: widget,
          type: 'widget',
        };
      });
      const treeItem = {
        title: page.name,
        value: page.path,
        children,
        selectable: false,
        type: 'page',
      };
      return treeItem;
    });
    const projectTree = {
      title: '公共参数',
      value: 'project',
      type: 'project',
    };
    treeData.unshift(projectTree);
    return (
      <TreeSelect
        style={{ width: '248px' }}
        value={value}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        treeData={treeData}
        placeholder="请选择widget属性"
        treeDefaultExpandAll
        onChange={onTreeSelectChange}
      />
    );
  }
}

@observer
class EditConfigState extends React.Component {
  state = {
    localPageState: [],
    themeBoxVisible: false,
  };
  async componentDidMount() {}
  show = async () => {
    const ruleId = QueryString.parse(location.search).ruleId;
    const rule = await getRuleConfig(ruleId);
    let ruleStoreConfig = {};
    if (rule) {
      const ruleWidget = rule.ruleWidget;
      const RULES_CONFIG = await loadTriggerConfig({
        type: ruleWidget.type,
        version: ruleWidget.version,
      });
      if (RULES_CONFIG) {
        ruleStoreConfig = RULES_CONFIG.config;
      }
    }
    let project = this.props.project;
    const pageState = project.editConfigState || {};
    const localPageState = Object.keys(ruleStoreConfig).map((key) => {
      return {
        key,
        text: ruleStoreConfig[key].text,
        value: pageState[key] || 'project',
      };
    });
    this.setState({
      themeBoxVisible: true,
      localPageState: localPageState,
    });
  };

  cancel = () => {
    this.setState({
      themeBoxVisible: false,
    });
  };

  ok = () => {
    const { localPageState } = this.state;
    let variable = {};
    localPageState.forEach((item) => {
      variable[item.key] = item.value;
    });

    this.props.project.modify({
      editConfigState: variable,
    });
    this.setState({
      themeBoxVisible: false,
      localPageState: [],
    });
  };

  onTreeSelectChange = (newValue, index) => {
    const localPageState = this.state.localPageState;
    localPageState[index]['value'] = newValue;
    this.setState({
      localPageState,
    });
  };
  _getPageStateFields() {
    const { localPageState } = this.state;
    const { project } = this.props;
    let states = [];
    localPageState.forEach((value, index) => {
      states.push(
        <Row key={index} style={{ marginBottom: '10px' }}>
          <Col span={7} className="pagestate-box">
            <Input
              style={{ width: '100%' }}
              placeholder="请输入配置参数"
              value={value.text}
              disabled={true}
            />
          </Col>
          <Col span={7} className="pagestate-box">
            <EditWidgetList
              project={project}
              onTreeSelectChange={(newValue, label, extra) =>
                this.onTreeSelectChange(newValue, index, extra)
              }
              value={value.value}
            ></EditWidgetList>
          </Col>
        </Row>
      );
    });
    return (
      <Fragment>
        <div className="query">{states}</div>
      </Fragment>
    );
  }
  deleteData(index) {
    const { localPageState } = this.state;
    localPageState.splice(index, 1);
    this.setState({
      localPageState: localPageState,
    });
  }
  render() {
    let me = this;
    const { themeBoxVisible } = me.state;

    if (!themeBoxVisible) {
      return null;
    }

    return (
      <Modal
        title="配置参数"
        visible={true}
        onOk={this.ok}
        onCancel={this.cancel}
        width={600}
        height={650}
        style={{ paddingBottom: 0 }}
        okText="确认"
        cancelText="取消"
        className="data-modal"
      >
        {this._getPageStateFields()}
      </Modal>
    );
  }
}

export default EditConfigState;
