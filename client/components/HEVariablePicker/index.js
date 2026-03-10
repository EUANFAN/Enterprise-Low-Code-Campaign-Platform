import './index.less';

import React from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Tabs, Modal, Tag, Button, Radio } from 'antd';
import BraftEditor from '../HERichTextEditor/BraftEditor';
import { ContentUtils } from 'braft-utils';
import { hasVariable } from 'utils/ModelUtils';
import { getPageById } from 'common/utils';
import uid from 'uid';
const TabPane = Tabs.TabPane;
const CheckableTag = Tag.CheckableTag;
const excludeControls = ['media', 'code', 'blockquote', 'hr'];
// 1. 变量Tab 展示，提供各种变量
// 2. 为text (RichText)提供变量和富文本编辑
// 3. 为条件面板提供变量和简单变量选择
// 4. 为组件各类属性控件提供变量选择

// 最终返回用户的输入值
// 纯文本
// 变量对象

@observer
class VariablePicker extends React.Component {
  state = {
    visible: false,
    selectedParent: null,
    selectKey: null,
    useToolbar: true,
    useEditor: true, // 在显示条件时为false，在control时为true
    editorState: BraftEditor.createEditorState(null),
    mode: '',
  };

  /**
   * 变量选择器展示
   * @param  {[type]}   value    [传入参数，如果是页内变量是一个对象，数据源是一个字符串]
   * @param  {[type]}   text     [富文本，如果是富文本]
   * @param  {Function} callback [回调结果]
   * @return {[type]}            [description]
   */
  show = (value, widgetData, callback, path) => {
    let useEditor = true;
    this.callback = callback;
    let { useToolbar } = this.props;
    let content = '';
    this.initWidgetStore(widgetData);
    this.initPageStore(path);
    this.initProjectStore();
    // callback || (callback = function () { });
    let pageHasVariable = hasVariable(value);
    if ((pageHasVariable && useToolbar) || useToolbar) {
      content = BraftEditor.createEditorState(value);
    }
    if (pageHasVariable && !useToolbar) {
      content = value;
    }
    this.setState({
      visible: true,
      selectedParent: 'PAGE_VARIABLE',
      useEditor: useEditor,
      editorState: content,
    });
  };
  initWidgetStore = (widgetData) => {
    let mode = this.state.mode;
    let variableStore = toJS(this.props.project.variableStore) || {};
    if (Object.keys(variableStore.PAGE_VARIABLE || {}).length) {
      mode = 'PAGE_VARIABLE';
    }
    if (widgetData) {
      if (Object.keys(widgetData).length) {
        mode = 'DATA_CONTAINER';
      }
      this.setState(
        Object.assign(
          {
            mode,
          },
          Object.keys(widgetData).length
            ? {
                widgetStore: widgetData,
              }
            : {}
        )
      );
    }
  };
  initPageStore = (path = '') => {
    // 根据path的第一项得到pageid，再根据pageid获取对应store
    let pageStore = toJS(getPageById(path.split('-')[0]).variableStore) || {};
    if (Object.keys(pageStore).length) {
      this.setState({
        mode: 'PAGE_STORE',
        pageStore: pageStore,
      });
    }
  };
  initProjectStore = () => {
    const projectStore = JSON.parse(
      JSON.stringify(
        toJS(this.props.project.variableStore)['PROJECT_VARIABLE'] || {}
      )
    );
    delete projectStore.PAGE_VARIABLE;
    if (Object.keys(projectStore).length) {
      this.setState({
        mode: 'PROJECT_VARIABLE',
        projectStore: projectStore,
      });
    }
  };
  ok = () => {
    this.setState({
      visible: false,
    });
    let content = '';
    let { useToolbar } = this.props;
    if (this.state.useEditor && useToolbar) {
      // 如果是富文本编辑器
      content = this.state.editorState.toHTML();
    } else {
      // 如果是图片
      content = this.state.editorState;
    }
    // 将内容和选中的变量组添加进去，当有不同组的变量时候，通常是文本编辑器，建议不要使用这种参数
    this.callback({
      content: content,
    });
  };

  cancel = () => {
    this.setState({
      selectKey: null,
      visible: false,
    });
  };

  clean = () => {
    this.setState({
      editorState: ContentUtils.clear(this.state.editorState),
      value: '',
      selectedParent: null,
      selectedChild: null,
    });
  };

  //  编辑器change事件
  handleEditorChange = (editorState) => {
    let { useToolbar } = this.props;
    if (!useToolbar && typeof editorState != 'string') {
      if (editorState.target) {
        this.setState({
          editorState: `${editorState.target.value}`,
        });
        return;
      }
    }
    this.setState({ editorState: editorState });
  };
  // 设置页内变量和数据源
  addVariable = (category, variable) => {
    let { useToolbar } = this.props;
    let editorState = '';
    if (useToolbar) {
      editorState = ContentUtils.insertHTML(
        this.state.editorState,
        '${' + category + '.' + variable + '}'
      );
    } else {
      editorState =
        this.state.editorState + '${' + category + '.' + variable + '}';
    }
    this.setState({
      editorState: editorState,
      selectedParent: category,
      selectKey: variable,
    });
  };
  handleModeChange = (e) => {
    const mode = e.target.value;
    this.setState({ mode });
  };
  render() {
    let me = this;
    let { useToolbar } = me.props;
    let project = me.props.project || {};
    let variableStore = toJS(project.variableStore) || {};
    let RadioPanels = [];
    let { widgetStore, pageStore, projectStore } = this.state;
    let tabPanelBox = {};
    if (variableStore.PAGE_VARIABLE) {
      RadioPanels.push(
        <Radio.Button value={'PAGE_VARIABLE'} key={uid(8)}>
          页内变量
        </Radio.Button>
      );
      let panels = [];
      Object.keys(variableStore.PAGE_VARIABLE).forEach((name) => {
        panels.push(
          <CheckableTag
            checked={
              this.state.selectKey == name &&
              this.state.selectedParent == 'PAGE_VARIABLE'
            }
            className="variable"
            key={name}
            onChange={me.addVariable.bind(me, 'PAGE_VARIABLE', name)}
          >
            {name}
          </CheckableTag>
        );
      });
      tabPanelBox['PAGE_VARIABLE'] = [
        <TabPane tab={'PAGE_VARIABLE'} key={'PAGE_VARIABLE'}>
          {panels}
        </TabPane>,
      ];
    }
    if (pageStore) {
      RadioPanels.push(
        <Radio.Button value={'PAGE_STORE'} key={uid(8)}>
          {'页面数据'}
        </Radio.Button>
      );
      let TabPanes = [];
      Object.keys(pageStore).forEach((variable) => {
        let panels = [];
        Object.keys(pageStore[variable] || {}).forEach((name) => {
          panels.push(
            <CheckableTag
              checked={
                this.state.selectKey == name &&
                this.state.selectedParent == variable
              }
              className="variable"
              key={name}
              onChange={me.addVariable.bind(me, variable, name)}
            >
              {name}
            </CheckableTag>
          );
        });
        TabPanes.push(
          <TabPane tab={variable} key={variable}>
            {panels}
          </TabPane>
        );
      });
      tabPanelBox['PAGE_STORE'] = TabPanes;
    }
    if (projectStore) {
      RadioPanels.push(
        <Radio.Button value={'PROJECT_VARIABLE'} key={uid(8)}>
          {'项目数据'}
        </Radio.Button>
      );
      let TabPanes = [];
      Object.keys(projectStore).forEach((variable) => {
        let panels = [];
        Object.keys(projectStore[variable] || {}).forEach((name) => {
          panels.push(
            <CheckableTag
              checked={
                this.state.selectKey == name &&
                this.state.selectedParent == variable
              }
              className="variable"
              key={name}
              onChange={me.addVariable.bind(
                me,
                'PROJECT_VARIABLE.' + variable,
                name
              )}
            >
              {name}
            </CheckableTag>
          );
        });
        TabPanes.push(
          <TabPane tab={variable} key={variable}>
            {panels}
          </TabPane>
        );
      });
      tabPanelBox['PROJECT_VARIABLE'] = TabPanes;
    }
    RadioPanels.push(
      <Radio.Button value={'DATA_CONTAINER'} key={uid(8)}>
        {'模板数据'}
      </Radio.Button>
    );
    let TabPanes = [];
    if (widgetStore) {
      Object.keys(widgetStore).forEach((key) => {
        TabPanes.push(
          <TabPane tab={key} key={key}>
            {Object.keys(widgetStore[key] || {}).map((item) => (
              <CheckableTag
                className="variable"
                checked={
                  this.state.selectKey == item &&
                  this.state.selectedParent == key
                }
                key={item}
                onChange={me.addVariable.bind(me, key, item)}
              >
                {item}
              </CheckableTag>
            ))}
          </TabPane>
        );
      });
      tabPanelBox['DATA_CONTAINER'] = TabPanes;
    }
    return me.state.visible ? (
      <Modal
        title="变量选择，点击Tab 下的变量，加入到方框中"
        visible={me.state.visible}
        onOk={me.ok}
        maskClosable={false}
        onCancel={me.cancel}
        width={'80%'}
        footer={[
          <Button key="1" onClick={this.cancel}>
            取消
          </Button>,
          <Button key="2" type="primary" onClick={this.ok}>
            确定
          </Button>,
        ]}
      >
        <Radio.Group
          onChange={this.handleModeChange}
          value={this.state.mode}
          style={{ marginBottom: 8 }}
        >
          {RadioPanels.length ? RadioPanels : null}
        </Radio.Group>
        {(tabPanelBox[this.state.mode] || []).length ? (
          <Tabs
            defaultActiveKey={this.state.selectedParent}
            type="line"
            size="small"
            style={{ margin: '10px 0' }}
          >
            {tabPanelBox[this.state.mode]}
          </Tabs>
        ) : null}
        {this.state.useEditor && useToolbar ? (
          <BraftEditor
            value={this.state.editorState}
            onChange={this.handleEditorChange}
            excludeControls={excludeControls}
          />
        ) : (
          <input
            value={this.state.editorState}
            className="variable-input"
            onChange={this.handleEditorChange}
            type="text"
            placeholder={'请选择变量名称'}
          />
        )}
      </Modal>
    ) : null;
  }
}

export default VariablePicker;
