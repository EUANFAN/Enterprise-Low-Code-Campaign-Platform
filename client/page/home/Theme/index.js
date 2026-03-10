import 'globals';
import React from 'react';
import { withRouter } from 'react-router-dom';
import HELoading from 'components/HELoading';
import { toastSuccess, toastInfo, toastError } from 'components/HEToast';
import HELoadingFalse from 'components/HELoading/loadingFalse';
import QueryString from 'common/queryString';
import ThemeInfoModal from '../../components/ThemeInfoModal';
import CopyThemeModal from '../../components/CopyThemeModal';
import ExamineThemeInfoModal from '../../components/ExamineThemeInfo';
import { connectModal, connectToast, connectConfirm } from 'context/feedback';
import ThemeList from './../ThemeList';
import {
  getThemeGroups,
  getThemesByThemeGroup,
  deleteTheme,
} from 'apis/ThemeAPI';
import { AUDITSTATUSMESSAGE, AUDITBUTTONCONTENT } from '@/common/Audit.js';
import { copyProject, renameProject } from 'apis/ProjectAPI';
import { submitAudit } from 'apis/ThemeAPI.js';
import './index.less';

const PAGE_SIZE = 10;
const TOAST_TIMEOUT = 3000;
class Theme extends React.Component {
  static defaultProps = {
    drawerData: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      examineThemeModalTargetId: null,
      currentGroupId: null,
      editMode: false,
      groups: [],
      groupList: null,
      themes: null,
      themeModalTargetId: null,
      copyThemeModalTargetId: null,
      loading: true,
      error: false,
      total: null,
      current: null,
      themeType: null,
    };
  }
  async componentDidMount() {
    const {
      match: {
        params: { themeGroupId },
      },
    } = this.props;
    this.props.onRef && this.props.onRef(this);
    if (themeGroupId) {
      await this._fetchThemeListByGroup();
    } else {
      await this._fetchThemeGroups();
    }
  }
  _fetchThemeGroups = async () => {
    const {
      match: {
        params: { themeType },
      },
    } = this.props;
    const { search, current, userDeptId } = QueryString.parse(location.search);
    try {
      const { themeGroups, total } = await getThemeGroups(
        themeType,
        current,
        PAGE_SIZE,
        search,
        userDeptId
      );
      this.setState({
        groupList: themeGroups,
        loading: false,
        current: parseInt(current, PAGE_SIZE) || 1,
        total,
      });
    } catch (e) {
      if (e.message) {
        toastError(e.message);
        this.setState({ loading: false, themes: [] });
      } else {
        this.setState({ error: true, loading: false, themes: [] });
      }
    }
  };
  // 切换页码
  _handlePageChange = (event, pageNumber) => {
    const {
      location: { search, pathname },
      history,
    } = this.props;
    const { current } = this.state;
    if (pageNumber === current) {
      return;
    }
    const { page, ...others } = QueryString.parse(search); // eslint-disable-line no-unused-vars
    history.push(
      `${pathname}?${QueryString.stringify({ ...others, current: pageNumber })}`
    );
  };
  _handleUpdateGroupList = (groupModalTargetId, name) => {
    const { groupList } = this.state;

    const newGroups = groupList.map((group) => {
      if (group._id !== groupModalTargetId) {
        return group;
      }
      return { ...group, name };
    });
    this.setState({
      groupList: newGroups,
    });
  };
  _handleBreadcrumbClick = (event, index) => {
    const {
      match: {
        params: { themeType, themeGroupId },
      },
      location: { search },
      onGroupOpen,
    } = this.props;
    if (index === 0 && themeGroupId) {
      const { userDeptId } = QueryString.parse(search);
      onGroupOpen(themeType, 'theme', userDeptId, '');
    }
  };

  _fetchThemeListByGroup = async () => {
    const {
      match: {
        params: { themeGroupId },
      },
    } = this.props;
    const { search, current, auditStatus } = QueryString.parse(location.search);
    try {
      const { list, total } = await getThemesByThemeGroup(
        themeGroupId,
        current,
        PAGE_SIZE,
        false,
        search,
        1,
        auditStatus
      );
      this.setState({
        themes: list,
        loading: false,
        current: parseInt(current, PAGE_SIZE) || 1,
        total,
      });
    } catch (e) {
      if (e.message) {
        toastError(e.message);
        this.setState({ loading: false, themes: [] });
      } else {
        this.setState({ error: true, loading: false, themes: [] });
      }
    }
  };

  _handleThemeOpen = (event, itemId, ruleId) => {
    let url = ruleId ? `/customRule/${ruleId}` : `/editor/theme/${itemId}`;
    return (god.location.href = url);
  };

  _handleThemeDelete = async (themeId) => {
    const { onConfirmSet, onGroupUpdate } = this.props;

    try {
      // TODO onConfirmSet 不是一个好的命名，找时间换一个
      await onConfirmSet('删除后将无法找回，确定删除？', '确认删除');
    } catch (err) {
      /* 用户取消 */ return;
    }

    toastInfo('正在删除');
    try {
      await deleteTheme(themeId);
      toastSuccess('删除成功', TOAST_TIMEOUT);
      // 更新左侧列表信息和模板列表
      this._fetchThemeListByGroup();
      onGroupUpdate();
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
  };
  _handleThemeExamine(event) {
    this.setState({ examineThemeModalTargetId: event._id });
  }
  _handleThemeCopySubmit = async (event, name) => {
    const { onGroupUpdate } = this.props;
    const { copyThemeModalTargetId } = this.state;
    if (!copyThemeModalTargetId) {
      return;
    }
    let theme;
    const params = QueryString.stringify({
      id: copyThemeModalTargetId,
      name: name,
      type: 'theme',
    });
    toastInfo('复制中');
    try {
      theme = await copyProject(params);
      toastSuccess('复制成功', TOAST_TIMEOUT);
      onGroupUpdate();
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
    this.setState((prevState) => {
      let newList = [theme, ...prevState.themes];
      if (newList.length > PAGE_SIZE) {
        newList.pop();
      }
      return {
        themes: newList,
        copyThemeModalTargetId: null,
      };
    });
  };
  _handleRenameSubmitInfoModel = async (e, name) => {
    const { themeModalTargetId, themes } = this.state;
    if (!themeModalTargetId) {
      return;
    }

    toastInfo('正在保存');
    try {
      await renameProject(themeModalTargetId, name, 'theme');
      toastSuccess('保存成功', TOAST_TIMEOUT);
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
    const newThemes = themes.map((theme) => {
      if (theme._id !== themeModalTargetId) {
        return theme;
      }
      return { ...theme, name };
    });

    this.setState({
      themes: newThemes,
      themeModalTargetId: null,
    });
  };
  _handleSubmitInfoModel = async (e, message) => {
    const { examineThemeModalTargetId, themes } = this.state;
    if (!examineThemeModalTargetId) {
      return;
    }
    toastInfo('正在提交');
    try {
      const currentTheme = themes.find(
        (theme) => theme._id === examineThemeModalTargetId
      );
      await submitAudit(examineThemeModalTargetId, {
        info: message,
        key: currentTheme?.origin,
        ruleId: currentTheme?.ruleId,
      });
      toastSuccess('提交成功', TOAST_TIMEOUT);
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
    const newThemes = themes.map((theme) => {
      if (theme._id !== examineThemeModalTargetId) {
        return theme;
      }
      return { ...theme, auditStatus: 1 };
    });

    this.setState({
      themes: newThemes,
      examineThemeModalTargetId: null,
    });
  };

  _handleThemeCopy = (event, themeId) => {
    this.setState({ copyThemeModalTargetId: themeId });
  };

  _handleShowThemeInfo = (themeId) => {
    this.setState({ themeModalTargetId: themeId });
  };

  _handleCloseModel = () => {
    this.setState({
      themeModalTargetId: null,
      copyThemeModalTargetId: null,
    });
  };

  _renderThemeInfoModal() {
    const { themeModalTargetId, themes } = this.state;
    if (!themeModalTargetId) {
      return null;
    }

    const targetTheme = themes.find(
      (theme) => theme._id === themeModalTargetId
    );
    if (!targetTheme) {
      return null;
    }

    return (
      <ThemeInfoModal
        name={targetTheme.name}
        lastModified={targetTheme.lastModified}
        createdAt={targetTheme.createdAt}
        creator={targetTheme.ownerId}
        onClose={this._handleCloseModel}
        onSubmit={this._handleRenameSubmitInfoModel}
      />
    );
  }

  _renderCopyThemeModal() {
    return (
      this.state.copyThemeModalTargetId && (
        <CopyThemeModal
          onClose={this._handleCloseModel}
          onSubmit={this._handleThemeCopySubmit}
        />
      )
    );
  }
  //  审核模板信息
  _renderExamineThemeModal() {
    const { examineThemeModalTargetId, themes } = this.state;
    if (!examineThemeModalTargetId) {
      return null;
    }

    const targetTheme = themes.find(
      (theme) => theme._id === examineThemeModalTargetId
    );
    if (!targetTheme) {
      return null;
    }
    return (
      <ExamineThemeInfoModal
        auditButtonContent={AUDITBUTTONCONTENT[targetTheme.auditStatus]}
        name={targetTheme.name}
        statusInfo={AUDITSTATUSMESSAGE[targetTheme.auditStatus]}
        lastModified={targetTheme.lastModified}
        createdAt={targetTheme.createdAt}
        creator={targetTheme.ownerId}
        onClose={() => {
          this.setState({ examineThemeModalTargetId: null });
        }}
        onSubmit={this._handleSubmitInfoModel}
      />
    );
  }
  _handleSearch = (event) => {
    const value = event.target.value;
    const keyword = value.trim();
    const { history, location } = this.props;
    const { userDeptId = '' } = QueryString.parse(location.search);
    const params = QueryString.stringify({ search: keyword, userDeptId });
    history.push(`${location.pathname}?${params}`);
  };
  render() {
    const {
      drawerData,
      match: {
        params: { themeType, themeGroupId },
      },
      onCreateProject,
      onGroupOpen,
      onGroupDelete,
      onGroupInfo,
      onCreateThemeOpen,
    } = this.props;
    const { groupList, themes, loading, error, total, current } = this.state;
    if (loading) {
      return <HELoading />;
    }
    if (error) {
      return <HELoadingFalse />;
    }

    const getTitleList = () => {
      let item = drawerData.find((i) => i.key === themeType);
      const breadcrumb = [];
      if (item) {
        const { name, groups } = item;
        breadcrumb.push({ name: name });
        if (themeGroupId) {
          const currentGroup = groups.find(
            (group) => group._id === themeGroupId
          );
          if (currentGroup) {
            breadcrumb.push({ name: currentGroup.name });
          }
        }
      }
      return breadcrumb;
    };
    const breadcrumbList = getTitleList();

    const list = themeGroupId ? themes : groupList;
    let copyHandle = this._handleThemeCopy,
      editHandler = this._handleThemeOpen,
      renameHandler,
      deleteHandler;
    if (themeGroupId) {
      renameHandler = this._handleShowThemeInfo;
      deleteHandler = this._handleThemeDelete;
    } else {
      renameHandler = onGroupInfo;
      deleteHandler = onGroupDelete;
    }
    return (
      <div className="h5-theme-resource">
        <ThemeList
          breadcrumbList={breadcrumbList}
          onBreadcrumbClick={this._handleBreadcrumbClick.bind(this)}
          onCreateProject={onCreateProject}
          onCreateTheme={onCreateThemeOpen}
          loading={!list}
          list={list}
          listToRender={list}
          error={error}
          total={total}
          current={current}
          goToPage={this._handlePageChange.bind(this)}
          onSearch={this._handleSearch}
          isPopular={false}
          isTheme={themeGroupId}
          onCopy={copyHandle}
          onRename={renameHandler}
          onDelete={deleteHandler}
          onEdit={editHandler}
          onOpen={onGroupOpen}
          onExamine={this._handleThemeExamine.bind(this)}
        ></ThemeList>
        {this._renderThemeInfoModal()}
        {this._renderCopyThemeModal()}
        {this._renderExamineThemeModal()}
      </div>
    );
  }
}
export default connectConfirm(connectToast(connectModal(withRouter(Theme))));
