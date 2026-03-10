import './App.less';
import React from 'react';
import { observer } from 'mobx-react';
import { HENavbar } from 'components/HENavbar';
import { Modal } from 'antd';
import HEButton from 'components/HEButton';
import HEIconButton from 'components/HEIconButton';
import Save from 'components/icons/Save';
import ControlWrap from 'controls/ControlWrap';
import store from 'store/stage';
import { updateProject } from 'apis/ProjectAPI';
import { toastSuccess, toastError } from 'components/HEToast';
import { validateRoleLimit } from 'common/utils';
import ButtonControls from 'components/HEButtonControls';
import LocalStorage from 'common/localStorage';
import history from 'store/history';

const PageData = god.PageData;
store.init({
  ...PageData.project.revisionData,
  themeGroupId: PageData.project.themeGroupId,
  editable: PageData.project.editable,
  _id: PageData.project._id,
  origin: PageData.project.origin || '',
  thirdPartyConfig: PageData.project.thirdPartyConfig || '',
  editorType: 'project',
  userInfo: PageData.userInfo,
});

const { userInfo } = god.PageData;
@observer
class App extends React.Component {
  controlArr = {};
  state = {
    isSave: false,
  };
  Publish = React.createRef();
  onSave = async () => {
    this.setState({
      isSave: true,
    });
    let revisionData = store.getProject();
    const { pageShareTitle, pageShareText, pageShareImg } =
      revisionData.rulesConfig;
    const { pages } = revisionData;
    if (pageShareTitle && pageShareText && pageShareImg) {
      revisionData.pages = pages.map((page) => {
        page.triggers &&
          page.triggers.map((trigger) => {
            if (trigger.type == 'Share') {
              trigger.data.shareTitle = pageShareTitle;
              trigger.data.shareContent = pageShareText;
              trigger.data.shareImgUrl = pageShareImg;
            }
            return trigger;
          });
        return page;
      });
    }

    await updateProject(revisionData._id, revisionData);
    history.record();
    LocalStorage.removeItem(revisionData._id);
    toastSuccess('保存成功！');
  };

  _handleOpenProject = async () => {
    let project = store.getProject();
    let result = this.validate();
    if (result) {
      await this.onSave();
      location.href = `/editor/${project._id}`;
    } else {
      toastError('请填写必填项！');
    }
  };
  _handleValidate() {
    return new Promise((resolve) => {
      let result = this.validate();
      if (!result) {
        toastError('请填写必填项！');
      }
      resolve(result);
    });
  }
  // 选项校验
  validate() {
    let project = store.getProject();
    let { rulesConfig } = project;
    let res = [];
    Object.keys(this.controlArr).forEach((attribute) => {
      if (
        this.controlArr[attribute].validate &&
        typeof this.controlArr[attribute].validate == 'function'
      ) {
        res.push(this.controlArr[attribute].validate(rulesConfig[attribute]));
      }
    });
    return res.every((item) => item);
  }
  // 自定义返回方法
  backFunc() {
    Modal.confirm({
      title: '提示',
      content: '您还没有保存内容，确认要退出当前页面吗?',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        location.href = '/projects/my';
      },
    });
  }

  UNSAFE_componentWillMount() {
    const { RULES_CONFIG } = this.props;
    let project = store.getProject();
    let data = {};
    for (let key in RULES_CONFIG.data) {
      // store里面的project此时取到的值为空, 待解决
      data[key] =
        project.rulesConfig[key] === undefined
          ? !PageData.project.rulesConfig ||
            PageData.project.rulesConfig[key] === undefined
            ? RULES_CONFIG.data[key]
            : PageData.project.rulesConfig[key]
          : project.rulesConfig[key];
    }
    // 前面new Widget()里data虽然是可监听的对象，但是对新增的属性不会监听。将data重新变为可监听的对象
    project.modify(data, 'rulesConfig');
  }
  componentDidMount() {
    const { RULES_CONFIG } = this.props;
    let config = RULES_CONFIG.config;
    Object.keys(config).forEach((key) => {
      let field = config[key];
      if (field.require && this.controlWrapRef.controlRef[key]) {
        this.controlArr[key] = this.controlWrapRef.controlRef[key];
      }
    });
  }
  render() {
    const {
      RULES_CONFIG,
      EDITOR_RULES: { CAN_EDIT },
      config,
    } = this.props;
    let project = store.getProject();
    let WidgetConfig = RULES_CONFIG.config;
    const PreviewBtn = ButtonControls['Preview'];
    const PublishBtn = ButtonControls['Publish'];
    // 发布前需要校验表单，添加点击发布的钩子，验证成功后才打开
    let publishConfig = config['NAV_OPTIONS']['Publish'];
    publishConfig.beforeShowPublish = this._handleValidate.bind(this);
    const listBtns = (
      <>
        <PreviewBtn
          store={store}
          userInfo={userInfo}
          config={config['NAV_OPTIONS']['Preview']}
        />
        <PublishBtn
          ref={(node) => (this.Publish = node)}
          store={store}
          userInfo={userInfo}
          config={publishConfig}
        />
      </>
    );

    const editeBtn = (
      <>
        {/* 不能进入编辑区域项目，展示预览、测试发布、线上发布 */}
        {!CAN_EDIT && listBtns}
        {/* 不能进入编辑区域项目，管理员除外 */}
        {/* 常规项目，可以进入下一步 */}
        {((!CAN_EDIT && validateRoleLimit('createRuleProject')) ||
          CAN_EDIT) && (
          <HEButton
            className="rule-config__next__btn"
            onClick={this._handleOpenProject.bind(this)}
          >
            {CAN_EDIT ? '下一步' : '进入编辑'}
          </HEButton>
        )}
      </>
    );
    return (
      <div className="rule-config">
        <div className="rule-config__head">
          <HENavbar
            backFunc={!this.state.isSave && this.backFunc}
            actionElement={
              <>
                <HEIconButton
                  className="editor-navbar__actions__icon-button"
                  iconElement={<Save />}
                  titleElement={'保存'}
                  onClick={this.onSave}
                />
                {/* <HEButton className="rule-config__next__btn" onClick={this._handleOpenProject.bind(this)}>
                  {'下一步'}
                </HEButton> */}
                {editeBtn}
              </>
            }
          >
            <p className="h5-navbar-title">规则配置-{PageData.project.name}</p>
          </HENavbar>
        </div>
        <div className="rule-config__content">
          <ControlWrap
            key={project.id}
            WidgetConfig={WidgetConfig}
            project={project}
            element={project}
            namespace={'rulesConfig'}
            ref={(node) => (this.controlWrapRef = node)}
          ></ControlWrap>
        </div>
      </div>
    );
  }
}

export default App;
