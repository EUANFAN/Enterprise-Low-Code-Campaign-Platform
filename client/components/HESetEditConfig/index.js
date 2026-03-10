import React from 'react';
import { observer } from 'mobx-react';
import './index.less';
import { getStageConfig } from 'common/config';
import BuildtoolRule from 'store/clazz/BuildtoolRules';
import { loadTriggerConfig } from 'triggers';
import ControlWrap from 'controls/ControlWrap';
import { toastSuccess, toastError } from 'components/HEToast';
import { updateRule, setConfigData } from 'apis/RuleAPI';
import { context } from 'common/utils';
import { Modal } from 'antd';
import QueryString from 'common/queryString';
@observer
class HESetEditConfig extends React.Component {
  state = {
    ruleComponent: null,
    env: 'prod',
  };
  controlArr = {};
  getEditConfigList() {
    // 获取已配置的图层的列表
    const { ruleComponent } = this.state;
    const { project, element } = this.props;
    const editConfigState = project.editConfigState;
    const ruleStoreConfig = ruleComponent.config;
    let editConfigList = {};

    if (!editConfigState || Object.keys(editConfigState).length == 0) {
      editConfigList = { ...ruleStoreConfig };
    } else if (Object.keys(editConfigState).length > 0) {
      Object.keys(editConfigState).forEach((key) => {
        if (editConfigState[key] == element.path && ruleStoreConfig[key]) {
          editConfigList[key] = ruleStoreConfig[key];
        } else if (
          element.clazz == 'page' &&
          editConfigState[key] == 'project'
        ) {
          editConfigList[key] = ruleStoreConfig[key];
        }
      });
    }
    return editConfigList;
  }
  async componentDidMount() {
    const { project } = this.props;
    const ruleWidget = god.PageData.ruleWidget;
    const revisionData = god.PageData.rule.revisionData;
    let ruleDefine = await loadTriggerConfig({
      type: ruleWidget.type,
      version: ruleWidget.version,
    });

    const currentData = ruleDefine.data;
    if (revisionData) {
      Object.keys(currentData).forEach((prop) => {
        currentData[prop] =
          revisionData[prop] !== undefined
            ? revisionData[prop]
            : currentData[prop];
      });
    }
    const ruleComponent = new BuildtoolRule(ruleDefine, project);
    this.setState({
      ruleComponent,
    });
    const config = ruleDefine.config;
    Object.keys(config).forEach((key) => {
      let field = config[key];
      if (field.require && this.controlWrapRef.controlRef[key]) {
        this.controlArr[key] = this.controlWrapRef.controlRef[key];
      }
    });
    getStageConfig('EDITOR').then(async (res) => {
      if (res.loaded) {
        const EDITOR_RULES = res.config['NAV_OPTIONS'];
        let publishConfig = EDITOR_RULES['Publish'];
        let saveConfig = EDITOR_RULES['Save'];
        publishConfig.beforeShowPublish = this.onPublish.bind(this);
        saveConfig.save = async () => await this.onSaveRule('update');
      }
    });
  }
  _handleValidate() {
    return new Promise((resolve) => {
      let result = this.validate();
      if (!result) {
        toastError('请填写必填项！');
      }
      resolve(result);
    });
  }
  onSaveRule = async (action) => {
    const { ruleComponent } = this.state;
    const rule = god.PageData.rule;
    await updateRule({
      id: rule._id,
      ruleData: ruleComponent.data,
      ruleWidget: {
        type: ruleComponent.type,
        version: ruleComponent.version,
      },
      action,
    });
    // toastSuccess('保存成功！');
  };
  handleEidtorTheme = async (isPreview, action) => {
    const rule = god.PageData.rule;
    const { ruleComponent, env } = this.state;
    let validateRes = await this._handleValidate();
    if (isPreview && !validateRes) {
      toastError('请填写必填项');
      return;
    }
    if (validateRes) {
      try {
        if (
          ruleComponent['beforePublish'] &&
          typeof ruleComponent['beforePublish'] === 'function'
        ) {
          await ruleComponent.beforePublish(
            context({
              project: rule,
            })
          );
        }
        await this.onSaveRule(action);
        const sGroupId = ruleComponent.data.sGroupId;
        let result = await setConfigData({
          activityName: rule.name,
          member: rule.ownerId,
          sGroupId: sGroupId || 0,
          ruleId: rule._id,
          config: JSON.stringify(ruleComponent.data),
          type: env,
          business: rule.business || 'clientView',
        });
        if (result.code != 0) {
          toastError(result.msg);
        }
      } catch (error) {
        console.log('error', error);
      }
    }
  };
  onPublish = async () => {
    let self = this;
    let validateRes = await this._handleValidate();
    if (!validateRes) {
      toastError('请填写必填项');
      return;
    }
    Modal.confirm({
      content: '确定上线当前数据?',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        self.setState(
          {
            env: 'prod',
          },
          async () => {
            await self.handleEidtorTheme(true, 'publish');

            toastSuccess('发布成功');

            setTimeout(() => {
              // 如果是外部建站工具跳转过来，发布成功后跳转回到建站工具
              const { fromUrl = '' } = QueryString.parse(location.search);
              location.href = fromUrl || '/projects/my';
            }, 2000);
          }
        );
      },
    });
  };
  // 选项校验
  validate() {
    let { ruleComponent } = this.state;
    let { data, config } = ruleComponent;
    let res = [];
    Object.keys(this.controlWrapRef.controlRef).forEach((attribute) => {
      if (
        config[attribute].require &&
        this.controlWrapRef.controlRef[attribute] &&
        this.controlWrapRef.controlRef[attribute].validate &&
        typeof this.controlWrapRef.controlRef[attribute].validate == 'function'
      ) {
        res.push(
          this.controlWrapRef.controlRef[attribute].validate(data[attribute])
        );
      }
    });
    return res.every((item) => item);
  }
  render() {
    let { project, element } = this.props;
    const { ruleComponent } = this.state;
    if (!ruleComponent) return null;
    const WidgetConfig = this.getEditConfigList(element);
    return (
      <div className="he-editConfig-list">
        <ControlWrap
          key={project.id + element.id}
          WidgetConfig={WidgetConfig}
          project={ruleComponent}
          element={ruleComponent}
          namespace={'data'}
          ref={(node) => (this.controlWrapRef = node)}
        ></ControlWrap>
      </div>
    );
  }
}
export default HESetEditConfig;
