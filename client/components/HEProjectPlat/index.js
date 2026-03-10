import React from 'react';
import { COMPONENT_PLATS } from 'common/constants';
import HESelect from 'components/HESelect';
import './index.less';
import { getMiniConfig } from 'common/miniProgram';
function Row(props) {
  return (
    <div className="create-project-modal__content__row">{props.children}</div>
  );
}

function Label(props) {
  return (
    <label className="create-project-modal__content__row__label">
      {props.children}
    </label>
  );
}
export default class HEProjectPlat extends React.Component {
  state = {
    list: []
  }
  async getMiniProgramList() {
    const list = await getMiniConfig();
    this.setState({ list });
  }
  async UNSAFE_componentWillMount() {
    await this.getMiniProgramList();
  }
  render() {
    const { _handleProjectTypeChange, _handleMiniProgramIdChange, componentPlat, miniProgramId, showMiniProgramId } = this.props;
    const { list } = this.state;
    const miniList = list.map(item => {
      return { key: item.name, value: item.id };
    });
    return (
      <>
        <Row>
          <Label>{'项目类型'}：</Label>
          <HESelect
            className="create-project-modal__content__row__select"
            onSelect={_handleProjectTypeChange}
            options={COMPONENT_PLATS}
            placeholder={'请选择平台'}
            value={componentPlat}
          />
        </Row>
        {showMiniProgramId && componentPlat === 'miniProgram' && <Row>
          <Label>{'小程序'}：</Label>
          <HESelect
            className="create-project-modal__content__row__select"
            onSelect={_handleMiniProgramIdChange}
            options={miniList}
            placeholder={'请选择小程序'}
            value={miniProgramId}
          />
        </Row>}
      </>
    );
  }
}
