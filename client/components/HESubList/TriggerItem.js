import React from 'react';
import { Icon, Divider } from 'antd';
import getControls from 'controls';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import {
  TriggerConfigs,
  getUsedTriggerVersion,
  getTriggerConfigByType,
  loadTriggerConfig
} from 'triggers';
import { getPageIndexById, xEditorStore, getDefaultClient } from 'common/utils';
import { getWidgetConfigByType } from 'widgets';
import base from 'base';
import { connectToStore } from '../StoreContext';
import uniqBy from 'lodash/uniqBy';
import MoveWidgetOperation from 'components/HEMoveWidgetOperation';

@observer
class TriggerItem extends React.Component {
  state = {
    isLoaded: false,
    Controls: null
  };
  getActions() {
    const { type } = this.props;
    let newTriggerConfigs = [];
    // 只在页面添加行为时展示分享
    TriggerConfigs.map((triggerConfig) => {
      // showCondition没有，则说明都展示
      if (!triggerConfig.showCondition) {
        newTriggerConfigs.push({
          text: triggerConfig.name,
          value: triggerConfig.type
        });
      } else {
        triggerConfig.showCondition.map((condition) => {
          if (type == condition) {
            newTriggerConfigs.push({
              text: triggerConfig.name,
              value: triggerConfig.type
            });
          }
        });
      }
    });
    return uniqBy(newTriggerConfigs, 'value'); // 数组驱虫
  }
  openOtherActions = () => {
    this.props.project.widgetLibraryVisible = true;
  };
  onChange = async (modify, namespace, element, willMount = false) => {
    // // 修改的是type属性
    if (modify.type) {
      let data = {};
      let type = element.type;
      let version =
        (willMount && element.version) || getUsedTriggerVersion(type);
      let triggerDefine = getTriggerConfigByType(type, version);
      if (type && (!triggerDefine || !triggerDefine.isLoaded)) {
        triggerDefine = await loadTriggerConfig({
          type: type,
          version: version
        });
      }
      let triggerData = triggerDefine.data || {};
      // 修复 AssmbleList 不展示
      Object.keys(triggerData).forEach(function (key) {
        data[key] = triggerData[key] === undefined ? '' : triggerData[key];
      });

      // willMount 使用用户配置
      willMount && Object.assign(data, element.data);

      element.modify(data, 'data');
      element.modify({
        version: triggerDefine.version
      });
      this.setState({
        isLoaded: true
      });
    }
  };
  async UNSAFE_componentWillMount() {
    const { sub: trigger } = this.props;
    let Controls = await getControls();
    this.setState({
      loaded: true,
      Controls: Controls
    });
    this.onChange({ type: trigger.type }, null, trigger, true);
  }
  render() {
    let me = this;
    const { type, sub: trigger, element, store, config } = this.props;
    const { Controls } = this.state;
    const project = store.getProject();
    let controls = [];
    let actions = this.getActions();
    let baseTrigger = base['trigger'];
    if (Controls) {
      // 放置触发器的各种基本参数（控件）
      for (let attribute of Object.keys(baseTrigger)) {
        let controlConfig = Object.assign({}, baseTrigger[attribute]);
        // 如果是 client，需要根据用户身份拿到指定客户端
        if (attribute == 'client') {
          controlConfig.options = getDefaultClient(config['ClIENT']);
        }
        // 如果是 type，就表示要选择行为组件了，把所有的本地的和异步的行为组件格式化到下拉列表中
        if (attribute == 'type') {
          controlConfig.options = actions;
          // 增加去添加其他行为组件
          controlConfig.dropdownRenderConfig = {
            dropdownRender: (menu) => (
              <div>
                {menu}
                <Divider style={{ margin: '4px 0', color: '#4a82f7' }} />
                <div
                  style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    color: '#4a82f7'
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={this.openOtherActions}
                >
                  <Icon type="plus" /> 添加其他行为
                </div>
              </div>
            )
          };
        }
        if (controlConfig.handler) {
          // 按照页面类型返回下拉列表
          const index = getPageIndexById(xEditorStore.currentPageId);
          controlConfig.options = controlConfig.handler(type, index);
          // 设置初始化下拉
          controlConfig.initValue = controlConfig.options[0].value;
        }
        // 如果当前组件添加了一些自定义事件
        if (attribute == 'event' && element.category) {
          let customWidget = getWidgetConfigByType(
            element.type,
            element.version
          );
          let customEvents = customWidget.events || [];
          controlConfig.options = controlConfig.options.concat(customEvents);
        }
        let Control = Controls[controlConfig.type];
        if (
          (controlConfig.when &&
            controlConfig.when(trigger, element, project)) ||
          !controlConfig.when
        ) {
          controls.push(
            <Control
              project={project}
              key={attribute}
              element={trigger}
              attribute={attribute}
              space="trigger"
              widget={element}
              onChange={me.onChange.bind(me)}
              // 里头还包含组件的类型
              {...controlConfig}
            />
          );
        }
      }
      // 根据 页面 trigger 类型 添加触发器参数
      if (trigger.type) {
        let triggerDefine = getTriggerConfigByType(
          trigger.type,
          trigger.version
        );
        if (this.state.isLoaded && triggerDefine) {
          let triggerConfig = triggerDefine['config'] || {};
          Object.keys(triggerConfig).forEach(function (key) {
            let controlConfig = triggerConfig && triggerConfig[key];
            if (controlConfig) {
              let Control = Controls[controlConfig.type];
              if (
                (controlConfig.when &&
                  controlConfig.when(trigger, element, project)) ||
                !controlConfig.when
              ) {
                let newControlConfig = {};
                // 遍历controlConfig的值，如果是一个对象，得执行该对象
                Object.keys(controlConfig).forEach((controlkey) => {
                  // TODO: when/filter/validate 触发时机
                  // filter暂时不能去除，领取优惠券组件在使用的
                  if (
                    typeof controlConfig[controlkey] == 'function' &&
                    !/^(when|filter|checkError|validate)$/.test(controlkey)
                  ) {
                    newControlConfig[controlkey] = controlConfig[controlkey](
                      trigger,
                      element,
                      toJS(project)
                    );
                  } else {
                    newControlConfig[controlkey] = controlConfig[controlkey];
                  }
                });
                controls.push(
                  <Control
                    project={project}
                    key={`${trigger.id}-${key}`}
                    element={trigger}
                    namespace="data"
                    attribute={key}
                    space="trigger"
                    widget={element}
                    readOnly={newControlConfig.readOnly}
                    {...newControlConfig}
                  />
                );
              }
            }
          });
        }
      }
    }

    return (
      Controls && (
        <div className="sub-item">
          {controls}
          <MoveWidgetOperation options={this.props.moveWidgetOptions} />
          <Icon
            type="close"
            className="close"
            onClick={() => me.props.onDelete(trigger)}
          />
        </div>
      )
    );
  }
}
export default connectToStore(TriggerItem);
