import 'globals';
import React from 'react';
import { difference, union } from 'lodash';
import { withRouter } from 'react-router-dom';
import { fetchJSON } from 'apis/BaseAPI';
import {
  getProjects,
  copyProject,
  renameProject,
  getProjectsComponents,
  updateProjectsComponents,
  getThemeDataConfig,
  updateProjectInfo
} from 'apis/ProjectAPI';
import QueryString from 'common/queryString';
import HEActionBar from 'components/HEActionBar';
import CreateFolderModal from 'components/CreateFolderModal';
import ProjectInfoModal from '../../../components/ProjectInfoModal';
import ProjectFolderInfoModal from '../../../components/ProjectFolderInfoModal';
import ProjectsBulkMoveModal from '../../../components/ProjectsBulkMoveModal';
import confirm from 'components/HEConfirm/confirm';
import ShowConfirm from 'components/HEConfirm';
import LinkModal from '../../../components/LinkModal';
import SimpleInputModal from '../../../components/SimpleInputModal';
import { toastSuccess, toastError, toastLoading } from 'components/HEToast';
import HESelectable from 'components/HESelectable';
import HEPagination from 'components/HEPagination';
import ProjectCard from '../ProjectCard';
import ProjectTable from '../ProjectTable';
import HEBreadcrumb from 'components/HEBreadcrumb';
import ProjectPreviewModal from 'components/HEProjectPreview';
import WidgetConfigChangeModal from '../WidgetConfigChangeModal';
import HELoading from 'components/HELoading';
import HELoadingFalse from 'components/HELoading/loadingFalse';
import { createProject } from 'components/HEModal';
import { observer } from 'mobx-react';
import LocalStorage from 'common/localStorage';
import BUSINESS_LIST from 'common/businessList';
import { Checkbox, Row, Select, Col } from 'antd';
import { validateRoleLimit } from 'common/utils';
const CheckboxGroup = Checkbox.Group;
// 项目类型，氛围project常规项目，rule规则配置
import './index.less';
import {
  createNewFolder,
  deleteProjects,
  restoreProjects,
  addChildrenToFolder,
  bulkPublishProjects
} from 'apis/ProjectAPI';
import HEButton from 'components/HEButton';
import noFile from 'components/imgs/nofile.png';
import { updateProject } from 'apis/ProjectAPI';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';

// TODO: 通过server下发的权限readWrite\admin，及操作列表[save\publish\move\transfer] 来决定显示

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  pagination: { marginTop: 16 },
  table: { width: '100%' }
};

const PAGE_SIZE = 10;
const TOAST_TIMEOUT = 3000;
const PROJECT_PLACEHOLDERS = new Array(PAGE_SIZE).fill({});
@observer
class ProjectList extends React.Component {
  state = {
    list: null,
    loading: true,
    error: false,
    createFolder: false,
    total: null,
    bulkMode: false,
    current: null,
    showProjectInfo: false,
    folderInfoMap: null,
    breadcrumbList: null,
    targetModalInfoId: null,
    moveModalShow: false,
    linkTarget: null,
    projectOrigin: '',
    previewTarget: null,
    showTransferModal: false,
    showCopyModal: false,
    chooseWidget: [],
    chooseAllFlag: false,
    chooseCurrentFlag: false,
    selectedIds: [],
    noSelectIds: [],
    showModal: false,
    needUpgradeWidgetList: [],
    checkedWidgets: [],
    affectedProjectList: {},
    selectWidgets: {},
    showWidgetConfigChangeModal: false,
    projectsComponents: null,
    showTypeCard: true,
    renameFolder: false,
    activeFolderId: null,
    componentPlat: 'h5'
  };

  componentDidMount() {
    this.renderListByPath();
  }

  componentDidUpdate = async (prevProps) => {
    const { location, showCollaborateModal } = this.props;
    // 协同showCollaborateModal窗口关闭时重新刷新list
    if (
      prevProps.location.pathname !== location.pathname ||
      prevProps.location.search !== location.search ||
      (prevProps.showCollaborateModal && !showCollaborateModal)
    ) {
      await this.renderListByPath();
    }
  };

  closeWidgetConfigChangeModal() {
    this.setState({
      showWidgetConfigChangeModal: false
    });
  }
  renderListByPath = async () => {
    const { location } = this.props;

    const { current } = QueryString.parse(location.search);
    try {
      const {
        list: resultList,
        total,
        folderInfoMap,
        breadcrumbList
      } = await this.getProjectListByPath();
      if (resultList) {
        this.handleChooseButton(resultList);
        this.setState({
          breadcrumbList,
          total,
          current: parseInt(current, PAGE_SIZE) || 1,
          list: resultList,
          folderInfoMap,
          loading: false
        });
      }
    } catch (err) {
      this.setState({
        error: true
      });
      toastError(err.message);
    }
  };

  getProjectListByPath = async () => {
    const {
      location,
      match: {
        params: { roleId, folderId }
      }
    } = this.props;
    const { search, current, department } = QueryString.parse(location.search);
    return getProjects({
      roleId: roleId,
      path: folderId,
      current,
      search,
      pageSize: PAGE_SIZE,
      department
    });
  };

  toggleSelectedIds = (idType, projectId) => {
    let ids = this.state[idType] || [];
    this.setState({
      [idType]:
        ids.indexOf(projectId) === -1
          ? [...ids, projectId]
          : ids.filter((id) => id !== projectId)
    });
  };
  handleChooseButton = (resultList) => {
    const { noSelectIds } = this.state;
    let selectedIds = this.state.selectedIds;
    const currentPageIds = resultList.map((project) => project._id);
    if (this.state.chooseAllFlag) {
      selectedIds = difference(currentPageIds, noSelectIds);
    }
    const otherPageSelectIds = difference(selectedIds, currentPageIds);
    const currentPageSelectIds = difference(selectedIds, otherPageSelectIds);
    this.setState({
      selectedIds,
      chooseCurrentFlag: currentPageSelectIds.length === PAGE_SIZE
    });
  };

  // 选中事件
  _handleToggleSelect = (event, projectId) => {
    if (this.state.chooseAllFlag) {
      this.toggleSelectedIds('noSelectIds', projectId);
    }
    this.toggleSelectedIds('selectedIds', projectId);
  };

  _handleChooseCurrentPage = () => {
    const {
      chooseCurrentFlag: prevChooseCurrentFlag,
      selectedIds,
      noSelectIds,
      list
    } = this.state;
    const currentPageIds = list.map((project) => {
      return project._id;
    });
    this.setState({
      chooseCurrentFlag: !prevChooseCurrentFlag,
      selectedIds: prevChooseCurrentFlag
        ? difference(selectedIds, currentPageIds)
        : union(selectedIds, currentPageIds),
      noSelectIds: prevChooseCurrentFlag
        ? union(noSelectIds, currentPageIds)
        : difference(noSelectIds, currentPageIds)
    });
  };

  _handleChooseAll = () => {
    const { chooseAllFlag: prevChooseAllFlag, list } = this.state;
    const currentPageIds = list.map((project) => {
      return project._id;
    });
    this.setState({
      chooseAllFlag: !prevChooseAllFlag,
      selectedIds: !prevChooseAllFlag ? currentPageIds : [],
      chooseCurrentFlag: !prevChooseAllFlag,
      noSelectIds: []
    });
  };

  _handleSearch = (event) => {
    const value = event.target.value.trim();
    const { history, location, userDeptId } = this.props;
    let { department = '' } = QueryString.parse(location.search);
    if (department === '' && !validateRoleLimit('chooseBizUnit')) {
      // 如果有选择事业部的权限，则为超管，可以查询所有项目
      department = userDeptId;
    }
    const params = QueryString.stringify({ search: value, department });
    history.push(`${location.pathname}?${params}`);
  };

  _handleToggleBulkMode = () => {
    this.setState((prevState) => ({
      selectedIds: [],
      bulkMode: !prevState.bulkMode,
      chooseAllFlag: false,
      chooseCurrentFlag: false
    }));
  };

  _handleCreateFolder = () => {
    this.setState({ createFolder: true });
  };

  _handleCreateProject = async () => {
    const {
      location: { pathname }
    } = this.props;
    const path = pathname
      .split('/')
      .filter((i) => i)
      .slice(1)
      .join('/');
    const breadcrumbData = this._getBreadcrumbData();
    createProject(
      { path, breadcrumbData },
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

  _handleModalClose = () => {
    this.setState({
      createFolder: false,
      targetModalInfoId: null,
      showProjectInfo: false,
      moveModalShow: false
    });
  };

  _handleInfoModalSubmit = async (event, options) => {
    const { list, targetModalInfoId } = this.state;
    if (!list || !list.length || !targetModalInfoId) return;
    const targetItem = list.find((item) => item._id === targetModalInfoId);
    if (!targetItem) return;

    const { name, tags } = targetItem;
    const rawData = {
      name,
      tags
    };

    // 比对 更新数据 与 原数据
    if (options.runingEndTime && targetItem.revisionData?.runingEndTime) {
      const {
        revisionData: { runingEndTime, runingStartTime }
      } = targetItem;
      rawData.runingEndTime = runingEndTime;
      rawData.runingStartTime = runingStartTime;
    }
    // 待更新数据
    const diffData = Object.fromEntries(
      Object.entries(options).filter(
        ([key, value]) => !isEqual(value, rawData[key])
      )
    );
    if (!isEmpty(diffData)) {
      try {
        toastLoading('正在保存');
        await updateProjectInfo({
          id: targetModalInfoId,
          ...diffData
        });
        toastSuccess('保存成功', TOAST_TIMEOUT);
        this.setState({
          targetModalInfoId: null,
          list: list.map((item) => {
            if (item._id === targetModalInfoId) {
              item.name = options.name;
              item.tags = options.tags;
              if (!item.remoteUrl && item.revisionData) {
                item.revisionData.runingStartTime = options.runingStartTime;
                item.revisionData.runingEndTime = options.runingEndTime;
              }
            }
            return item;
          })
        });
      } catch (err) {
        return toastError(err.message, TOAST_TIMEOUT);
      }
    } else {
      this.setState({
        targetModalInfoId: null
      });
      return;
    }
  };

  _handleCreateFolderSubmit = async (event, folderName) => {
    const {
      match: {
        params: { roleId }
      },
      location: { pathname }
    } = this.props;

    if (!folderName) {
      toastError('输入框不为空!', TOAST_TIMEOUT);
      return;
    }

    try {
      const currentRoleId = roleId;
      const pathNameList = pathname.split('/');
      let currentFoldersId;
      if (pathNameList.length == 3) {
        currentFoldersId = undefined;
      } else if (pathNameList.length > 3) {
        currentFoldersId = pathNameList.pop();
      }
      await createNewFolder(folderName, currentRoleId, currentFoldersId);
      this.renderListByPath();
    } catch (err) {
      toastError(err.message, TOAST_TIMEOUT);
    }
    this._handleModalClose();
  };

  _handleCardOpen = (event, id) => {
    const { match, history } = this.props;
    const { list } = this.state;
    const status = location.pathname.includes('/projects/bin')
      ? 'out-of-use'
      : 'in-use';
    const target =
      list && list.find((projectOfFolder) => projectOfFolder._id === id);
    if (!target) {
      return;
    }
    if (target.isFolder) {
      const {
        params: { folderId, roleId }
      } = match;
      const { department } = QueryString.parse(location.search);
      const query = department ? '?department=' + department : '';
      history.push(
        `/projects/${roleId}/${folderId ? `${folderId}/` : ''}${
          target._id
        }${query}`
      );
    } else if (status == 'out-of-use') {
      toastError('不能打开回收站中的项目');
      return;
    } else {
      // 判断是否是规则项目，跳到对应的链接
      if (target.ruleWidget) {
        god.location.href = `/customRule/${target._id}`;
      } else {
        god.location.href = BUSINESS_LIST[target.origin]
          ? `/rule/${target._id}`
          : `/editor/${target._id}`;
      }
    }
  };

  _handleCardShowInfo = (event, id) => {
    this.setState({
      showProjectInfo: true,
      targetModalInfoId: id
    });
  };

  _goToPage = (pageNumber) => {
    const {
      location: { search, pathname },
      history
    } = this.props;
    const { page, ...others } = QueryString.parse(search); // eslint-disable-line no-unused-vars
    history.push(
      `${pathname}?${QueryString.stringify({ ...others, current: pageNumber })}`
    );
  };
  // 切换页码
  _handlePageChange = (event, pageNumber) => {
    if (pageNumber === this.state.current) {
      return;
    }
    this.setState({
      chooseCurrentFlag: false
    });
    this._goToPage(pageNumber);
  };
  _getBreadcrumbData() {
    const {
      match: {
        params: { roleId, folderId }
      },
      rolesList: roles
    } = this.props;
    const { breadcrumbList } = this.state;
    const { department } = QueryString.parse(location.search);
    const departmentList = god.PageData.deptList;
    let roleName;
    if (roleId === 'my') {
      roleName = '全部项目';
    } else if (roleId === 'all') {
      if (!department) {
        roleName = '所有事业部';
      }
      departmentList.forEach((item) => {
        const { _id, name } = item;
        if (_id == department) {
          roleName = name + '的项目';
        }
      });
    } else if (roleId === 'bin') {
      roleName = '回收站';
    } else if (roleId === 'join') {
      roleName = '协同项目';
    } else if (roleId === 'rule') {
      roleName = '规则项目';
    } else {
      roleName = !roles ? '' : roles.find((item) => item._id === roleId).name;
    }
    let data = [{ name: roleName }];

    if (folderId && breadcrumbList) {
      const foldersName = breadcrumbList.map((item) => {
        return { name: item.name || '' };
      });
      data = data.concat(foldersName);
    }
    return data;
  }
  _handleBreadcrumbClick = (event, breadcrumbIndex) => {
    const { breadcrumbList } = this.state;
    const {
      history,
      location,
      match: {
        params: { roleId }
      }
    } = this.props;
    const { department } = QueryString.parse(location.search);
    const query = department ? '?department=' + department : '';
    if (
      !breadcrumbList ||
      !breadcrumbList.length ||
      breadcrumbList.length === breadcrumbIndex
    )
      return;

    if (breadcrumbIndex === 0) {
      // 点击的是 群组
      history.push(`/projects/${roleId}${query}`);
    } else {
      // 点击的是folder
      const separater = '/';
      const ids = location.pathname.split(separater);

      // 因为传入的数据 加了一个群组的name
      const targetId = breadcrumbList[breadcrumbIndex - 1]._id;
      const targetIdsIndex = ids.findIndex((id) => id === targetId);
      const newPath = ids.slice(0, targetIdsIndex + 1).join(separater) + query;
      history.push(newPath);
    }
  };

  _getTargetModalInfo(id, list) {
    if (!id || !list || !list.length) {
      return;
    }
    return list.find((item) => item._id === id);
  }

  _handleBulkOrOneRestoreOrDelete = async (event, id, deleted) => {
    let text = deleted ? '删除' : '还原';
    let msg = deleted
      ? '删除后会将当前内容清除，移入回收站！'
      : `确定${text}吗？`;
    let {
      match: {
        params: { roleId, folderId }
      },
      location: { pathname }
    } = this.props;
    const { selectedIds } = this.state;

    if (!id && selectedIds.length === 0) {
      return toastError(`请选择要${text}的文件`, TOAST_TIMEOUT);
    }

    try {
      await confirm(msg, `${text}提示`);
    } catch (err) {
      /* 用户取消 */ return;
    }

    let pathNameList = pathname.split('/');
    let currentFolderIds = [];

    if (pathNameList.length > 3) {
      currentFolderIds = pathNameList.slice(3);
    }

    let targetIds, selectIdList;
    if (id) {
      targetIds = [id];
      selectIdList = [id];
    } else {
      targetIds = selectedIds;
    }
    try {
      await (deleted ? deleteProjects : restoreProjects)(
        roleId,
        targetIds,
        currentFolderIds,
        {
          chooseAll: this.state.chooseAllFlag,
          noSelectIds: this.state.noSelectIds.join(','),
          folderId
        }
      );
      toastSuccess(`${text}成功`, TOAST_TIMEOUT);
      this.setState({
        selectedIds: [],
        chooseCurrentFlag: false,
        chooseAllFlag: false,
        noSelectIds: []
      });
    } catch (err) {
      toastError(err.message, TOAST_TIMEOUT);
    }
    const handleNumber = selectIdList ? selectIdList.length : 0;
    const currentListLength = this.state.list.length;

    const {
      history,
      location: { search }
    } = this.props;
    const { total } = this.state;
    const { current } = QueryString.parse(search);

    if (handleNumber === currentListLength && current === total) {
      // 最后一页全部删除时对页面进行处理
      const newSearchObject = QueryString.parse(search);
      newSearchObject.current = Number(current) - 1;
      let newSearchString = QueryString.stringify(newSearchObject);
      history.push(`${pathname}?${newSearchString}`);
    } else {
      this.renderListByPath();
    }
  };

  _handleBulkOrOneRestore = async (event, id) => {
    await this._handleBulkOrOneRestoreOrDelete(event, id, false);
  };

  // 删除
  _handleBulkOrOneDelete = async (event, id) => {
    await this._handleBulkOrOneRestoreOrDelete(event, id, true);
  };

  _handleMove = (event, id) => {
    this.setState({ moveModalShow: true, selectedIds: [id] });
  };

  _handleBulkMoveClick = async () => {
    const { selectedIds } = this.state;
    if (!selectedIds || !selectedIds.length) {
      toastError('请选择要移动的文件或文件夹', TOAST_TIMEOUT);
      return;
    }

    this.setState({ moveModalShow: true });
  };

  _handleBulkMoveSubmit = async (event, targetFolderId) => {
    // TODO: 如果目标移动文件夹和当前文件夹id一致，则toast提示
    const { selectedIds } = this.state;
    const {
      match: {
        params: { roleId, folderId }
      }
    } = this.props;
    try {
      this.throwNoSelectedError();
    } catch (err) {
      return;
    }
    toastLoading('正在移动');
    let moveSuccess = false;
    try {
      await addChildrenToFolder(
        selectedIds,
        targetFolderId,
        roleId,
        folderId,
        this.state.noSelectIds.join(','),
        this.state.chooseAllFlag
      );
      toastSuccess('移动成功');
      moveSuccess = true;
    } catch (err) {
      toastError(err.message, TOAST_TIMEOUT);
    }
    if (moveSuccess) {
      this.setState({
        moveModalShow: false,
        selectedIds: [],
        noSelectIds: [],
        chooseAllFlag: false,
        chooseCurrentFlag: false
      });
      this.renderListByPath();
    } else {
      this.setState({
        moveModalShow: false
      });
    }
  };

  _handleBulkPublish = async () => {
    const {
      match: {
        params: { roleId, folderId }
      }
    } = this.props;
    const { selectedIds } = this.state;
    try {
      this.throwNoSelectedError();
      this.throwHasFolderError('批量发布仅支持发布文件');
    } catch (err) {
      return;
    }
    toastLoading('正在发布...');
    try {
      let result = await bulkPublishProjects(selectedIds, {
        chooseAll: this.state.chooseAllFlag,
        noSelectIds: this.state.noSelectIds.join(','),
        roleId,
        folderId
      });
      if (result.stat == -1) {
        toastError(result.message, TOAST_TIMEOUT);
        return;
      }
      toastSuccess('发布成功！', TOAST_TIMEOUT);
      this.setState({
        selectedIds: [],
        noSelectIds: [],
        chooseAllFlag: false,
        chooseCurrentFlag: false
      });
    } catch (err) {
      toastError(err.message, TOAST_TIMEOUT);
    }
  };
  _handProjectTypeChange = () => {
    this.renderListByPath();
  };

  _onOpenInNewTab = (event, projectOrFolder) => {
    this.setState({
      linkTarget: projectOrFolder
    });
  };

  _handleLinkModalOpen = (err) => {
    if (err) {
      return toastError(err.message);
    }
    toastSuccess('正在打开');
  };

  _handleLinkModalClose = () => {
    this.setState({ linkTarget: null });
  };

  _handleLinkModalCopyed = (err) => {
    if (err) {
      return toastError(err.message);
    }
    toastSuccess('复制成功');
  };

  _handlePreview = (event, id) => {
    this.setState({ previewTarget: id });
  };

  _handlePreviewClose = () => {
    this.setState({ previewTarget: null });
  };

  _handleTransfer = (event, id) => {
    this.setState({ showTransferModal: true, selectedIds: [id] });
  };
  // 转移事件
  _handleBulkTransfer = () => {
    const { selectedIds } = this.state;
    if (selectedIds.length === 0 && !this.state.chooseAllFlag) {
      return toastError('请选择要转移的文件', TOAST_TIMEOUT);
    }
    this.setState({ showTransferModal: true });
  };

  _handleTransferSubmit = async (event, targetUserId) => {
    const { selectedIds, list } = this.state;
    const {
      match: {
        params: { folderId, roleId }
      }
    } = this.props;

    if (
      !this.state.chooseAllFlag &&
      (!selectedIds || selectedIds.length === 0 || !list || list.length === 0)
    ) {
      return;
    }

    try {
      toastLoading('正在转移', TOAST_TIMEOUT);
      let res = await fetchJSON('/api/projects/transfer', {
        method: 'put',
        projectIds: selectedIds,
        newUserId: targetUserId,
        chooseAll: this.state.chooseAllFlag,
        noSelectIds: this.state.noSelectIds.join(','),
        roleId,
        folderId
      });
      if (!res.stat) {
        toastError(res.msg, 3000);
        return;
      }
      toastSuccess('转移成功', TOAST_TIMEOUT);

      this.setState({
        selectedIds: [],
        showTransferModal: false,
        chooseAllFlag: false,
        noSelectIds: [],
        chooseCurrentFlag: false
      });
      this.renderListByPath();
    } catch (err) {
      toastError(err.message, TOAST_TIMEOUT);
    }
  };

  _handleTransferCancel = () => {
    this.setState({
      showTransferModal: false,
      selectedIds: [],
      chooseAllFlag: false,
      noSelectIds: [],
      chooseCurrentFlag: false
    });
  };

  _handleCheckRevision = (event, id) => {
    location.href = `/log/${id}`;
  };

  _handleCopy = (event, id) => {
    this.setState({ selectedIds: [id], showCopyModal: true });
  };

  _handleCopyModalClose = () => {
    this.setState({
      selectedIds: [],
      showCopyModal: false,
      chooseAllFlag: false,
      noSelectIds: [],
      chooseCurrentFlag: false
    });
  };
  _handleData = async (event, id, themeId) => {
    // 通过接口从规则配置中拿数据
    let themeConfig = await getThemeDataConfig();
    if (themeId && themeConfig) {
      let theme = themeConfig.filter((item) => {
        return item.themeId == themeId;
      });
      if (theme && theme[0]?.themeIdRoute) {
        location.href = `/monster/dashboards/${theme[0].themeIdRoute}?ruleId=${id}`;
        return;
      }
    }
    location.href = `/monster/dashboard/project?ruleId=${id}`;
  };
  _handleCopySubmit = async (event, newName) => {
    const {
      match: {
        params: { roleId, folderId }
      }
    } = this.props;

    const { selectedIds } = this.state;
    if (!selectedIds || selectedIds.length !== 1) {
      return;
    }
    let parentId = null;
    if (folderId && /^(my|join)$/.test(roleId)) {
      parentId = folderId.split('/').splice(-1);
    }
    const params = QueryString.stringify({
      id: selectedIds[0],
      name: newName,
      roleId: roleId,
      parentId
    });

    try {
      let newProject = await copyProject(params);
      const { list } = this.state;
      const newList = [newProject, ...(list || [])];

      this.setState({
        list: newList.slice(0, PAGE_SIZE),
        showCopyModal: false,
        selectedIds: [],
        chooseAllFlag: false,
        noSelectIds: [],
        chooseCurrentFlag: false
      });
    } catch (error) {
      toastError(error.message, TOAST_TIMEOUT);
    }
  };

  throwHasFolderError = (text) => {
    const { selectedIds, list } = this.state;
    const hasFolder = (selectedIds || []).some((id) => {
      const target = (list || []).find(
        (projectOrFolder) => projectOrFolder._id === id
      );
      return target && target.isFolder;
    });
    if (hasFolder) {
      toastError(text, TOAST_TIMEOUT);
      throw Error(text);
    }
  };

  throwNoSelectedError = () => {
    const { selectedIds } = this.state;
    if (!selectedIds || selectedIds.length === 0) {
      toastError('未选择任何内容', TOAST_TIMEOUT);
      throw Error('未选择任何内容');
    }
  };

  checkedProjectComponentsVersion = () => {
    const {
      match: {
        params: { folderId, roleId }
      }
    } = this.props;
    const { selectedIds } = this.state;
    const paramsCheck = QueryString.stringify({
      type: 'check',
      id: selectedIds.join(','),
      chooseAll: this.state.chooseAllFlag,
      noSelectIds: this.state.noSelectIds.join(','),
      roleId,
      folderId
    });
    return fetchJSON(`/project/versionUpgrade?${paramsCheck}`, {
      method: 'get'
    });
  };
  // 升级
  _handleUpGrade = () => {
    try {
      this.throwNoSelectedError();
      this.throwHasFolderError('批量升级仅支持升级文件');
    } catch (err) {
      return;
    }

    this.checkedProjectComponentsVersion().then(async (data) => {
      if (data.stat == -1) {
        toastError(data.message, TOAST_TIMEOUT);
        return;
      }
      if (!Object.keys(data).length) {
        try {
          await confirm('没有组件需要升级', '无需升级');
        } catch (error) {
          /* 用户取消 */ return;
        }
        return;
      } else {
        let needUpgradeProjectList = {};
        let needUpgradeWidgetList = {};
        for (let id of Object.keys(data)) {
          let projectWidgets = data[id];
          for (let i = 0; i < projectWidgets.length; i++) {
            let widgetVersion = projectWidgets[i];
            if (widgetVersion.state) {
              needUpgradeProjectList[id] = 1;
              let projectList =
                (needUpgradeWidgetList[widgetVersion.type] &&
                  needUpgradeWidgetList[widgetVersion.type].project) ||
                [];
              projectList.splice(projectList.length, 0, {
                projectId: id,
                usedVersion: widgetVersion.versionId
              });
              needUpgradeWidgetList[widgetVersion.type] = {
                name: widgetVersion.name || widgetVersion.data.name,
                category: widgetVersion.category,
                historys: widgetVersion.historys,
                project: projectList
              };
            }
          }
        }
        let ids = Object.keys(needUpgradeProjectList);
        if (ids.length == 0) {
          return;
        }
        this.setState({
          needUpgradeWidgetList,
          affectedProjectList: {},
          checkedWidgets: [],
          showModal: true
        });
      }
    });
  };

  _handleChangeConfig = () => {
    const {
      match: {
        params: { folderId, roleId }
      }
    } = this.props;
    try {
      this.throwNoSelectedError();
      this.throwHasFolderError('批量修改配置仅支持修改文件');
    } catch (err) {
      return;
    }
    const { selectedIds } = this.state;
    getProjectsComponents(
      selectedIds.join(','),
      this.state.chooseAllFlag,
      this.state.noSelectIds.join(','),
      roleId,
      folderId
    ).then((data) => {
      if (data && data.errno != 0) {
        toastError(data.msg, TOAST_TIMEOUT);
        return;
      }
      this.setState({
        showWidgetConfigChangeModal: true,
        projectsComponents: data.data
      });
    });
  };
  _updateConfig = (targetComponent) => {
    const {
      match: {
        params: { folderId, roleId }
      }
    } = this.props;
    const { selectedIds } = this.state;
    const { type } = targetComponent;
    this.checkedProjectComponentsVersion().then(async (data) => {
      let versionNoSameFlags = [];
      Object.keys(data).forEach((projectId) => {
        versionNoSameFlags.push(
          data[projectId].find((widget) => {
            return widget.type === type;
          })
        );
      });
      const targetComponentVersionDiff = versionNoSameFlags.find(
        (item) => item
      );
      if (targetComponentVersionDiff) {
        try {
          await confirm('组件版本不一致，请先更新组件版本', '确认');
          return;
        } catch (error) {
          /* 用户取消 */ return;
        }
      } else {
        updateProjectsComponents(
          selectedIds.join(','),
          this.state.chooseAllFlag,
          this.state.noSelectIds.join(','),
          roleId,
          folderId,
          targetComponent
        ).then((res) => {
          if (res.stat == 1) {
            toastSuccess('配置修改成功，请重新发布');
          } else {
            toastError(res.msg);
          }
        });
      }
    });
  };

  closeModal = () => {
    this.setState({
      showModal: false
    });
  };

  onChangeWidgetChoose = (checkedValues) => {
    let { affectedProjectList, selectWidgets, needUpgradeWidgetList } =
      this.state;
    let checkedWidgets = this.state.checkedWidgets;
    let { value, checked } = checkedValues.target;
    if (checked) {
      let projectList = needUpgradeWidgetList[value].project;
      projectList.forEach((project) => {
        if (!affectedProjectList[project.projectId]) {
          affectedProjectList[project.projectId] = {};
        }
        if (!affectedProjectList[project.projectId][value]) {
          affectedProjectList[project.projectId][value] = {};
        }
        affectedProjectList[project.projectId][value]['usedVersion'] =
          project['usedVersion'];
        affectedProjectList[project.projectId][value]['name'] =
          needUpgradeWidgetList[value]['name'];
        affectedProjectList[project.projectId][value]['updateVersion'] =
          selectWidgets[value]
            ? selectWidgets[value]
            : needUpgradeWidgetList[value]['historys'][0];
      });
      checkedWidgets.push(value);
      this.setState({ checkedWidgets, affectedProjectList });
    } else {
      let newProjectList = {};
      for (let key in affectedProjectList) {
        let project = affectedProjectList[key];
        for (let widgetName in project) {
          if (widgetName != value) {
            newProjectList[key] = newProjectList[key]
              ? newProjectList[key]
              : {};
            newProjectList[key][widgetName] = project[widgetName];
          }
        }
      }
      checkedWidgets.splice(checkedWidgets.indexOf(value), 1);
      this.setState({ checkedWidgets, affectedProjectList: newProjectList });
    }
  };
  onChangeWidgetVersion = (widget, value) => {
    const { affectedProjectList, selectWidgets } = this.state;
    selectWidgets[widget.value] = value;
    for (let key in affectedProjectList) {
      let project = affectedProjectList[key];
      for (let widgetName in project) {
        if (widgetName == widget.value) {
          affectedProjectList[key][widgetName]['updateVersion'] = value;
        }
      }
    }
    this.setState({ affectedProjectList, selectWidgets });
  };

  onConfirm = async () => {
    const { affectedProjectList } = this.state;
    let ids = [];
    let updateWidgets = {};
    for (let key in affectedProjectList) {
      let project = affectedProjectList[key];
      ids.push(key);
      for (let widgetName in project) {
        if (
          project[widgetName]['updateVersion'] ==
          project[widgetName]['usedVersion']
        ) {
          await confirm('存在组件更新的版本和原始版本一致，无需更新');
          return;
        }
        updateWidgets[widgetName] = project[widgetName]['updateVersion'];
      }
    }
    const paramsUpgrade = QueryString.stringify({
      type: 'upgrade',
      id: ids.join(','),
      updateWidgets: JSON.stringify(updateWidgets)
    });
    fetchJSON(`/project/versionUpgrade?${paramsUpgrade}`, {
      methods: 'get'
    }).then((rs) => {
      if (rs.errno) {
        return;
      }
      ids.forEach((item) => {
        LocalStorage.removeItem(item);
      });
      toastSuccess('升级成功');
      setTimeout(() => {
        god.location.reload();
      }, 300);
    });
  };
  _handleShowTypeChange() {
    god.localStorage.setItem(
      'showTypeCard',
      this.state.showTypeCard ? 'table' : 'list'
    );
    this.setState({ showTypeCard: !this.state.showTypeCard });
  }
  _handShowRenameFolderDialog(event, folderId) {
    this.setState({
      renameFolder: !this.state.renameFolder,
      activeFolderId: folderId
    });
  }
  async _handRenameFolderSubmit(event, name) {
    try {
      await renameProject(this.state.activeFolderId, 'projects');
      toastSuccess('修改成功', TOAST_TIMEOUT);
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
    // 重命名后刷新列表
    const newlistToRender = this.state.list.map((item) => {
      if (item._id !== this.state.activeFolderId) {
        return item;
      }
      return { ...item, name };
    });
    this.setState({
      list: newlistToRender,
      activeFolderId: null,
      renameFolder: false
    });
  }
  render() {
    const {
      location,
      showTypeCard,
      _handleShowTypeChange,
      match: {
        params: { roleId }
      }
    } = this.props;
    const {
      list,
      createFolder,
      total,
      current,
      bulkMode,
      selectedIds,
      folderInfoMap,
      targetModalInfoId,
      moveModalShow,
      linkTarget,
      previewTarget,
      showTransferModal,
      showCopyModal,
      loading,
      error,
      needUpgradeWidgetList,
      showModal,
      checkedWidgets,
      affectedProjectList,
      projectOrigin,
      showProjectInfo,
      showWidgetConfigChangeModal,
      projectsComponents
    } = this.state;
    if (loading) {
      return <HELoading />;
    }
    if (error) {
      return <HELoadingFalse />;
    }
    const pathArray = location.pathname.split('/');
    pathArray.pop();
    const isBulkMode = bulkMode;
    const targetModalInfo = this._getTargetModalInfo(targetModalInfoId, list);
    const isFolderInfoActive = targetModalInfo && targetModalInfo.isFolder;
    const targetModalInfoCount =
      isFolderInfoActive && (folderInfoMap[targetModalInfoId] || {}).count;
    const previewTargetUrl = `${god.location.origin}/project/preview?id=${previewTarget}`;
    const listToRender = list || PROJECT_PLACEHOLDERS;
    const previewTargetInfo = this._getTargetModalInfo(previewTarget, list);
    const widgetList = [];
    const triggerList = [];
    Object.keys(needUpgradeWidgetList).forEach((type) => {
      const component = {
        label: needUpgradeWidgetList[type].name,
        value: type,
        historys: needUpgradeWidgetList[type].historys
      };
      if (needUpgradeWidgetList[type].category == 'widget') {
        widgetList.push(component);
      } else {
        triggerList.push(component);
      }
    });
    const breadcrumbData = this._getBreadcrumbData();
    return (
      <div className="project-list-page">
        <HEActionBar
          isBulkMode={isBulkMode}
          chooseAllFlag={this.state.chooseAllFlag}
          chooseCurrentFlag={this.state.chooseCurrentFlag}
          _handleCreateProject={this._handleCreateProject}
          _handleCreateFolder={this._handleCreateFolder}
          _handleChooseAll={this._handleChooseAll}
          _handleChooseCurrentPage={this._handleChooseCurrentPage}
          _handleToggleBulkMode={this._handleToggleBulkMode}
          _handleBulkOrOneDelete={this._handleBulkOrOneDelete}
          _handleBulkOrOneRestore={this._handleBulkOrOneRestore}
          _handleBulkMoveClick={this._handleBulkMoveClick}
          _handleBulkTransfer={this._handleBulkTransfer}
          _handleChangeConfig={this._handleChangeConfig}
          _handleUpGrade={this._handleUpGrade}
          _handleBulkPublish={this._handleBulkPublish}
          _handProjectTypeChange={this._handProjectTypeChange}
          _handleSearch={this._handleSearch}
          showTypeCard={showTypeCard}
          onShowType={_handleShowTypeChange}
          {...this.props}
        />
        <div className="project-list-page__breadcrumb__content">
          {breadcrumbData.length > 1 ? (
            <HEBreadcrumb
              sign=">"
              list={breadcrumbData}
              onClick={this._handleBreadcrumbClick}
            />
          ) : null}
        </div>
        {!loading && showTypeCard && (
          <div className="project-list-page__main">
            {!list ? (
              <HELoading />
            ) : listToRender.length === 0 ? (
              <div className="project-list-page__main__empty-state">
                <img
                  className="project-list-page__main__empty-state__img"
                  src={noFile}
                />
                {
                  // 判断是正常项目还是规则配置
                  <React.Fragment>
                    {!/(join|all)/.test(roleId) ? (
                      <>
                        <div className="project-list-page__main__empty-state__text">
                          {'您还没有创建任何项目哦'}
                        </div>
                        <HEButton
                          onClick={this._handleCreateProject.bind(this)}
                        >
                          {'立即新建'}
                        </HEButton>
                      </>
                    ) : (
                      <div className="project-list-page__main__empty-state__text">
                        {' '}
                        {'您还没有被邀请的项目哦'}
                      </div>
                    )}
                  </React.Fragment>
                }
              </div>
            ) : (
              listToRender.map((projectOrFolder, index) => {
                const {
                  _id: id,
                  name,
                  lastModified,
                  isFolder,
                  config = {},
                  abConfig,
                  origin,
                  status,
                  partner,
                  ownerId,
                  ruleWidget,
                  lastPublished,
                  revisionData,
                  themeId
                } = projectOrFolder;
                if (!id) {
                  return (
                    <ProjectCard
                      themeId={themeId}
                      key={index}
                      className="project-list-page__main__card-container"
                      loading={true}
                    />
                  );
                }
                const folderPageList =
                  folderInfoMap[id] &&
                  folderInfoMap[id].list &&
                  folderInfoMap[id].list.map((folder) => [folder.poster]);
                return (
                  <HESelectable
                    key={id}
                    className="project-list-page__main__card-container"
                    selectable={isBulkMode}
                    // selectedIds 如果多了可能会有效能问题，届时可以吧 selectedIds 换成 Map
                    selected={
                      selectedIds &&
                      isBulkMode &&
                      selectedIds.indexOf(id) !== -1
                    }
                    onToggleSelect={(event) => {
                      this._handleToggleSelect(event, id);
                    }}
                  >
                    <ProjectCard
                      ruleWidget={ruleWidget}
                      title={name}
                      id={id}
                      ownerId={ownerId}
                      abConfig={abConfig}
                      projectOrigin={origin}
                      projectStatus={status}
                      lastModified={lastModified}
                      lastPublished={lastPublished}
                      themeId={themeId}
                      isFolder={Boolean(isFolder)}
                      partners={partner}
                      hasFormStatistic={Boolean(config && config.hasFormWidget)}
                      revisionDataOrList={
                        isFolder ? folderPageList : [projectOrFolder.poster]
                      }
                      loading={false}
                      showTool={true}
                      onShowInfo={(event) =>
                        this._handleCardShowInfo(event, id)
                      }
                      onOpen={(event) =>
                        validateRoleLimit('lookProject') &&
                        this._handleCardOpen(event, id)
                      }
                      onRestore={(event) =>
                        this._handleBulkOrOneRestore(event, [id])
                      }
                      onCheck={(event) => this._handleCardOpen(event, id)}
                      onDelete={(event) =>
                        this._handleBulkOrOneDelete(event, [id])
                      }
                      onMove={(event) => this._handleMove(event, id)}
                      onOpenInNewTab={(event) =>
                        this._onOpenInNewTab(event, projectOrFolder)
                      }
                      onCopy={(event) => this._handleCopy(event, id)}
                      onData={(event) =>
                        this._handleData(
                          event,
                          id,
                          themeId || revisionData?.themeId
                        )
                      }
                      onPreview={(event) => this._handlePreview(event, id)}
                      onTransfer={(event) => this._handleTransfer(event, id)}
                      onCollaborate={(event) =>
                        this.props.collaborate(event, id)
                      }
                      onCheckRevisions={(event) =>
                        this._handleCheckRevision(event, id)
                      }
                    />
                  </HESelectable>
                );
              })
            )}
          </div>
        )}
        {!showTypeCard && (
          <div className="project-list-page__main project-list-page__main__table">
            <ProjectTable
              listToRender={listToRender}
              selectedIds={selectedIds}
              onSelect={(event, id) => this._handleToggleSelect(event, id)}
              isBulkMode={isBulkMode}
              onShowInfo={(event, id) => this._handleCardShowInfo(event, id)}
              onOpen={(event, id) =>
                validateRoleLimit('lookProject') &&
                this._handleCardOpen(event, id)
              }
              onRestore={(event, id) =>
                this._handleBulkOrOneRestore(event, [id])
              }
              onCheck={(event, id) => this._handleCardOpen(event, id)}
              onDelete={(event, id) => this._handleBulkOrOneDelete(event, [id])}
              onRename={(event, id) =>
                this._handShowRenameFolderDialog(event, id)
              }
              onMove={(event, id) => this._handleMove(event, id)}
              onOpenInNewTab={(event, id) => this._onOpenInNewTab(event, id)}
              onCopy={(event, id) => this._handleCopy(event, id)}
              onData={(event, id, themeId) =>
                this._handleData(event, id, themeId)
              }
              onPreview={(event, id) => this._handlePreview(event, id)}
              onCollaborate={(event, id) => this.props.collaborate(event, id)}
              onTransfer={(event, id) => this._handleTransfer(event, id)}
              onCheckRevisions={(event, id) =>
                this._handleCheckRevision(event, id)
              }
            />
          </div>
        )}
        {typeof total === 'number' &&
          typeof current === 'number' &&
          total > 1 && (
            <HEPagination
              className="project-list-page__pagination"
              style={styles.pagination}
              current={current}
              total={Math.ceil(total)}
              onPageChange={this._handlePageChange}
            />
          )}
        {createFolder && (
          <CreateFolderModal
            onClose={this._handleModalClose}
            onSubmit={this._handleCreateFolderSubmit}
          />
        )}
        {this.state.renameFolder && (
          <CreateFolderModal
            onClose={this._handShowRenameFolderDialog.bind(this)}
            onSubmit={this._handRenameFolderSubmit.bind(this)}
            title={'重命名文件夹'}
          ></CreateFolderModal>
        )}
        {showProjectInfo && targetModalInfo && !isFolderInfoActive && (
          <ProjectInfoModal
            _id={targetModalInfo._id}
            name={targetModalInfo.name}
            lastModified={targetModalInfo.lastModified}
            lastPublished={targetModalInfo.lastPublished}
            createdAt={targetModalInfo.createdAt}
            owner={targetModalInfo.ownerId}
            themeId={targetModalInfo.themeId}
            ruleWidget={targetModalInfo.ruleWidget}
            onOpenInNewTab={this._handleLinkModalOpen}
            componentPlat={
              targetModalInfo.revisionData
                ? targetModalInfo.revisionData.componentPlat
                : 'h5'
            }
            targetModalInfo={targetModalInfo}
            onClose={this._handleModalClose}
            onSubmit={this._handleInfoModalSubmit}
          />
        )}
        {showProjectInfo && targetModalInfo && isFolderInfoActive && (
          <ProjectFolderInfoModal
            _id={targetModalInfo._id}
            name={targetModalInfo.name}
            lastModified={targetModalInfo.lastModified}
            createdAt={targetModalInfo.createdAt}
            fileCount={targetModalInfoCount}
            owner={targetModalInfo.ownerId}
            remoteUrl={targetModalInfo.remoteUrl}
            onClose={this._handleModalClose}
            onSubmit={this._handleInfoModalSubmit}
          />
        )}
        {moveModalShow && (
          <ProjectsBulkMoveModal
            onSubmit={this._handleBulkMoveSubmit}
            onClose={this._handleModalClose}
          />
        )}
        {linkTarget && (
          <LinkModal
            componentPlat={linkTarget.revisionData.componentPlat}
            projectId={linkTarget._id}
            origin={linkTarget.origin}
            remoteUrl={linkTarget.remoteUrl}
            onClose={this._handleLinkModalClose}
            onOpenInNewTab={this._handleLinkModalOpen}
          />
        )}
        {previewTarget && (
          <ProjectPreviewModal
            id={previewTargetInfo._id}
            origin={projectOrigin}
            url={previewTargetUrl}
            remoteUrl={previewTargetInfo.remoteUrl}
            project={previewTargetInfo}
            onClose={this._handlePreviewClose}
          />
        )}

        {showTransferModal && (
          <SimpleInputModal
            title={'转移项目'}
            labelText={'目标用户 ID'}
            placeholder={'范例： haoweilai'}
            onClose={this._handleTransferCancel}
            onSubmit={this._handleTransferSubmit}
          />
        )}
        {showCopyModal && (
          <SimpleInputModal
            title={'复制项目'}
            labelText={'新项目名称'}
            placeholder={'范例： 新项目'}
            onClose={this._handleCopyModalClose}
            onSubmit={this._handleCopySubmit}
          />
        )}
        {showModal && (
          <ShowConfirm
            onCancel={this.closeModal}
            onConfirm={this.onConfirm}
            title={`${
              Object.keys(Object.keys(needUpgradeWidgetList)).length
            }个项目需要升级组件`}
          >
            <div className="project-upGrate-modal">
              <p style={{ textAlign: 'left' }}>选中项目中可升级的组件如下：</p>
              <CheckboxGroup>
                {widgetList.length > 0 && (
                  <Row>
                    <div className="project-upGrate-modal__title">UI组件</div>
                  </Row>
                )}
                <Row>
                  {widgetList.map((item) => (
                    <Col
                      span={12}
                      key={'need_update_widget_' + item.type}
                      style={{
                        marginBottom: '10px',
                        height: '32px',
                        lineHeight: '32px'
                      }}
                    >
                      <Checkbox
                        value={item.value}
                        onChange={this.onChangeWidgetChoose}
                      >
                        {item.label}
                      </Checkbox>
                      {item.historys.length && (
                        <div className="history-select-box">
                          <Select
                            defaultValue={item.historys[0]}
                            onChange={this.onChangeWidgetVersion.bind(
                              this,
                              item
                            )}
                          >
                            {item.historys.map((history, index) => (
                              <Select.Option
                                value={history}
                                key={'history_' + index}
                              >
                                {history}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      )}
                    </Col>
                  ))}
                </Row>
                {triggerList.length > 0 && (
                  <Row>
                    <div className="project-upGrate-modal__title">行为组件</div>
                  </Row>
                )}
                <Row>
                  {triggerList.map((item) => (
                    <Col
                      span={12}
                      key={'need_update_widget_' + item.type}
                      style={{
                        marginBottom: '10px',
                        height: '32px',
                        lineHeight: '32px'
                      }}
                    >
                      <Checkbox
                        value={item.value}
                        onChange={this.onChangeWidgetChoose}
                      >
                        {item.label}
                      </Checkbox>
                      {item.historys.length && (
                        <div className="history-select-box">
                          <Select
                            defaultValue={item.historys[0]}
                            onChange={this.onChangeWidgetVersion.bind(
                              this,
                              item
                            )}
                          >
                            {item.historys.map((history, index) => (
                              <Select.Option
                                value={history}
                                key={'history_' + index}
                              >
                                {history}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      )}
                    </Col>
                  ))}
                </Row>
              </CheckboxGroup>
              {checkedWidgets.length > 0 && (
                <div style={{ textAlign: 'left' }}>
                  <h3>影响项目列表：</h3>
                  {Object.keys(affectedProjectList).map((pid) => {
                    return (
                      <div key={pid} style={{ margin: '10px 0 10px 0' }}>
                        <span>{pid}项目：</span>
                        {Object.keys(affectedProjectList[pid]).map(
                          (widget, index) => {
                            return (
                              <span
                                key={pid + '_' + index}
                                style={{ marginRight: '8px' }}
                              >{`${affectedProjectList[pid][widget].name}(${affectedProjectList[pid][widget].usedVersion} -> ${affectedProjectList[pid][widget].updateVersion})`}</span>
                            );
                          }
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </ShowConfirm>
        )}
        {showWidgetConfigChangeModal && (
          <WidgetConfigChangeModal
            projectsComponents={projectsComponents}
            closeWidgetConfigChangeModal={this.closeWidgetConfigChangeModal.bind(
              this
            )}
            updateConfig={this._updateConfig.bind(this)}
          />
        )}
      </div>
    );
  }
}

export default withRouter(ProjectList);
