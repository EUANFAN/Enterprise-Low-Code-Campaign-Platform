import React from 'react';
import { observer } from 'mobx-react';
import {
  Table,
  Form,
  message,
  Button,
  Input,
  Modal,
  Select,
  Tooltip,
  Icon,
} from 'antd';
import { checkTypeToName, checkValueByType } from 'common/checkType';
import store from 'store/stage';
import VariablePicker from 'components/HEVariablePicker';
import { getWidgetVariable } from 'common/utils';
import { hasVariable } from 'utils/ModelUtils';

const FormItem = Form.Item;
const Option = Select.Option;

@observer
class UsePageVariable extends React.Component {
  showVariablePicker = () => {
    const { widget, element, space, callback, value } = this.props;
    const component =
      space == 'trigger' || space == 'assemble' ? widget : element;
    const path = component ? component.path : '';
    const widgetData = path ? getWidgetVariable(path) : '';
    // 展示变量转选择富文本
    this.variablePicker.show(
      value,
      widgetData,
      async (params) => {
        callback(params);
      },
      path
    );
  };
  render() {
    const { value, onRemoveVariable } = this.props;
    const stageStore = store.getStageStore();
    const projectData = stageStore && stageStore.getProject();
    const isPageVariable = hasVariable(value);
    const pageVariableName = value;
    if (!projectData.useData) {
      return null;
    }
    return (
      <div
        style={{
          width: isPageVariable ? '236px' : '',
          height: '40px',
          background: '#fff',
          display: isPageVariable ? 'flex' : 'inline-block',
          alignItems: 'center',
          marginLeft: isPageVariable ? 0 : '10px',
        }}
      >
        {isPageVariable && pageVariableName && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Button
              icon="database"
              title={pageVariableName}
              type="primary"
              style={{
                width: 180,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
              onClick={this.showVariablePicker}
            >
              {pageVariableName}
            </Button>
            <Button
              icon="close"
              type="ghost"
              title={'解除数据绑定'}
              style={{ border: 'none' }}
              onClick={onRemoveVariable}
            />
          </div>
        )}
        <span
          style={{
            width: '40px',
            height: '40px',
            lineHeight: '40px',
            marginRight: '10px',
            textAlign: 'center',
          }}
        >
          <Tooltip title="使用接口返回的数据或者页面变量" placement="topRight">
            <Icon
              type="codepen"
              onClick={this.showVariablePicker.bind(this)}
              style={{
                fontSize: '16px',
                padding: '3px',
                border: '1px solid #a6a6a6',
                borderRadius: '4px',
              }}
            />
          </Tooltip>
          <VariablePicker
            useToolbar={false}
            project={projectData}
            ref={(node) => {
              this.variablePicker = node;
            }}
          />
        </span>
      </div>
    );
  }
}

@observer
class KVForm extends React.Component {
  state = {
    key: '',
    type: '',
    value: '',
  };
  handleSubmit = (e) => {
    e.preventDefault();
    let { parent, form } = this.props;
    form.validateFields((err, values) => {
      const isPageVariable = hasVariable(this.state.value);
      if (isPageVariable && values.key && values.type) {
        parent.addKV(values.key, values.type, this.state.value);
        form.resetFields();
        this.setState({
          key: '',
          type: '',
          value: '',
        });
        return;
      }
      if (!err) {
        parent.addKV(values.key, values.type, values.value);
        this.setState({
          key: '',
          type: '',
          value: '',
        });
        form.resetFields();
      }
    });
  };
  showVariablePicker = (params) => {
    this.setState({
      value: params.content,
    });
  };
  handlerChange = (value, key) => {
    if (key == 'value') {
      this.setState({
        value: value,
      });
    }
  };
  onRemoveVariable = () => {
    this.setState({
      value: '',
    });
  };
  render() {
    const { widget, element, space, optionsUseData } = this.props;
    const { value } = this.state;
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const isPageVariable = hasVariable(value);

    return (
      <Form
        layout="inline"
        onSubmit={this.handleSubmit}
        style={{ marginBottom: 10 }}
      >
        <FormItem>
          {getFieldDecorator('key', {
            rules: [
              {
                required: true,
                message: '请输入键名',
              },
            ],
          })(<Input placeholder={'请输入键名'} />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('type', {
            rules: [
              {
                required: true,
                message: '请选择类型',
              },
            ],
          })(
            <Select
              placeholder="请选择类型"
              style={{ width: '200px' }}
              initialValue={null}
            >
              <Option value="String">字符串</Option>
              <Option value="Number">数字</Option>
              <Option value="Boolean">布尔值</Option>
            </Select>
          )}
        </FormItem>
        <FormItem>
          {(!isPageVariable || !optionsUseData) &&
            getFieldDecorator('value', {
              rules: [
                {
                  required: true,
                  message: '请输入值',
                },
              ],
            })(
              <Input
                style={{ width: '170px' }}
                placeholder={'请输入值'}
                onChange={(value) => this.handlerChange(value, 'value')}
              />
            )}
          {optionsUseData && (
            <UsePageVariable
              widget={widget}
              element={element}
              space={space}
              callback={this.showVariablePicker}
              value={value}
              onRemoveVariable={this.onRemoveVariable.bind(this)}
            />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit">
            {'添加'}
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const WrappedKVForm = Form.create()(KVForm);

@observer
class EditableCell extends React.Component {
  state = {
    value: this.props.value,
    editable: this.props.editable || false,
    type: this.props.type, // 只有类型才有type
  };
  UNSAFE_componentWillReceiveProps = (nextProps) => {
    if (nextProps.editable !== this.state.editable) {
      this.setState({
        editable: nextProps.editable,
      });

      if (nextProps.editable) {
        this.cacheValue = this.state.value;
      }
    }
    if (nextProps.status && nextProps.status !== this.props.status) {
      if (nextProps.status === 'save') {
        this.props.onChange(this.state.value, this.state.type);
      } else if (nextProps.status === 'cancel') {
        this.setState({
          value: this.cacheValue,
        });
        this.props.onChange(this.cacheValue);
      }
    }
  };

  shouldComponentUpdate = (nextProps, nextState) => {
    if (
      nextProps.editable !== this.state.editable ||
      nextState.value !== this.state.value
    ) {
      return true;
    }
  };

  handleChange = (e) => {
    const value = e.target.value;
    this.setState({
      value,
    });
  };
  showVariablePicker = (params) => {
    this.setState({
      value: params.content,
    });
  };
  onRemoveVariable = () => {
    this.setState({
      value: '',
    });
  };
  handleSelectChange = (value) => {
    const changeValue = checkTypeToName(value);
    this.setState({
      type: value,
      value: changeValue,
    });
  };
  render() {
    const { value, editable, type } = this.state;
    const { widget, element, space, isValue, optionsUseData } = this.props;
    const stageStore = store.getStageStore();
    const projectData = stageStore && stageStore.getProject();
    const isPageVariable = hasVariable(value);
    return (
      <div>
        {!editable && <div className="editable-row-text">{value || ''}</div>}
        {editable &&
          (type ? (
            <div>
              <Select
                defaultValue={type}
                onSelect={(value) => this.handleSelectChange(value)}
              >
                <Option value="String">字符串</Option>
                <Option value="Number">数值</Option>
                <Option value="Boolean">布尔值</Option>
              </Select>
            </div>
          ) : (
            <div>
              {(!isPageVariable || !optionsUseData || !projectData.useData) && (
                <Input
                  style={{ width: '170px' }}
                  value={value}
                  onChange={(e) => this.handleChange(e)}
                />
              )}
              {isValue && optionsUseData && projectData.useData && (
                <UsePageVariable
                  widget={widget}
                  element={element}
                  space={space}
                  callback={this.showVariablePicker}
                  value={value}
                  onRemoveVariable={this.onRemoveVariable}
                />
              )}
            </div>
          ))}
      </div>
    );
  }
}

@observer
class SetEditorControl extends React.Component {
  state = {
    show: false,
    data: {},
  };

  constructor(props) {
    super(props);
    this.columns = [
      {
        title: '键',
        dataIndex: 'key',
        width: '20%',
        render: (text, record, index) =>
          this.renderColumns(this.state.dataSource, index, 'key', text),
      },
      {
        title: '类型',
        dataIndex: 'type',
        width: '20%',
        render: (text, record, index) =>
          this.renderColumns(this.state.dataSource, index, 'type', text),
      },
      {
        title: '值',
        dataIndex: 'value',
        width: '40%',
        render: (text, record, index) =>
          this.renderColumns(this.state.dataSource, index, 'value', text),
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '20%',
        render: (text, record, index) => {
          const editable = this.state.dataSource[index].editable;
          return (
            <div className="editable-row-operations">
              {editable ? (
                <span>
                  <a
                    onClick={() => this.editDone(index, 'save')}
                    style={{ paddingRight: '10px' }}
                  >
                    {'保存'}
                  </a>
                  <span className="ant-divider" />
                  <a onClick={() => this.editDone(index, 'cancel')}>{'取消'}</a>
                </span>
              ) : (
                <span>
                  <a
                    onClick={() => this.edit(index)}
                    style={{ paddingRight: '10px' }}
                  >
                    {'编辑'}
                  </a>
                  <span className="ant-divider" />
                  <a onClick={() => this.deleteRecord(index)}>{'删除'}</a>
                </span>
              )}
            </div>
          );
        },
      },
    ];
  }

  convertToList = (data) => {
    let dataSource = [];
    for (let key of Object.keys(data)) {
      dataSource.push({
        [key]: {
          value: data[key]['value'],
          type: data[key]['type'] || 'String',
        },
      });
    }

    return dataSource;
  };

  convertToMap = (list) => {
    let map = {};
    list.forEach((item) => {
      const key = item['key'];
      const originType = item['originType'];
      const value = checkValueByType(item['value'], originType);
      map[key] = {
        type: originType,
        value: value,
      };
    });
    return map;
  };
  show = (data, ok, cancel) => {
    this.ok = ok;
    this.cancel = cancel;
    // let dataSource = this.convertToList(data);
    this.setState({
      dataSource: data,
      show: true,
    });
  };

  validate = (key) => {
    let validate = true;
    const dataSource = this.state.dataSource;

    dataSource.forEach(function (item) {
      if (Object.keys(item)['key'] == key) {
        validate = false;
      }
    });

    if (!validate) {
      message.error('已存在相同的键名，请修改后再次提交');
    }

    return validate;
  };

  addKV = (key, type, value) => {
    const dataSource = this.state.dataSource;
    if (this.validate(key, type, value)) {
      // 考虑dataSource设为对象，但是这样添加顺序不能保障
      dataSource.push({
        key: key,
        type: checkTypeToName(type),
        originType: type,
        value: value,
      });
      this.setState({
        dataSource,
      });
    }
  };

  handleOk = () => {
    if (this.ok) {
      this.ok(this.state.dataSource);
      // this.ok(this.convertToMap(this.state.dataSource));
    }
    this.setState({
      show: false,
    });
  };

  handleCancel = () => {
    if (this.cancel) {
      this.cancel();
    }
    this.setState({
      show: false,
    });
  };

  renderColumns(dataSource, index, key, text) {
    const { editable, status } = dataSource[index];
    let { widget, element, space, optionsUseData } = this.props;
    if (key === 'value') {
      return (
        <EditableCell
          widget={widget}
          element={element}
          space={space}
          editable={editable}
          value={text}
          status={status}
          type={null}
          isValue={true}
          optionsUseData={optionsUseData}
          onChange={(value, type) => this.handleChange(key, index, value, type)}
        />
      );
    }
    if (key === 'type') {
      return (
        <EditableCell
          widget={widget}
          element={element}
          space={space}
          editable={editable}
          value={text}
          status={status}
          type={dataSource[index].originType}
          isValue={false}
          optionsUseData={optionsUseData}
          onChange={(value, type) => this.handleChange(key, index, value, type)}
        />
      );
    }
    if (key === 'key') {
      return (
        <EditableCell
          widget={widget}
          element={element}
          space={space}
          editable={editable}
          value={text}
          status={status}
          type={null}
          isValue={false}
          optionsUseData={optionsUseData}
          onChange={(value, type) => this.handleChange(key, index, value, type)}
        />
      );
    }
  }

  handleChange = (key, index, value, type) => {
    const dataSource = this.state.dataSource;
    if (this.validate(value)) {
      dataSource[index][key] = value;
      if (key === 'type') {
        dataSource[index]['originType'] = type;
      }
      this.setState({
        dataSource,
      });
    }
  };

  edit = (index) => {
    const dataSource = this.state.dataSource;
    dataSource[index].editable = true;
    this.setState({
      dataSource: dataSource,
      type: dataSource[index] && dataSource[index]['type'],
    });
  };

  deleteRecord = (index) => {
    const dataSource = this.state.dataSource;
    dataSource.splice(index, 1);
    this.setState({
      dataSource,
    });
  };

  editDone = (index, type) => {
    const dataSource = this.state.dataSource;
    dataSource[index].editable = false;
    dataSource[index].status = type;
    this.setState({
      dataSource,
    });
  };

  render() {
    let { widget, element, space, optionsUseData } = this.props;

    return this.state.show ? (
      <Modal
        maskClosable={false}
        title={'键值对管理器'}
        visible={this.state.show}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        width={800}
      >
        <WrappedKVForm
          widget={widget}
          element={element}
          space={space}
          optionsUseData={optionsUseData}
          parent={this}
        />
        <Table
          dataSource={this.state.dataSource}
          columns={this.columns}
          size={'small'}
          bordered={true}
          pagination={false}
        />
      </Modal>
    ) : null;
  }
}

export default SetEditorControl;
