import React, { Component } from 'react';
import { cloneDeep } from 'lodash';
import ControlWrap from 'controls/ControlWrap';
import ErrorBoundary from '../ErrorBoundary';
import './index.less';

@ErrorBoundary('组件有异常，请重新编辑')
export default class ControlWrapConfig extends Component {
  render() {
    const ruleComponent = cloneDeep(this.props.ruleComponent);
    const { controlWrapConfig } = handleRuleConfig(ruleComponent.config);

    return (
      <React.Fragment>
        <div className="config_wrap_body">
          <div className="config_wrap_content">
            {controlWrapConfig.map((item, index) => {
              return (
                <div
                  className={
                    (item.title
                      ? `groupControlWrap groupControlWrap-${index}`
                      : '') + ' controlWrap'
                  }
                  key={`${ruleComponent.version}${index}`}
                >
                  {item.title && (
                    <div className="controlWrap-title">{item.title}</div>
                  )}
                  <div className={item.title ? 'controlWrap-item' : ''}>
                    <ControlWrap
                      WidgetConfig={item.config}
                      project={ruleComponent}
                      element={ruleComponent}
                      namespace={'data'}
                      ref={(node) => (this['controlWrapRef' + index] = node)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

function handleRuleConfig(config = {}) {
  let group = [];
  let noGroup = {};
  let controlWrapConfig = [];

  // 需要排序,未分组的在前面，分组的通过前面序号进行排序
  const configKeys = Object.keys(config);

  for (const configKey of configKeys) {
    const speIndex = configKey.indexOf('-');
    const isGroup = speIndex !== -1;

    if (isGroup) {
      group.push({
        title: configKey.slice(speIndex + 1),
        config: config[configKey],
        index: configKey.slice(0, speIndex)
      });
    } else {
      noGroup[configKey] = config[configKey];
    }
  }

  group.sort((a, b) => {
    return a.index - b.index;
  });

  if (Object.keys(noGroup).length !== 0) {
    controlWrapConfig.push({ config: noGroup });
  }

  controlWrapConfig = controlWrapConfig.concat(group);

  return {
    controlWrapConfig,
    navConfig: group.map((item) => item.title)
  };
}
