import React, { Fragment } from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import './index.less';
import {
  Col,
  Row,
  message,
  Modal,
  Input,
  InputNumber,
  Select,
  Form,
  Icon,
} from 'antd';
import { checkValueByType } from 'common/checkType';
const { Option } = Select;
const FormItem = Form.Item;
@observer
class AddForm extends React.Component {
  state = {
    key: '',
    type: 'String',
    value: '',
  };
  handleSubmit = (e) => {
    e.preventDefault();
    let { addPageState, form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        addPageState(values.key, values.type, values.value);
        form.resetFields();
      }
    });
  };
  handlerChange = (value, key) => {
    if (key == 'type') {
      this.setState({
        type: value,
      });
    }
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline" onSubmit={this.handleSubmit}>
        <Col span={7} className="pagestate-box">
          <FormItem className="pagestate-formItem">
            {getFieldDecorator('key', {
              rules: [{ required: true, message: '请输入变量名称' }],
            })(
              <Input
                style={{ width: '100%' }}
                placeholder="请输入变量名称"
                id="key"
                name="key"
                onChange={(e) => this.handlerChange(e, 'key')}
              />
            )}
          </FormItem>
        </Col>
        <Col span={7} className="pagestate-box">
          <FormItem className="pagestate-formItem">
            {getFieldDecorator('type', {
              rules: [{ required: true, message: '请选择类型' }],
            })(
              <Select
                placeholder="请选择类型"
                style={{ width: '160px' }}
                onChange={(value) => this.handlerChange(value, 'type')}
              >
                <Option value="String">字符串</Option>
                <Option value="Number">数字</Option>
                <Option value="Boolean">布尔值</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={7} className="pagestate-box">
          <FormItem className="pagestate-formItem">
            {this.state.type == 'String' &&
              getFieldDecorator('value', {
                rules: [{ required: true, message: '请输入初始值' }],
              })(
                <Input
                  style={{ width: '100%' }}
                  placeholder="请输入初始值"
                  id="key"
                  name="key"
                />
              )}
            {this.state.type == 'Boolean' &&
              getFieldDecorator('value', {
                rules: [{ required: true, message: '请输入初始值' }],
              })(
                <Select placeholder="请输入初始值" style={{ width: '161px' }}>
                  <Option value="true">true</Option>
                  <Option value="false">false</Option>
                </Select>
              )}
            {this.state.type == 'Number' &&
              getFieldDecorator('value', {
                rules: [{ required: true, message: '请输入初始值' }],
              })(
                <InputNumber
                  placeholder="请输入初始值"
                  style={{ width: '100%' }}
                />
              )}
          </FormItem>
        </Col>
        <Col span={1}>
          <FormItem>
            <Icon
              type="plus-circle"
              style={{ color: '#4A82F7', fontSize: '20px', marginTop: '3px' }}
              onClick={this.handleSubmit}
            />
            {/* <Button type="primary" htmlType="submit">增加页内参数</Button> */}
          </FormItem>
        </Col>
      </Form>
    );
  }
}
const WrappedAddForm = Form.create()(AddForm);
@observer
class PageStateBox extends React.Component {
  state = {
    localPageState: [],
  };
  show = () => {
    let project = this.props.project;
    const pageState = project.pageState;
    let localPageState = [];
    pageState.forEach((value, key) => {
      localPageState.push({
        key: key,
        type: value.type,
        value: value.type == 'Boolean' ? value.value.toString() : value.value,
      });
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
    let pageState = {};
    let PAGE_VARIABLE = {};
    localPageState.forEach((item) => {
      if (!item.key) {
        message.error('变量名称不可为空');
        return;
      } else {
        pageState[item.key] = {
          value: checkValueByType(item.value, item.type),
          type: item.type,
        };
        PAGE_VARIABLE[item.key] = checkValueByType(item.value, item.type);
      }
    });
    this.props.project.modify({
      pageState: observable.map(pageState),
      variableStore: this.props.project.variableStore.merge({
        PAGE_VARIABLE: PAGE_VARIABLE,
      }),
    });
    this.setState({
      themeBoxVisible: false,
      localPageState: [],
    });
  };
  _handlePageStateChange = (newValue, index, property) => {
    const localPageState = this.state.localPageState;
    if (property != 'key' || (property == 'key' && this.validate(newValue))) {
      localPageState[index][property] = newValue;
      this.setState({
        localPageState,
      });
    }
  };
  _handleAddPageState = (key, type, value) => {
    const localPageState = this.state.localPageState;
    if (this.validate(key)) {
      localPageState.push({
        key: key,
        type: type,
        value: value,
      });
    }
    this.setState({
      localPageState,
    });
  };
  validate = (key) => {
    let validate = true;
    const localPageState = this.state.localPageState;
    localPageState.forEach(function (item) {
      if (item['key'] == key) {
        validate = false;
      }
    });
    if (!validate) {
      message.error('已存在相同的变量名称，请修改后再次提交');
    }
    return validate;
  };
  _getPageStateFields() {
    const { localPageState } = this.state;
    let states = [];
    localPageState.forEach((value, index) => {
      states.push(
        <Row key={index} style={{ marginBottom: '10px' }}>
          <Col span={7} className="pagestate-box">
            <Input
              style={{ width: '100%' }}
              placeholder="变量名称"
              value={value.key}
              onChange={(event) => {
                this._handlePageStateChange(event.target.value, index, 'key');
              }}
            />
          </Col>
          <Col span={7} className="pagestate-box">
            <Select
              placeholder="变量类型"
              style={{ width: '100%' }}
              value={value.type}
              onChange={(newValue) => {
                this._handlePageStateChange(newValue, index, 'type');
              }}
            >
              <Option value="String">字符串</Option>
              <Option value="Number">数字</Option>
              <Option value="Boolean">布尔值</Option>
            </Select>
          </Col>
          <Col span={7} className="pagestate-box">
            {value.type === 'Number' && (
              <InputNumber
                style={{ width: '100%' }}
                placeholder="初始值"
                value={value.value}
                onChange={(newValue) => {
                  this._handlePageStateChange(newValue, index, 'value');
                }}
              />
            )}
            {value.type === 'String' && (
              <Input
                style={{ width: '100%' }}
                placeholder="初始值"
                value={value.value}
                onChange={(event) => {
                  this._handlePageStateChange(
                    event.target.value,
                    index,
                    'value'
                  );
                }}
              />
            )}
            {value.type === 'Boolean' && (
              <Select
                value={value.value}
                onChange={(event) => {
                  this._handlePageStateChange(event, index, 'value');
                }}
                style={{ width: '161px' }}
              >
                <Option value="true">true</Option>
                <Option value="false">false</Option>
              </Select>
            )}
          </Col>
          <Col span={1}>
            <span
              style={{ display: 'inline-block' }}
              onClick={this.deleteData.bind(this, index, 'pageState')}
            >
              <Icon
                type="minus-circle"
                style={{ color: '#4A82F7', fontSize: '20px', marginTop: '3px' }}
              />
            </span>
          </Col>
        </Row>
      );
    });
    return (
      <Fragment>
        {/* <h3>页内变量</h3>
        <br /> */}
        <div className="query">{states}</div>
        <div className="result" style={{ marginTop: '10px' }}>
          <WrappedAddForm
            addPageState={this._handleAddPageState}
          ></WrappedAddForm>
        </div>
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

    const { project } = me.props;
    return (
      <Modal
        title="页面变量"
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
        {project.useData && this._getPageStateFields()}
      </Modal>
    );
  }
}

export default PageStateBox;
