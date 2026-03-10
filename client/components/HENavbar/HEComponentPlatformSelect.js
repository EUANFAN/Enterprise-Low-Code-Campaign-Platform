import React from 'react';
import store from 'store/stage';
import { Checkbox } from 'antd';
const { Group } = Checkbox;
export default class ComponentPlatformSelect extends React.Component {
  handleChange(value) {
    const stageStore = store.getStageStore();
    stageStore.toggleComponentPlatFlag(value.join(','));
  }
  render() {
    const stageStore = store.getStageStore();
    const componentPlat = stageStore.componentPlat;
    const options = [
      { label: 'H5', value: 'h5' },
      { label: '小程序', value: 'miniProgram' },
    ];
    return (
      <React.Fragment>
        <Group
          options={options}
          defaultValue={[...componentPlat.split(',')]}
          onChange={this.handleChange.bind(this)}
        ></Group>
      </React.Fragment>
    );
  }
}
