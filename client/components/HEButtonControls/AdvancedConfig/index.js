import React from 'react';
import { observer } from 'mobx-react';
import HEIconButton from 'components/HEIconButton';
import { Switch } from 'antd';
import './index.less';

@observer
class AdvancedConfig extends React.Component {
  _onChangeProfessional = (checked) => {
    const { store } = this.props;
    const stage = store.getStageStore();
    stage.toggleProfessionalFlag(checked);
  };
  render() {
    const { store } = this.props;
    const stageStore = store.getStageStore();
    const isProfessional = stageStore.isProfessional;

    return (
      <HEIconButton
        className="editor-navbar__actions__icon-button"
        iconElement={
          <Switch
            onChange={this._onChangeProfessional}
            className="editor-navbar__actions__professional-switch"
            defaultChecked={isProfessional}
            size="small"
          />
        }
        titleElement={'高级配置'}
      />
    );
  }
}

export default AdvancedConfig;
