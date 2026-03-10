import React from 'react';

import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import HEInput from 'components/HEInput';
import HESkyLayer from 'components/HESkyLayer';
import { TreeSelect, Input } from 'antd';
import { toastError } from 'components/HEToast';
import { connectToast } from 'context/feedback';
import { noop } from 'utils/FunctionUtils';
import HERuleOperation from 'components/HERuleOperation';
import './index.less';
import { DefaultMiniInfo } from 'common/constants';
function Row(props) {
  return (
    <div className="create-theme-modal__content__row">{props.children}</div>
  );
}

function Label(props) {
  return (
    <label className="create-theme-modal__content__row__label">
      {props.children}
    </label>
  );
}

class CreateThemeModal extends React.Component {
  static defaultProps = {
    onClickAway: noop,
  };

  state = {
    currentName: '',
    selectedThemeType: this.props.themeType || null,
    selectedThemeGroup: this.props.themeGroupId || null,
    currentApplication: null,
    componentPlat: 'h5',
    useRemoteUrl: false,
    remoteUrl: '',
    selectedRule: '', // 选中的规则
    selectedBusiness: '', // 项目的业务类型
    miniProgramId: DefaultMiniInfo.id
  };

  _handleProjectTypeChange = (e, value) => {
    this.setState({
      componentPlat: value,
    });
  };
  __handleMiniProgramIdChange = (e, value) => {
    this.setState({
      miniProgramId: value,
    });
  }
  _handleNameChange = ({ target: { value } }) => {
    this.setState({ currentName: value.trim() });
  };

  _handleUrlChange = ({ target: { value } }) => {
    this.setState({ remoteUrl: value.trim() });
  };

  _handleRuleChange(e, selectValue) {
    this.setState({ selectedRule: selectValue });
  }

  _handleUseRemoteSelect = (event, selectValue) => {
    this.setState({ useRemoteUrl: selectValue });
  };

  _handleThemeGroupChange = (value) => {
    const selected = value.split('-');
    this.setState({
      selectedThemeType: selected[0],
      selectedThemeGroup: selected[1],
    });
  };

  _handleApplicationChange = ({ target: { value } }) => {
    this.setState({ currentApplication: value.trim() });
  };

  _handleBusinessChange(e, selectValue) {
    this.setState({ selectedBusiness: selectValue });
  }

  _handleSubmit = (event) => {
    const {
      currentName: name,
      currentLayoutType: layoutType,
      selectedThemeType,
      selectedThemeGroup,
      currentApplication: application,
      componentPlat,
      selectedRule,
      remoteUrl,
      selectedBusiness,
      miniProgramId
    } = this.state;
    const { showCreateThemeType } = this.props;
    if (
      ((showCreateThemeType && selectedThemeType && selectedThemeGroup) ||
        !showCreateThemeType) &&
      name &&
      application
      && ((componentPlat === 'miniProgram' && miniProgramId) || componentPlat === 'h5')
    ) {
      this.props.onSubmit(event, {
        name,
        layoutType,
        selectedThemeType,
        selectedThemeGroup,
        application,
        componentPlat,
        selectedRule,
        remoteUrl,
        selectedBusiness,
        miniProgramId
      });
    } else {
      if (remoteUrl && !/^https?:\/\/.*/.test(remoteUrl)) {
        toastError('请输入正确的远程链接');
        return;
      }
      return toastError('请输入模板信息！');
    }
  };

  render() {
    const { onClose, showCreateThemeType, drawerData } = this.props;
    const {
      currentName,
      useRemoteUrl,
      currentApplication,
      componentPlat,
      selectedRule,
      remoteUrl,
      selectedBusiness,
      selectedThemeType,
      selectedThemeGroup,
      miniProgramId
    } = this.state;

    const treeData = drawerData.map((item) => {
      const { groups, key, name } = item;
      const children = groups.map((group) => {
        const groupKey = key + '-' + group._id;
        return {
          title: group.name,
          value: groupKey,
          key: groupKey,
        };
      });
      let data = {
        title: name,
        value: key,
        key,
        children,
        selectable: false,
      };
      return data;
    });
    return (
      <HESkyLayer onOverlayClick={onClose} className="create-theme-skylayer">
        <HEModal className="create-theme-modal">
          <HEModalHeader title={'创建模板'} onClose={onClose} />
          <HEModalContent className="create-theme-modal__content">
            <Row>
              <Label>{'模板名称'}：</Label>
              <HEInput
                value={currentName}
                onChange={this._handleNameChange}
                className="create-theme-modal__content__row__input"
                type="text"
                maximumLetters={20}
                placeholder={'请输入模板名称'}
              />
            </Row>
            {showCreateThemeType && (
              <Row>
                <Label>{'模板类型'}：</Label>
                <TreeSelect
                  className="create-theme-modal__content__row__input"
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  treeData={treeData}
                  value={
                    selectedThemeType && selectedThemeGroup
                      ? selectedThemeType + '-' + selectedThemeGroup
                      : ''
                  }
                  placeholder="请选择模板类型"
                  treeDefaultExpandAll
                  onChange={this._handleThemeGroupChange}
                />
              </Row>
            )}
            <HERuleOperation
              componentPlat={componentPlat}
              selectedRule={selectedRule}
              useRemoteUrl={useRemoteUrl}
              remoteUrl={remoteUrl}
              selectedBusiness={selectedBusiness}
              miniProgramId={miniProgramId}
              showMiniProgramId={true}
              _handleProjectTypeChange={this._handleProjectTypeChange.bind(
                this
              )}
              _handleMiniProgramIdChange={this.__handleMiniProgramIdChange.bind(this)}
              _handleRuleChange={this._handleRuleChange.bind(this)}
              _handleUseRemoteSelect={this._handleUseRemoteSelect.bind(this)}
              _handleUrlChange={this._handleUrlChange.bind(this)}
              _handleBusinessChange={this._handleBusinessChange.bind(this)}
            />
            <Row>
              <Label>{'应用范围'}：</Label>
              <Input.TextArea
                placeholder={'请输入模板应用范围'}
                onChange={this._handleApplicationChange}
                value={currentApplication}
                className="create-theme-modal__content__row__input"
                autoSize
                maxLength={160}
                style={{
                  padding: '6px 20px',
                  color: ' #333',
                }}
              />
            </Row>
          </HEModalContent>
          <HEModalActions>
            <HEButton onClick={this._handleSubmit}>{'确定'}</HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default connectToast(CreateThemeModal);
