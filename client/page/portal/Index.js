import React, { Component } from 'react';
import './index.less';
import { Row, Col } from 'antd';
import { createProject } from 'components/HEModal';
import { toastSuccess, toastError, toastInfo } from 'components/HEToast';
import CreateThemeModal from '../components/CreateThemeModal';
import { getHomeSecondaryPages } from 'apis/HomeAPI';
import { createRule, ruleBindThme } from 'apis/RuleAPI';
import { createThemeInGroup } from 'apis/ThemeAPI';
import { HEDrawer } from 'components/HEDrawer';
import { connectModal } from 'context/feedback';
const DEFAULT_ALL_DEPARTMENT = '';
const TOAST_TIMEOUT = 3000;
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      category: [],
      selectDepartmentId: props.selectDepartmentId || '', // 记录选中的下拉框的部门id
      showCreateThemeModal: false,
    };
  }
  gotoUrl = (url) => {
    god.location.href = url;
  };
  handleCreateProject = () => {
    createProject(
      {},
      (projectId, isRule) => {
        toastSuccess('创建成功，即将跳转');
        setTimeout(() => {
          god.location.href = isRule
            ? `/customRule/${projectId}`
            : `/editor/${projectId}`;
        }, 1000);
      },
      (err) => {
        toastError(err.message);
      }
    );
  };
  handleToggleShowModal = (val) => {
    this.setState({
      showModal: val,
    });
  };
  // 获取选中的数据
  getCurrentData() {
    const { category, selectDepartmentId } = this.state;
    const currentData = category.find((v) => v._id == selectDepartmentId);
    let list;
    // 如果选中所有部门
    if (selectDepartmentId === DEFAULT_ALL_DEPARTMENT) {
      list = category.reduceRight((pre, next) => {
        return pre.concat(next.themeGroupList);
      }, []);
    } else {
      list = currentData ? currentData.themeGroupList : [];
    }
    return list;
  }
  getList() { }
  renderCreateThemeModal() {
    const drawerData = this.getCurrentData();
    return (
      this.state.showCreateThemeModal && (
        <CreateThemeModal
          onClose={this.handleCloseModel}
          onSubmit={this.handleCreateThemeSubmit}
          showCreateThemeType={true}
          drawerData={drawerData}
        />
      )
    );
  }
  // 创建模板 创建成功后跳转编辑页面
  handleCreateThemeSubmit = async (
    event,
    {
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
    }
  ) => {
    let theme;
    toastInfo('创建模板中');
    try {
      let ruleId = null;
      // 创建 rule 对象， rule 在对象之前创建是因为要有绑定关系，方便二次编辑
      if (selectedRule) {
        const { rule } = await createRule({
          name,
          ruleWidget: selectedRule,
          remoteUrl,
          origin: selectedThemeType,
          isThemeRule: true,
          business: selectedBusiness,
        });
        ruleId = rule._id;
      }
      const result = await createThemeInGroup({
        name,
        layout: layoutType,
        groupId: selectedThemeGroup,
        themeType: selectedThemeType,
        application,
        componentPlat,
        ruleId,
        miniProgramId
      });
      toastSuccess('创建成功', TOAST_TIMEOUT);
      theme = result.project;
      if (selectedRule) {
        // 如果从模板创建的rule，需要和模板进行绑定
        await ruleBindThme({
          ruleId: ruleId,
          themeId: theme._id,
        });
      }
      let url = selectedRule
        ? `/customRule/${ruleId}`
        : `/editor/theme/${theme._id}`;
      god.location.href = url;
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
  };
  handleCloseModel = () => {
    this.setState({
      showCreateThemeModal: false,
    });
  };
  init = async () => {
    const { category } = await getHomeSecondaryPages();
    this.setState({ category });
  };
  componentDidMount() {
    this.init();
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.selectDepartmentId !== prevState.selectDepartmentId) {
      return {
        selectDepartmentId: nextProps.selectDepartmentId,
      };
    }
    return null;
  }
  render() {
    return (
      <div className="index">
        <HEDrawer></HEDrawer>
        <Row className="index__list">
          <Col span="8">
            <div
              className="index__list__item"
              onClick={this.handleCreateProject}
            >
              <p>
                手动搭建活动页面
                <br />
                无需上线、高效推广
              </p>
              <span>立即开始</span>
            </div>
          </Col>
          <Col span="8" onClick={() => this.gotoUrl('/home/popular')}>
            <div className="index__list__item">
              <p>
                从各种模板中
                <br />
                选择合适的直接复用
              </p>
              <span>立即开始</span>
            </div>
          </Col>
          <Col span="8">
            <div
              className="index__list__item"
              onClick={() => this.setState({ showCreateThemeModal: true })}
            >
              <p>
                项目接入后
                <br />
                可在本后台对外部生
              </p>
              <span>立即开始</span>
            </div>
          </Col>
        </Row>
        {this.renderCreateThemeModal()}
      </div>
    );
  }
}

export default connectModal(Index);
