import React from 'react';
import ShowConfirm from 'components/HEConfirm';
import ControlWrap from 'controls/ControlWrap';
import { Checkbox, Row, Col, Tooltip } from 'antd';
import { loadWidgetConfig, getWidgetConfigByType } from 'widgets';
import { loadTriggerConfig, getTriggerConfigByType } from 'triggers';
import { toastError, toastSuccess } from 'components/HEToast';
import Controls from 'controls';
import { observer } from 'mobx-react';
import ProjectStore from 'store/project';
import './index.less';
@observer
class WidgetConfigChangeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      targetComponent: null,
      components: null,
    };
  }
  async onConfirm() {
    const { components } = this.state;
    const { triggers, widgets, widgetsTriggers } = components;
    const { updateConfig } = this.props;
    const { targetComponent } = this.state;
    const batchWidgetConfigStore = ProjectStore.batchWidgetConfigStore;
    if (
      triggers.length == 0 &&
      widgets.length == 0 &&
      widgetsTriggers.length == 0
    ) {
      // 无需组件需要修改配置
      this.onCancel();
      return;
    }
    if (!Object.keys(batchWidgetConfigStore).length) {
      toastError('未进行任何更改');
      return;
    }
    const componentInfo = {
      clazz: targetComponent.clazz,
      type: targetComponent.type,
      event: targetComponent.event,
      data: batchWidgetConfigStore.data,
    };
    try {
      await updateConfig(componentInfo);
      toastSuccess('更新成功，请重新发布');
      this.props.closeWidgetConfigChangeModal();
    } catch (error) {
      toastError(error.message);
    }
  }
  getTriggerConfig(trigger) {
    if (!Object.keys(trigger.config).length) {
      return <div className="component-no-config-tips">该组件无配置</div>;
    }
    if (trigger.type) {
      const batchWidgetConfigStore = ProjectStore.batchWidgetConfigStore;
      let controls = [];
      let triggerConfig = trigger.config;
      Object.keys(triggerConfig).forEach(function (key) {
        let controlConfig = triggerConfig && triggerConfig[key];
        if (controlConfig) {
          let Control = Controls[controlConfig.type];
          if (
            (controlConfig.when &&
              controlConfig.when(
                batchWidgetConfigStore,
                batchWidgetConfigStore,
                batchWidgetConfigStore
              )) ||
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
                  batchWidgetConfigStore,
                  batchWidgetConfigStore,
                  batchWidgetConfigStore
                );
              } else {
                newControlConfig[controlkey] = controlConfig[controlkey];
              }
            });
            controls.push(
              <Control
                project={batchWidgetConfigStore}
                key={`${trigger.id}-${key}`}
                element={batchWidgetConfigStore}
                namespace="data"
                attribute={key}
                widget={null}
                readOnly={newControlConfig.readOnly}
                {...newControlConfig}
              />
            );
          }
        }
      });
      return controls;
    }
  }
  onCancel() {
    this.props.closeWidgetConfigChangeModal();
  }
  async onChange(value) {
    let batchWidgetConfigStore = (ProjectStore.batchWidgetConfigStore =
      Object.assign(ProjectStore.batchWidgetConfigStore, { data: {} }));
    let components = {
      config: value.config,
    };
    let data = value.data;
    // 如果没有当前版本的组件
    if (!components.config && value.type && value.version) {
      if (!value.event) {
        components = await loadWidgetConfig(value);
      } else {
        components = await loadTriggerConfig(value);
      }
    }
    const canRenderControls = {};
    if (components.config) {
      Object.keys(components.config).forEach((attribute) => {
        // 只支持WidgetSelect|TriggerSelect 之外的control渲染；
        if (
          !/^(WidgetSelect|TriggerSelect|PageSelect|PickData|PageStateControl|PageStateBox)$/g.test(
            components.config[attribute].type
          )
        ) {
          canRenderControls[attribute] = components.config[attribute];
          batchWidgetConfigStore.data[attribute] = data[attribute];
        }
      });
    }
    this.setState({
      targetComponent: Object.assign(value, {
        config: canRenderControls,
      }),
    });
  }
  getPageTrigger() {
    // 获取页面级别的行为
    const { components } = this.state;
    const pageTrigger = {};
    if (components.triggers) {
      components.triggers.forEach((trigger) => {
        if (trigger.type) {
          pageTrigger[trigger.event] = pageTrigger[trigger.event] || [];
          pageTrigger[trigger.event].push(trigger);
        }
      });
    }
    return pageTrigger;
  }
  getConfigAndOriginName(triggers, getConfigByType, loadConfig) {
    return Promise.all(
      triggers.map(async (trigger) => {
        let triggerInfo = getConfigByType(trigger.type, trigger.version);
        if (!triggerInfo) {
          triggerInfo = await loadConfig(trigger);
        }
        if (triggerInfo) {
          trigger.originName = triggerInfo.name;
          trigger.config = triggerInfo.config;
        }
      })
    );
  }

  UNSAFE_componentWillMount() {
    const { projectsComponents } = this.props;
    let { triggers, widgets, widgetsTriggers } = projectsComponents;
    Promise.all([
      this.getConfigAndOriginName(
        triggers,
        getTriggerConfigByType,
        loadTriggerConfig
      ),
      this.getConfigAndOriginName(
        widgets,
        getWidgetConfigByType,
        loadWidgetConfig
      ),
      this.getConfigAndOriginName(
        widgetsTriggers,
        getTriggerConfigByType,
        loadTriggerConfig
      ),
    ]).then(() => {
      widgets = widgets.filter((widget) => {
        return !/Text|Button|Image|Container|Data|NormalText/g.test(
          widget.type
        );
      });
      this.setState({
        components: {
          triggers,
          widgets,
          widgetsTriggers,
        },
      });
    });
  }
  render() {
    const { components } = this.state;
    if (!components) return null;
    const { triggers, widgets, widgetsTriggers } = components;
    const { targetComponent } = this.state;
    const batchWidgetConfigStore = ProjectStore.batchWidgetConfigStore;
    const pageTriggerTextMap = {
      enter: '进入页面',
      willmount: '页面加载前',
      leave: '离开页面',
    };
    const pageTriggers = this.getPageTrigger();
    return (
      <ShowConfirm
        title="批量修改组件配置"
        onConfirm={this.onConfirm.bind(this)}
        onCancel={this.onCancel.bind(this)}
      >
        <div className="HE-widget-config">
          {triggers.length == 0 &&
            widgets.length == 0 &&
            widgetsTriggers.length == 0 && (
              <Row>
                <div>没有需要更改配置的组件</div>
              </Row>
            )}
          {
            <Row>
              {Object.keys(pageTriggers).map((event) => {
                if (pageTriggers[event].length === 0) return null;
                return (
                  <Row key={event}>
                    <div className="HE-widget-config__title">
                      {`${pageTriggerTextMap[event]}:`}
                    </div>
                    {pageTriggers[event].map((trigger) => {
                      if (!trigger.type || !trigger.originName) return null;
                      return (
                        <Col
                          span={12}
                          className="HE-widget-config__item"
                          key={trigger.type}
                        >
                          <Checkbox
                            onClick={this.onChange.bind(this, trigger)}
                            checked={
                              targetComponent &&
                              trigger.type === targetComponent.type &&
                              trigger.event === targetComponent.event
                            }
                          >
                            <Tooltip
                              placement="topLeft"
                              title={trigger.type}
                              arrowPointAtCenter
                            >
                              {trigger.originName}
                            </Tooltip>
                          </Checkbox>
                        </Col>
                      );
                    })}
                  </Row>
                );
              })}
            </Row>
          }
          {components.widgets.length !== 0 && (
            <Row>
              <div className="HE-widget-config__title">UI组件：</div>
              {components.widgets.map((widget) => {
                if (!widget.type || !widget.originName) return null;
                return (
                  <Col
                    span={12}
                    className="HE-widget-config__item"
                    key={widget.type}
                  >
                    <Checkbox
                      onClick={this.onChange.bind(this, widget)}
                      checked={
                        targetComponent && widget.type === targetComponent.type
                      }
                    >
                      <Tooltip
                        placement="topLeft"
                        title={widget.type}
                        arrowPointAtCenter
                      >
                        {widget.originName}
                      </Tooltip>
                    </Checkbox>
                  </Col>
                );
              })}
            </Row>
          )}
          {components.widgetsTriggers.length !== 0 && (
            <Row>
              <div className="HE-widget-config__title">组件行为：</div>
              {components.widgetsTriggers.map((trigger) => {
                if (!trigger.type || !trigger.originName) return null;
                return (
                  <Col
                    span={12}
                    className="HE-widget-config__item"
                    key={trigger.type}
                  >
                    <Checkbox
                      onClick={this.onChange.bind(this, trigger)}
                      checked={
                        targetComponent &&
                        trigger.type === targetComponent.type &&
                        trigger.event === targetComponent.event
                      }
                    >
                      <Tooltip
                        placement="topLeft"
                        title={trigger.type}
                        arrowPointAtCenter
                      >
                        {trigger.originName}
                      </Tooltip>
                    </Checkbox>
                  </Col>
                );
              })}
            </Row>
          )}
          {targetComponent &&
            targetComponent.originName &&
            targetComponent.config && (
              <div>
                {targetComponent.originName}
                {!targetComponent.clazz &&
                Object.keys(targetComponent.config).length ? (
                  <ControlWrap
                    key={targetComponent.type + targetComponent.version}
                    WidgetConfig={targetComponent.config}
                    project={batchWidgetConfigStore}
                    element={batchWidgetConfigStore}
                    namespace="data"
                  ></ControlWrap>
                ) : (
                  this.getTriggerConfig(targetComponent)
                )}
              </div>
            )}
        </div>
      </ShowConfirm>
    );
  }
}
export default WidgetConfigChangeModal;
