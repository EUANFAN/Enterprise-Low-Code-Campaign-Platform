import 'globals';
import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import Popular from './Popular';
import ThemeResource from './Theme';
import HomeDrawer from './HomeDrawer';
import HELoading from 'components/HELoading';
import { getHomeSecondaryPages } from 'apis/HomeAPI';
import { HomeSecondaryPageCategories } from 'common/constants';
import { toastSuccess, toastError, toastInfo } from 'components/HEToast';
import {
  createThemeCategory,
  updateCategory,
  deleteCategory,
  createThemeGroup,
  deleteThemeGroup,
  updateThemeGroup,
  createThemeInGroup,
} from 'apis/ThemeAPI';
import QueryString from 'common/queryString';
import ThemeTypeModal from './../components/ThemeTypeModal';
import ThemeGroupModal from './../components/ThemeGroupModal';
import CreateThemeModal from './../components/CreateThemeModal';
import { connectConfirm } from 'context/feedback';
import CreateThemeGroupModal from './../components/CreateThemeGroupModal';
import './index.less';
import { createRule, ruleBindThme } from 'apis/RuleAPI';

const {
  userInfo: { userDeptId: myUserDeptId },
  userInfo,
} = god.PageData;
const TOAST_TIMEOUT = 3000;
const DEFAULT_SECONDARY_ROUTE = HomeSecondaryPageCategories.POPULAR;
// /home/到此为止的话为目标字段，否则只占位不使用/目标字段/后边可能会有其他路径，但此处并不使用
const HOME_ROUTE_REGEX = /^\/home\/(?:\w+\/)?(\w+)(\/\S+)?/;
const INVALID_PATH = /^\/home\/?$/;

function getHomeSecondaryPageKey(pathname) {
  const match = HOME_ROUTE_REGEX.exec(pathname);

  return match ? match[1] : DEFAULT_SECONDARY_ROUTE;
}

function getHomeThirdPageKey(pathname) {
  const match = HOME_ROUTE_REGEX.exec(pathname);
  let groupId = null;
  if (match) {
    if (match[2]) {
      const s = match[2].split('/');
      groupId = s.length > 1 ? s[1] : null;
    }
  }
  return groupId;
}

const DEFAULT_ALL_DEPARTMENT = '';
class Home extends React.Component {
  state = {
    loading: true,
    category: [],
    selectDepartmentId: DEFAULT_ALL_DEPARTMENT, // 记录选中的下拉框的部门id
    selectNavDepId: '', // 记录选中类别的部门id
    defaultThemeType: '',
    defaultThemeGroup: '',
    showCategoryInfoModal: false,
    showCreateGroupModal: false,
    createGroupCategory: null,
    groupModalTarget: null,
    showCreateThemeModal: false,
    showCreateThemeType: false,
    showModal: false,
  };
  themeResource = null;

  async componentDidMount() {
    await this._getHomeSecondaryPages();
    const defaultThemeType = getHomeSecondaryPageKey(location.pathname);
    const defaultThemeGroup = getHomeThirdPageKey(location.pathname);
    this.setState({
      defaultThemeType,
      defaultThemeGroup,
    });
    this._redirectIfNeeded();
    this.props.onRef && this.props.onRef(this);
  }

  UNSAFE_componentWillMount() {
    // 获取 department
    let selectDepartmentId = this._getDepartmentFromUrl();
    this.setState({
      selectNavDepId: selectDepartmentId,
    });
  }
  _getDepartmentFromUrl() {
    let { userDeptId = '' } = QueryString.parse(location.search);
    return userDeptId;
  }

  _getHomeSecondaryPages() {
    return getHomeSecondaryPages().then(({ category }) => {
      this.setState({
        category,
        loading: false,
      });
    });
  }

  componentDidUpdate() {
    this._redirectIfNeeded();
  }

  // NOTE: 之所以不用 <Redirect> 是因为目前加上动效后会有 Warning
  // https://github.com/reactjs/react-transition-group/issues/296#issuecomment-379749322
  _redirectIfNeeded() {
    const { history, location } = this.props;

    if (INVALID_PATH.test(location.pathname)) {
      history.replace('/home/popular');
    }
  }
  // 选择后数据改变处理
  _changDrawerSelect(newKey, type, groupId, userDeptId) {
    const { history } = this.props;
    // const { selectNavDepId: userDeptId } = this.state;
    // TO CHECK: history = [home, theme/resource, home] 的情况
    let defaultThemeType;
    let defaultThemeGroup;
    if (type === HomeSecondaryPageCategories.POPULAR) {
      history.push('/home/popular');
      defaultThemeType = 'popular';
    }

    if (type === HomeSecondaryPageCategories.THEME) {
      history.push(`/home/theme/${newKey}?userDeptId=${userDeptId}`);
      defaultThemeType = newKey;
    }

    if (type === HomeSecondaryPageCategories.FREE) {
      history.push(`/home/free/${newKey}`);
      defaultThemeType = newKey;
    }

    if (type === 'themeGroup') {
      // 模板组内模板列表
      history.push(
        `/home/theme/${newKey}/${groupId}?userDeptId=${userDeptId}&auditStatus=0,1,2,3`
      );
      defaultThemeType = newKey;
      defaultThemeGroup = groupId;
    }

    this.setState({
      defaultThemeType,
      defaultThemeGroup,
      selectNavDepId: userDeptId,
    });
  }
  // 选择类别的回调
  _handleDrawerSelect = (newKey, type, selectDepartmentId, groupId) => {
    this._changDrawerSelect(newKey, type, groupId, selectDepartmentId);
  };
  // 选择事业部下拉的回调
  _handleDrawerSelectNav(selectDepartmentId) {
    this.setState(
      {
        selectDepartmentId,
      },
      () => {
        if (selectDepartmentId !== DEFAULT_ALL_DEPARTMENT) {
          const defaultIndex = 0;
          const items = this._getCurrentData();
          if (items.length > 0) {
            this._changDrawerSelect(
              items[defaultIndex].key,
              items[defaultIndex].category,
              '',
              items[defaultIndex].userDeptId
            );
          }
        } else {
          this._changDrawerSelect('', HomeSecondaryPageCategories.POPULAR);
        }
      }
    );
  }

  async _handleConfirm({ name, key, reviewerIds, isCreateTheme, _id }) {
    if (!name) {
      toastError('请填写模版名称');
      return;
    }

    if (!key) {
      toastError('请填写模版key值，该值唯一，且无法修改');
      return;
    }

    if (reviewerIds.length == 0) {
      toastError('请填写审核人员，至少一个');
      return;
    }

    if (isCreateTheme) {
      await this._handleCreateSubmit(name, key, reviewerIds);
    } else {
      await this._handleUpdateSubmit({ name, key, reviewerIds, _id });
    }
    return true;
  }
  async _handleCreateSubmit(name, key, reviewerIds) {
    try {
      const { selectDepartmentId } = this.state;
      // 如果是所有事业部，归属超管身份的所属部门，如果选择某一个部门，所属对应所选择的部门
      const userDeptId =
        selectDepartmentId === DEFAULT_ALL_DEPARTMENT
          ? myUserDeptId
          : selectDepartmentId;
      await createThemeCategory(name, key, reviewerIds, userDeptId);
      toastSuccess('新增类别成功');
      this._handleCreateThemeCategories(false);
      await this._getHomeSecondaryPages();
    } catch (err) {
      return toastError(err.message);
    }
  }
  async _handleUpdateSubmit(options = {}) {
    const { _id, ...otherOptions } = options;
    try {
      const { selectDepartmentId } = this.state;
      // 如果是所有事业部，归属超管身份的所属部门，如果选择某一个部门，所属对应所选择的部门
      const userDeptId =
        selectDepartmentId === DEFAULT_ALL_DEPARTMENT
          ? myUserDeptId
          : selectDepartmentId;
      await updateCategory(_id, { ...otherOptions, userDeptId });
      toastSuccess('更新类别成功');
      this._handleCreateThemeCategories(false);
      await this._getHomeSecondaryPages();
    } catch (err) {
      return toastError(err.message);
    }
  }
  // 获取选中的数据
  _getCurrentData() {
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

  async _handleCreateTheme({ showType = false }) {
    this.setState({
      showCreateThemeModal: true,
      showCreateThemeType: showType,
    });
  }

  // 创建模板 创建成功后跳转编辑页面
  _handleCreateThemeSubmit = async (
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
    const { showCreateThemeType, defaultThemeType, defaultThemeGroup } =
      this.state;
    if (!showCreateThemeType && !defaultThemeGroup) {
      return;
    }
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
        groupId: showCreateThemeType ? selectedThemeGroup : defaultThemeGroup,
        themeType: showCreateThemeType ? selectedThemeType : defaultThemeType,
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
  _renderCreateThemeModal() {
    const drawerData = this._getCurrentData();
    const { showCreateThemeType } = this.state;
    return (
      this.state.showCreateThemeModal && (
        <CreateThemeModal
          onClose={this._handleCloseModel}
          onSubmit={this._handleCreateThemeSubmit}
          showCreateThemeType={showCreateThemeType}
          drawerData={drawerData}
        />
      )
    );
  }
  _handleShowGroupInfo = (group) => {
    this.setState({ groupModalTarget: group });
  };
  _handleSubmitGroupModel = async (e, name) => {
    // const { onGroupUpdate } = this.props;
    const { groupModalTarget, defaultThemeGroup, defaultThemeType } =
      this.state;
    if (!groupModalTarget) {
      return;
    }

    toastInfo('正在保存');
    try {
      await updateThemeGroup(groupModalTarget._id, { name });
      toastSuccess('保存成功', TOAST_TIMEOUT);
      // 更新左侧模板列表；
      await this._getHomeSecondaryPages();
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
    if (defaultThemeType == groupModalTarget.category && !defaultThemeGroup) {
      this.themeResource &&
        this.themeResource._handleUpdateGroupList(groupModalTarget._id, name);
    }
    // 右侧需要修改列表数据
    this.setState({
      groupModalTarget: '',
    });
  };
  _renderGroupInfoModal() {
    const { groupModalTarget } = this.state;
    if (!groupModalTarget) {
      return null;
    }

    const targetGroup = groupModalTarget;
    return (
      <ThemeGroupModal
        name={targetGroup.name}
        themeCount={targetGroup.metadata.count}
        lastModified={targetGroup.lastModified}
        createdAt={targetGroup.createdAt}
        creator={targetGroup.creator}
        onClose={this._handleCloseModel}
        onSubmit={this._handleSubmitGroupModel}
      />
    );
  }
  // 审核模板信息
  _renderExamineTempleteInfo() {
    const { groupModalTarget } = this.state;
    if (!groupModalTarget) {
      return null;
    }

    const targetGroup = groupModalTarget;
    return (
      <ThemeGroupModal
        name={targetGroup.name}
        themeCount={targetGroup.metadata.count}
        lastModified={targetGroup.lastModified}
        createdAt={targetGroup.createdAt}
        creator={targetGroup.creator}
        onClose={this._handleCloseModel}
        onSubmit={this._handleSubmitGroupModel}
      />
    );
  }
  _handleCreateThemeGroup = (category) => {
    this.setState({
      showCreateGroupModal: true,
      createGroupCategory: category,
    });
  };
  _renderCreateThemeGroupModal() {
    return (
      this.state.showCreateGroupModal && (
        <CreateThemeGroupModal
          onSubmit={this._handleCreateThemeGroupSubmit}
          onClose={this._handleCloseModel}
        />
      )
    );
  }
  _handleCreateThemeGroupSubmit = async (event, name) => {
    // 创建模板组
    const { createGroupCategory } = this.state;
    let themeGroup;

    if (!name) {
      toastError('请填写模版组名称');
      return;
    }

    toastInfo('创建分组中');
    try {
      const result = await createThemeGroup(
        name,
        createGroupCategory.key,
        createGroupCategory.userDeptId
      );
      toastSuccess('创建成功', TOAST_TIMEOUT);
      themeGroup = result.themeGroup;
      await this._getHomeSecondaryPages();
      this._handleDrawerSelect(
        createGroupCategory.key,
        'themeGroup',
        createGroupCategory.userDeptId,
        themeGroup._id
      );
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
    this.setState({
      showCreateGroupModal: false,
    });
  };
  // 删除模板组
  _handleGroupDelete = async (group) => {
    const { onConfirmSet } = this.props;
    try {
      // TODO onConfirmSet 不是一个好的命名，找时间换一个
      await onConfirmSet('删除后将无法找回，确定删除？', '确认删除');
    } catch (err) {
      /* 用户取消 */ return;
    }

    toastInfo('正在删除');
    try {
      await deleteThemeGroup(group._id);
      toastSuccess('删除成功', TOAST_TIMEOUT);
      await this._getHomeSecondaryPages();
      this._handleDrawerSelect(
        group.category,
        HomeSecondaryPageCategories.THEME,
        group.userDeptId,
        ''
      );
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
  };
  _handleDeleteCategoryOpen = async (category) => {
    // todo: 删除模板类别
    const { onConfirmSet, history } = this.props;
    const { defaultThemeType } = this.state;
    try {
      await onConfirmSet('删除后将无法找回，确定删除？', '确认删除');
    } catch (err) {
      /* 用户取消 */ return;
    }
    toastInfo('正在删除');
    try {
      await deleteCategory(category._id);
      toastSuccess('删除成功', TOAST_TIMEOUT);
      // 如果删除的是当前的展示的模板类别，则跳转到常用模板
      if (category.key == defaultThemeType) {
        this.setState({
          defaultThemeType: 'popular',
          defaultThemeGroup: '',
        });
        history.replace('/home/popular');
      }
      await this._getHomeSecondaryPages();
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
  };
  _handleCategoryInfoOpen(category) {
    this.setState({ showCategoryInfoModal: true, categoryInfo: category });
  }
  _handleCategoryInfoSubmit = async (e, name) => {
    // 修改模板类别名称
    const { categoryInfo } = this.state;
    toastInfo('正在保存');
    try {
      await updateCategory(categoryInfo._id, { name });
      toastSuccess('保存成功', TOAST_TIMEOUT);
      await this._getHomeSecondaryPages();

      this.setState({
        showCategoryInfoModal: false,
        categoryInfo: '',
      });
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
  };
  _renderCategoryInfoModal() {
    // 最新修改时间和创建时间，数据库里面没有，需要添加
    const { categoryInfo } = this.state;
    return (
      this.state.showCategoryInfoModal &&
      categoryInfo && (
        <ThemeTypeModal
          onSubmit={this._handleCategoryInfoSubmit}
          onClose={this._handleCloseModel}
          name={categoryInfo.name}
          themeCount={categoryInfo.groups && categoryInfo.groups.length}
          lastModified={categoryInfo.lastModified}
          createdAt={categoryInfo.createdAt}
          creator={categoryInfo.creator}
        />
      )
    );
  }
  _handleCloseModel = () => {
    this.setState({
      showCategoryInfoModal: false,
      categoryInfo: null,
      showCreateGroupModal: false,
      createGroupCategory: null,
      groupModalTarget: '',
      showCreateThemeModal: false,
      showCreateThemeType: false,
    });
  };
  _handleTempleteInfo = () => { };

  _handleCreateThemeCategories = (flag) => {
    this.setState({
      showModal: flag,
    });
  };
  render() {
    const { location, history } = this.props;
    const {
      loading,
      selectDepartmentId,
      category,
      selectNavDepId,
      defaultThemeType,
      defaultThemeGroup,
      showModal,
    } = this.state;
    const items = this._getCurrentData();
    return (
      <div className="h5-home">
        <div className="h5-home__navigator">
          <HomeDrawer
            loading={loading}
            showModal={showModal}
            selectDepartmentId={selectDepartmentId}
            onSelect={this._handleDrawerSelect}
            onConfirm={this._handleConfirm.bind(this)}
            onCreateThemeCategoriesToggle={this._handleCreateThemeCategories.bind(
              this
            )}
            onCreateThemeOpen={() =>
              this._handleCreateTheme({ showType: true })
            }
            onGroupInfoOpen={this._handleShowGroupInfo.bind(this)}
            onExamineTempleteInfo={this._handleTempleteInfo.bind(this)}
            onCreateGroupOpen={(categoryInfo) =>
              this._handleCreateThemeGroup(categoryInfo)
            }
            onDeleteGroupOpen={this._handleGroupDelete.bind(this)}
            onDeleteCategoryOpen={(categoryInfo) =>
              this._handleDeleteCategoryOpen(categoryInfo)
            }
            onCategoryInfoOpen={(categoryInfo) =>
              this._handleCategoryInfoOpen(categoryInfo)
            }
            category={category}
            drawerData={items}
            history={history}
            defaultThemeType={defaultThemeType}
            defaultThemeGroup={defaultThemeGroup}
          />
        </div>
        <div className="h5-home__content">
          <div className="h5-home__content__scroller">
            {loading ? (
              <HELoading />
            ) : items.length ? (
              <React.Fragment key={location.key}>
                <Route
                  path="/home/popular"
                  render={(props) => (
                    <Popular drawerData={items} {...props}></Popular>
                  )}
                />
                <Route
                  path="/home/theme/:themeType/:themeGroupId?"
                  render={() => (
                    <ThemeResource
                      onRef={(node) => (this.themeResource = node)}
                      userInfo={userInfo}
                      selectNavDepId={selectNavDepId}
                      drawerData={items}
                      onGroupUpdate={this._getHomeSecondaryPages.bind(this)}
                      onGroupOpen={this._handleDrawerSelect}
                      onGroupDelete={this._handleGroupDelete.bind(this)}
                      onGroupInfo={this._handleShowGroupInfo.bind(this)}
                      onCreateThemeOpen={this._handleCreateTheme.bind(this)}
                    />
                  )}
                />
              </React.Fragment>
            ) : (
              <div className={'h5-home__content__nodata'}>
                该部门下暂时没有可用的模板类别
              </div>
            )}
          </div>
        </div>
        {this._renderCategoryInfoModal()}
        {this._renderCreateThemeGroupModal()}
        {this._renderGroupInfoModal()}
        {this._renderCreateThemeModal()}
      </div>
    );
  }
}

export default connectConfirm(withRouter(Home));
