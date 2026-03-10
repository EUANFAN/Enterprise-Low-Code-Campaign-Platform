/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:03:15
 */
import React from 'react';

import Moment from 'moment';
import 'moment/locale/zh-cn';
import { DatePicker } from 'antd';
import locale from 'antd/es/date-picker/locale/zh_CN';
import HEInput from 'components/HEInput';
import HEButton from 'components/HEButton';
import HESkyLayer from 'components/HESkyLayer';
import HERuleOperation from 'components/HERuleOperation';
import HEProjectTag from 'components/HEProjectTag';
import { toastError, toastLoading } from 'components/HEToast';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions
} from 'components/HEModal';
import './createProjectModal.less';
import { createProjectByPath, projectsCreateHybridApi } from 'apis/ProjectAPI';
import { createRule } from 'apis/RuleAPI';
import { getStageConfig } from 'common/config';
import { DefaultMiniInfo } from 'common/constants';
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

export default class CreateProjectModal extends React.Component {
  success = null;
  fail = null;

  state = {
    show: false,
    path: 'my',
    breadcrumbData: [],
    currentName: '',
    currentPageCount: 1,
    currentLayoutType: 'normal',
    runingStartTime: Moment(new Date()),
    runingEndTime: Moment('2099-01-01T00:00:00.763Z'),
    componentPlat: 'h5',
    useRemoteUrl: true,
    remoteUrl: '',
    selectedBusiness: '',
    selectedRule: '' // 选中的规则
  };
  resetState() {
    this.setState({
      show: false,
      path: 'my',
      breadcrumbData: [],
      currentName: '',
      currentPageCount: 1,
      currentLayoutType: 'normal',
      runingStartTime: Moment(new Date()),
      runingEndTime: Moment('2099-01-01T00:00:00.763Z'),
      componentPlat: 'h5',
      useRemoteUrl: true,
      remoteUrl: '',
      selectedBusiness: '',
      selectedRule: '' // 选中的规则
    });
  }
  show = (options, success, fail) => {
    const { path = 'my', breadcrumbData = [{ name: '我的' }] } = options;

    this.success = success || (() => {});
    this.fail = fail || (() => {});

    this.setState({
      path,
      breadcrumbData,
      show: true
    });
  };

  _handleClose = () => {
    this.resetState();
  };

  _handleNameChange = (event) => {
    const newTarget = event.target.value;
    this.setState({ currentName: newTarget.trim() });
  };

  _handlePageCountChange = (event) => {
    const newTarget = event.target.value;
    this.setState({ currentPageCount: parseInt(newTarget, 10) });
  };
  _handleStartTimeChange = (startTime) => {
    this.setState({
      runingStartTime: startTime
    });
  };
  _handleEndTimeChange = (endTime) => {
    this.setState({
      runingEndTime: endTime
    });
  };

  _handleProjectTypeChange = (e, value) => {
    this.setState({
      componentPlat: value
    });
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

  _handleBusinessChange(e, selectValue) {
    this.setState({ selectedBusiness: selectValue });
  }

  async _createHybrid(projectId, name) {
    let parms2 = {
      projectId: projectId,
      name: name
    };
    return projectsCreateHybridApi(parms2);
  }
  _handleSubmit = async () => {
    const {
      path,
      currentName,
      currentPageCount,
      currentLayoutType,
      runingStartTime,
      runingEndTime,
      componentPlat,
      remoteUrl,
      selectedRule,
      selectedBusiness
    } = this.state;

    if (!currentName) return toastError('请输入项目名称！');
    if (!runingStartTime) return toastError('请输入项目上线时间！');
    if (!runingEndTime) return toastError('请输入项目下线时间！');
    if (runingStartTime > runingEndTime)
      return toastError('上线时间不能小于下线时间！');
    if (remoteUrl && !/^https?:\/\/.*/.test(remoteUrl)) {
      toastError('请输入正确的远程链接');
      return;
    }
    toastLoading('创建项目中' + `: ${currentName}`);
    try {
      if (selectedRule) {
        if (!remoteUrl) return toastError('请输入外部链接！');
        const { rule } = await createRule({
          name: currentName,
          ruleWidget: selectedRule,
          remoteUrl,
          business: selectedBusiness
        });
        this.success(rule._id, true);
      } else {
        const result = await createProjectByPath({
          path,
          name: currentName,
          pageCount: currentPageCount,
          layoutType: currentLayoutType,
          componentPlat,
          miniProgramId: DefaultMiniInfo.id,
          runingTime: JSON.stringify({ runingStartTime, runingEndTime })
        });

        // 调用hybrid应用创建接口
        // await this._createHybrid(result.projectId, currentName);
        this.success(result.projectId);
      }
    } catch (err) {
      this.fail(err);
    }
  };

  // UNSAFE_componentWillMount() {
  //   getStageConfig('TITLE').then((res) => {
  //     if (res.loaded) {
  //       this.setState({
  //         currentName: res.config
  //       });
  //     }
  //   });
  // }

  render() {
    const {
      show,
      currentName,
      runingStartTime,
      runingEndTime,
      componentPlat,
      useRemoteUrl,
      selectedRule,
      remoteUrl,
      selectedBusiness
    } = this.state;
    if (!show) {
      return null;
    }
    return (
      <HESkyLayer onOverlayClick={this._handleClose}>
        <HEModal className="create-project-modal">
          <HEModalHeader title={'创建空白项目'} onClose={this._handleClose} />
          <HEModalContent className="create-project-modal__content">
            <Row>
              <Label>{'项目名称'}：</Label>
              <HEInput
                value={currentName}
                onChange={this._handleNameChange}
                className="create-project-modal__content__row__input"
                type="text"
                maximumLetters={20}
                placeholder={'请输入本项目的名称，方便查找'}
              />
            </Row>
            <Row>
              <Label>{'上线时间'}：</Label>
              <DatePicker
                locale={locale}
                showTime
                className="create-project-modal__content__row__date"
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={'请选择上线时间'}
                onChange={this._handleStartTimeChange}
                value={runingStartTime}
              />
            </Row>
            <Row>
              <Label>{'下线时间'}：</Label>
              <DatePicker
                locale={locale}
                showTime
                className="create-project-modal__content__row__date"
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={'请选择下线时间'}
                onChange={this._handleEndTimeChange}
                value={runingEndTime}
              />
            </Row>
            {
              <HERuleOperation
                componentPlat={componentPlat}
                selectedRule={selectedRule}
                useRemoteUrl={useRemoteUrl}
                remoteUrl={remoteUrl}
                selectedBusiness={selectedBusiness}
                isRuleProject={true}
                showMiniProgramId={false}
                _handleProjectTypeChange={this._handleProjectTypeChange.bind(
                  this
                )}
                _handleRuleChange={this._handleRuleChange.bind(this)}
                _handleUseRemoteSelect={this._handleUseRemoteSelect.bind(this)}
                _handleUrlChange={this._handleUrlChange.bind(this)}
                _handleBusinessChange={this._handleBusinessChange.bind(this)}
              />
            }
          </HEModalContent>
          <HEModalActions>
            <HEButton onClick={this._handleSubmit}>{'确定'}</HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}
