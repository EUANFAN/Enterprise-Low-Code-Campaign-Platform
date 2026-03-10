import 'globals';
import React from 'react';
import { withRouter } from 'react-router-dom';
import keyBy from 'lodash/keyBy';
import { connectModal, connectToast, connectConfirm } from 'context/feedback';
import confirm from 'components/HEConfirm/confirm';
import BulkMoveModal from '../../components/BulkMoveModal';
import BulkOperationButton from 'components/BulkOperationButton';
import CreateFolderModal from '../../components/CreateFolderModal';
import ResourcesInfoModal from '../../components/ResourcesInfoModal';
import ResourcesGroupModal from '../../components/ResourcesGroupModal';
import { toastSuccess, toastError, toastLoading } from 'components/HEToast';
import Move from 'components/icons/Move';
import {
  getResourcesByType,
  getMyResourcesByType,
  createNewFolder,
  deleteResourceFolders,
  deleteResources,
  downLoadResources,
  downLoadResourceFolders,
  updateFileGroup,
  updateFile,
  searchResources,
} from 'apis/ResourceAPI';
import QueryStringUtil from 'common/queryString';
import HEButton, { HEButtonSizes } from 'components/HEButton';
import HESearchInput from 'components/HESearchInput';
import HEPagination from 'components/HEPagination';
import HETooltip from 'components/HETooltip';
import HESelectable from 'components/HESelectable';
import HEBreadcrumb from 'components/HEBreadcrumb';
import HELoading from 'components/HELoading';
import HELoadingFalse from 'components/HELoading/loadingFalse';
import Trashcan from 'components/icons/Trashcan';
import DownLoad from 'components/icons/DownLoad';
import { addChildrenToGroupsList } from 'apis/ResourceAPI';
import DownloadUtils from 'utils/DownloadUtils';
import { BaseCard } from 'components/HEFilePicker/ResourceCard';
import DownLoadModal from '../components/DownLoadModal';
import './index.less';

const TOAST_TIMEOUT = 3000;
const PAGE_SIZE = 10;

const RESOURCE_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio',
  IMAGE: 'image',
  FILE: 'file',
};
const RESOURCE_TYPE_NAME_LOOKUP = {
  video: '视频',
  audio: '音频',
  image: '图片',
  file: '文档',
};

const UPLOAD_ACCEPT_LOOKUP = {
  [RESOURCE_TYPES.VIDEO]: [
    // 'audio/mpeg',
    'video/mp4',
    'video/mpeg',
  ].join(', '),
  [RESOURCE_TYPES.FILE]: [
    '.doc',
    '.docx',
    '.pdf',
    '.xls',
    '.xlsx',
    '.txt',
    '.json',
    '.csv'
  ].join(', '),
  [RESOURCE_TYPES.AUDIO]: ['audio/mp3', 'audio/wav'].join(', '),
  [RESOURCE_TYPES.IMAGE]: [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/svg+xml',
    'image/gif',
    'image/bmp',
  ].join(', '),
};

const Action = ({ children, ...others }) => (
  <HEButton
    className="h5-resources-images__actions__action"
    sizeType={HEButtonSizes.NORMAL}
    secondary={true}
    {...others}
  >
    {children}
  </HEButton>
);

const LOADING_LIST = new Array(10).fill();
const EMPTY_UPLOAD_VALUE = '';

class ResourceList extends React.Component {
  state = {
    editMode: false,
    list: LOADING_LIST,
    total: null,
    groupName: null,
    groupId: null,
    breadcrumbList: [],
    createFolder: false,
    openDownModal: false,
    selectedIds: null,
    infoTargetId: null,
    showInfoModal: false,
    previewTargetId: null,
    resourceMap: {},
    folderInfoMap: null,
    modalBulkMoveShow: false,
    searchFiles: false,
    keyword: '',
    loading: true,
    error: false,
  };

  componentDidMount() {
    this._fetchCurrentPage();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    const { location: prevLocation } = prevProps;
    const { page, search } = QueryStringUtil.parse(location.search);
    const { page: prevPage, search: prevSearch } = QueryStringUtil.parse(
      prevLocation.search
    );

    if (page !== prevPage || search !== prevSearch) {
      this._fetchCurrentPage();
    }
  }

  _fetchCurrentPage = async () => {
    const {
      match: {
        params: { 0: isMyResourcePage, 1: type, groupId },
      },
      location: { search },
    } = this.props;
    const { search: keyword, page: current } = QueryStringUtil.parse(search);
    try {
      let result = await (keyword
        ? searchResources(keyword, type, groupId, current)
        : isMyResourcePage
        ? getMyResourcesByType(type, current) // eslint-disable-line indent
        : getResourcesByType(type, current, groupId)); // eslint-disable-line indent
      const { resources, total, breadcrumbList, folderInfoMap } = result;
      this.setState((prevState) => ({
        list: resources.map((resource) => resource._id),
        resourceMap: {
          ...prevState.resourceMap,
          ...keyBy(resources, (item) => item._id),
        },
        total,
        groupId,
        breadcrumbList,
        folderInfoMap: {
          ...prevState.folderInfoMap,
          ...folderInfoMap,
        },
        loading: false,
      }));
    } catch (e) {
      this.setState({ error: true });
    }
  };

  _getFolderIdsAndResourceIds = () => {
    const { selectedIds, resourceMap } = this.state;
    if (!selectedIds) {
      return;
    }
    let folderIds, resourceIds;

    for (let i = 0; i < selectedIds.length; i++) {
      const currentId = selectedIds[i];
      const currentTarget = resourceMap[currentId];

      if (currentTarget.isFolder) {
        if (!folderIds) {
          folderIds = [];
        }
        folderIds.push(currentId);
      } else if (
        currentTarget.type === RESOURCE_TYPES.IMAGE ||
        currentTarget.type === RESOURCE_TYPES.AUDIO ||
        currentTarget.type === RESOURCE_TYPES.VIDEO
      ) {
        if (!resourceIds) {
          resourceIds = [];
        }
        resourceIds.push(currentId);
      }
    }
    return { folderIds, resourceIds };
  };

  _goToPage = (pageNumber) => {
    const {
      location: { search, pathname },
      history,
    } = this.props;
    const { page, ...others } = QueryStringUtil.parse(search); // eslint-disable-line no-unused-vars
    history.push(
      `${pathname}?${QueryStringUtil.stringify({
        ...others,
        page: pageNumber,
      })}`
    );
  };

  _handlePageChange = (event, pageNumber) => {
    if (pageNumber === this.state.current) {
      return;
    }
    this._goToPage(pageNumber);
  };

  _handleToggleBulkMode = () => {
    this.setState((prevState) => ({
      selectedIds: prevState.selectedIds ? null : [],
    }));
  };

  _handleShowInfo = (event, id) => {
    this.setState({
      showInfoModal: true,
      infoTargetId: id,
    });
  };

  _handleModalClose = () => {
    this.setState({
      infoTargetId: null,
      showInfoModal: false,
      previewTargetId: null,
      createFolder: false,
      openDownModal: false,
      modalBulkMoveShow: false,
    });
  };

  _handleModalSubmit = async (e, name) => {
    const { infoTargetId, resourceMap } = this.state;
    const targetModalInfo = infoTargetId && resourceMap[infoTargetId];
    if (!infoTargetId || !targetModalInfo) return;

    let updateFunction = targetModalInfo.isFolder
      ? updateFileGroup
      : updateFile;

    toastLoading('正在保存');
    try {
      await updateFunction(targetModalInfo._id, { name });
      toastSuccess('保存成功', TOAST_TIMEOUT);
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }

    const newResource = {
      ...this.state.resourceMap[infoTargetId],
      name,
    };

    this.setState({
      infoTargetId: null,
      resourceMap: {
        ...resourceMap,
        [infoTargetId]: newResource,
      },
    });
  };
  _handleMoveOne = (event, id) => {
    this.setState({
      modalBulkMoveShow: true,
      showInfoModal: false,
      infoTargetId: id,
    });
  };
  // 我的资源移动
  _handleBulkMoveClick = async () => {
    const { selectedIds } = this.state;
    if (!selectedIds || !selectedIds.length) {
      return;
    }
    this.setState({
      modalBulkMoveShow: true,
    });
  };
  _handleBulkMoveSubmit = async (event, groupId = 'my', treeData = []) => {
    const { selectedIds, list, infoTargetId } = this.state;
    // console.log('sele move ', selectedIds, infoTargetId, groupId)
    let {
      match: {
        params: { groupId: paramsGroupId },
      },
    } = this.props;
    paramsGroupId = paramsGroupId ? paramsGroupId : 'my';
    // 批量和单个移动
    const targetSelectedIds = selectedIds ? selectedIds : [infoTargetId];
    if (targetSelectedIds.includes(groupId) || paramsGroupId === groupId) {
      return toastError('不能移动到当前文件夹。请重新选择！', TOAST_TIMEOUT);
    }
    const childrenIds = this._getRecursiveChildren(
      treeData,
      targetSelectedIds
    ).map((v) => v.id);
    if (childrenIds.includes(groupId)) {
      return toastError('不能移动到该文件子目录。请重新选择！', TOAST_TIMEOUT);
    }
    toastLoading('正在移动');
    try {
      await addChildrenToGroupsList(groupId, targetSelectedIds);
    } catch (err) {
      toastError(err.message, TOAST_TIMEOUT);
    }
    toastSuccess('移动成功');

    const objectToState = {
      selectedIds: null,
      infoTargetId: null,
      modalBulkMoveShow: false,
    };

    objectToState.list = list.filter((id) => !targetSelectedIds.includes(id));

    this.setState(objectToState);
  };

  _getRecursiveChildren = (tree, groups) => {
    // console.log('validate', tree, groups)
    let children = [];
    let parentIds = groups;
    while (parentIds[0]) {
      let targetGroup = tree.filter((v) => parentIds.includes(v.pId));
      children = children.concat(targetGroup);
      parentIds = targetGroup.map((v) => v.id);
    }
    // console.log('comput', children);
    return children;
  };

  _handleDeleteOne = (event, id) => {
    const { resourceMap } = this.state;
    const isFolder = resourceMap[id].isFolder;
    if (isFolder) {
      this._handleResourceDelete(event, null, [id]);
    } else {
      this._handleResourceDelete(event, [id], null);
    }
  };

  _handleBulkDelete = (event) => {
    let { folderIds, resourceIds } = this._getFolderIdsAndResourceIds();

    if (!folderIds && !resourceIds) {
      return toastError('请选择要删除的选项', TOAST_TIMEOUT);
    }

    this._handleResourceDelete(event, resourceIds, folderIds);
  };

  _handleResourceDelete = async (event, resourceIds, folderIds) => {
    try {
      await confirm('删除后将无法找回，确定删除？', '确认删除');
    } catch (err) {
      /* 用户取消 */ return;
    }

    toastLoading('正在删除');
    try {
      const promises = [
        resourceIds && deleteResources(resourceIds),
        folderIds && deleteResourceFolders(folderIds),
      ];

      await Promise.all(promises);
      toastSuccess('删除成功', TOAST_TIMEOUT);
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }

    const deleteResourceNumber = resourceIds ? resourceIds.length : 0;
    const deleteFolderIdsNumber = folderIds ? folderIds.length : 0;
    const deleteNumber = deleteResourceNumber + deleteFolderIdsNumber;
    const currentListLength = this.state.list.length;

    const {
      history,
      location: { pathname, search },
    } = this.props;
    const { total } = this.state;
    const { page: current } = QueryStringUtil.parse(search);

    if (deleteNumber === currentListLength && current == total) {
      const newSearchObject = QueryStringUtil.parse(search);
      newSearchObject.page = Number(current) - 1;
      let newSearchString = QueryStringUtil.stringify(newSearchObject);
      history.push(`${pathname}?${newSearchString}`);
    } else {
      this._fetchCurrentPage();
    }
  };

  _handleBulkDownLoad = async (event) => {
    let { folderIds, resourceIds } = this._getFolderIdsAndResourceIds();
    if (!folderIds && !resourceIds) {
      return toastError('请选择要下载的选项', TOAST_TIMEOUT);
    }
    this._handleResourceDownLoad(event, resourceIds, folderIds);
  };

  _handleResourceDownLoad = async (event, resourceIds = [], folderIds = []) => {
    try {
      toastLoading('正在下载');
      const [loadFiles, loadFolders] = await Promise.all([
        resourceIds[0] && downLoadResources(resourceIds),
        folderIds[0] && downLoadResourceFolders(folderIds),
      ]);
      const downloadPromises = [
        ...(loadFiles || []),
        ...(loadFolders || []),
      ].map((info) => DownloadUtils.downloadLink(info.url, info.name));

      await Promise.all(downloadPromises);
      toastSuccess('下载成功', TOAST_TIMEOUT);
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
  };

  _handleCheck = (event, id) => {
    const { resourceMap } = this.state;
    const target = resourceMap[id];
    if (!target) {
      return;
    }

    this.setState({ previewTargetId: id });
  };

  _handleOpen = (event, file, isFolder) => {
    const {
      history,
      match: {
        params: { 1: type },
      },
    } = this.props;

    if (isFolder) {
      return history.push(`/resources/${type}/${file._id}`);
    } else {
      if (file.type != 'file') {
        god.open(file.url);
      }
    }
  };

  _handleToggleSelect = (event, itemId) => {
    this.setState((prevState) => {
      const { selectedIds: prevIds } = prevState;
      if (!prevIds) return null;

      return {
        selectedIds:
          prevIds.indexOf(itemId) === -1
            ? [...prevIds, itemId]
            : prevIds.filter((id) => id !== itemId),
      };
    });
  };

  _afterUploadRefresh = async (files) => {
    const {
      match: {
        params: { 0: isMyResourcePage, 1: type, groupId },
      },
      location: { search },
    } = this.props;
    this.setState((prevState) => {
      const filesToAdd = files.filter((file) => file.type === type);
      if (filesToAdd.length === 0) {
        return null;
      }
      return {
        list: [...filesToAdd.map((file) => file._id), ...prevState.list].slice(
          0,
          PAGE_SIZE
        ),
        resourceMap: {
          ...keyBy(filesToAdd, (item) => item._id),
          ...prevState.resourceMap,
        },
      };
    });
    const { page: current } = QueryStringUtil.parse(search);
    try {
      let result = await (isMyResourcePage
        ? getMyResourcesByType(type, current)
        : getResourcesByType(type, current, groupId));
      if (result && result.total) {
        this.setState({
          total: result.total,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  _handleBreadcrumbClick = (e, index, item) => {
    const { history } = this.props;
    const { type, _id, isMy } = item;
    history.push(`/resources/${isMy ? 'my/' : ''}${type}/${_id}`);
  };
  _getBreadcrumbList() {
    const {
      match: {
        params: {
          // '0': isMyResourcePage,
          1: type,
          groupId,
        },
      },
    } = this.props;
    let { groupName } = this.state;
    const list = [
      { name: `我的${RESOURCE_TYPE_NAME_LOOKUP[type]}`, type, isMy: true },
    ];
    if (groupId && groupName) {
      list.push({ name: groupName, groupId, type });
    }
    return list;
  }

  _handleCreateFolder = async () => {
    this.setState({ createFolder: true });
  };

  showDownLoadModal = async () => {
    this.setState({ openDownModal: true });
  };

  _handleCreateFolderSubmit = async (event, folderName) => {
    const {
      match: {
        params: { groupId, 1: folderType },
      },
    } = this.props;
    if (!folderName) {
      toastError('输入框不为空!', TOAST_TIMEOUT);
      return;
    }
    toastLoading('正在保存');
    const currentGroupId = groupId || 'official';
    try {
      const { resource } = await createNewFolder(
        folderName,
        folderType,
        currentGroupId
      );
      let newItem = {
        ...resource,
        creator: resource.creator,
        lastModified: resource.lastModified,
      };

      this.setState((prevState) => {
        let resourceMap = { [resource._id]: newItem, ...prevState.resourceMap };
        return {
          list: [resource._id, ...prevState.list].splice(0, 10),
          resourceMap,
        };
      });
      toastSuccess('保存成功', TOAST_TIMEOUT);
    } catch (e) {
      toastError('保存失败', TOAST_TIMEOUT);
    }

    this._createFolderModalClose();
  };

  _createFolderModalClose = () => {
    this.setState({ createFolder: false });
  };
  DownLoadModalClose = () => {
    this.setState({ openDownModal: false });
  };
  // 搜索内容是所有  我的  资源/文件夹（并不是文件夹下）
  _handleSearch = async (event) => {
    const value = event.target.value;
    const keyword = value.trim();
    const {
      location: { search, pathname },
      history,
    } = this.props;
    const { page: oldPage = 1, search: oldKeyword } =
      QueryStringUtil.parse(search);

    const shouldBackToPageOne =
      (oldKeyword && !keyword) || (!oldKeyword && keyword);
    const newQueries = {
      page: shouldBackToPageOne ? 1 : oldPage,
      search: keyword,
    };

    history.push(`${pathname}?${QueryStringUtil.stringify(newQueries)}`);
  };

  render() {
    const {
      match: {
        params: { 1: type, groupId: paramsGroupId },
      },
      location: { search },
    } = this.props;
    const {
      list,
      total,
      selectedIds,
      breadcrumbList,
      createFolder,
      openDownModal,
      groupId,
      infoTargetId,
      showInfoModal,
      folderInfoMap,
      resourceMap,
      modalBulkMoveShow,
      loading,
      error,
    } = this.state;

    if (loading) {
      return <HELoading />;
    }
    if (error) {
      return <HELoadingFalse />;
    }

    const { search: keyword, page: currentString } =
      QueryStringUtil.parse(search);
    const current = parseInt(currentString, 10) || 1;

    const targetModalInfo = infoTargetId && resourceMap[infoTargetId];
    const isBulkMode = Boolean(selectedIds);
    // const breadcrumbList = this._getBreadcrumbList();
    const isFolderInfoActive = targetModalInfo && targetModalInfo.isFolder;

    // Aggregation 如果文件夹没有图片则不会回传数据，这里我们主动帮忙设为空数组
    const targetModalInfoCount =
      (isFolderInfoActive &&
        folderInfoMap[infoTargetId] &&
        folderInfoMap[infoTargetId].count) ||
      0;
    return (
      <div className="h5-resources-images">
        <div className="h5-resources-images__actions">
          <div className="h5-resources-images__actions__left">
            <HEButton
              className="h5-resources-images__actions__action"
              onClick={this.showDownLoadModal}
            >
              {'上传资源'}
            </HEButton>
            <Action onClick={this._handleCreateFolder}>{'新建文件夹'}</Action>
            <BulkOperationButton
              className="h5-resources-images__actions__action"
              outline={true}
              secondary={true}
              active={isBulkMode}
              onToggle={this._handleToggleBulkMode}
            >
              {/* 在 我的 资源列表中，或者用户是admin */}
              {/* {(isMyResourcePage || checkedAdmin) && */}
              <HETooltip text={'删除'}>
                <Trashcan
                  onClick={this._handleBulkDelete}
                  className="h5-resources-images__actions__action__secondary-action"
                />
              </HETooltip>
              {/* } */}
              {/* {checkedAdmin && */}
              <HETooltip text={'移动'}>
                <Move
                  onClick={this._handleBulkMoveClick}
                  className="h5-resources-images__actions__action__secondary-action"
                />
              </HETooltip>
              {/* } */}
              <HETooltip text={'下载'}>
                <DownLoad
                  onClick={this._handleBulkDownLoad}
                  className="h5-resources-images__actions__action__secondary-action"
                />
              </HETooltip>
            </BulkOperationButton>
          </div>
          <div className="h5-resources-images__actions__right">
            <HESearchInput
              key={search}
              placeholder={'搜索标题/名称/类型'}
              onSearch={this._handleSearch}
              defaultValue={keyword}
            />
          </div>
        </div>
        {groupId && (
          <div className="h5-resources-images__actions__breadcrumb">
            <HEBreadcrumb
              loading={!breadcrumbList}
              list={breadcrumbList}
              onClick={this._handleBreadcrumbClick}
            />
          </div>
        )}
        <div className="h5-resources-images__cards">
          {list.length ? (
            list.map((itemId, index) => {
              if (
                !itemId ||
                (typeof itemId === 'string' && !resourceMap[itemId])
              ) {
                return (
                  <BaseCard
                    className="h5-resources-images__cards__card"
                    loading={true}
                    key={index}
                  />
                );
              }
              const item = resourceMap[itemId];
              const id = item._id;
              const isFolder = item.isFolder || false;
              const urlOrList =
                isFolder && folderInfoMap[itemId]
                  ? folderInfoMap[itemId].list
                  : item.url;
              return (
                <HESelectable
                  key={id}
                  className="h5-resources-images__cards__card"
                  selectable={isBulkMode}
                  // selectedIds 如果多了可能会有效能问题，届时可以吧 selectedIds 换成 Map
                  selected={
                    selectedIds ? selectedIds.indexOf(id) !== -1 : false
                  }
                  onToggleSelect={(event) => {
                    this._handleToggleSelect(event, id);
                  }}
                >
                  <BaseCard
                    title={item.name}
                    creator={item.creator}
                    url={item.url}
                    onShowInfo={(event) => {
                      this._handleShowInfo(event, id);
                    }}
                    onMove={(event) => {
                      this._handleMoveOne(event, id);
                    }}
                    onDelete={(event) => {
                      this._handleDeleteOne(event, id);
                    }}
                    onCheck={(event) => {
                      this._handleCheck(event, id);
                    }}
                    onToggleSelect={(event) => {
                      this._handleOpen(event, item, isFolder);
                    }}
                    lastModified={item.lastModified}
                    urlOrList={urlOrList}
                    type={type}
                    isFolder={isFolder}
                    onOpen={(event) => {
                      this._handleOpen(event, item, isFolder);
                    }}
                  />
                </HESelectable>
              );
            })
          ) : (
            <div className="no-resource">{'当前类别下暂无资源'}</div>
          )}
        </div>
        {current != null && total != null && total > 1 && (
          <HEPagination
            className="h5-resources-images__pagination"
            total={total}
            current={current}
            onPageChange={this._handlePageChange}
          />
        )}
        {openDownModal && (
          <DownLoadModal
            onClose={this._handleModalClose}
            onConfirm={this._afterUploadRefresh.bind(this)}
            type={type}
            value={EMPTY_UPLOAD_VALUE}
            accept={UPLOAD_ACCEPT_LOOKUP[type]}
            parentProps={this.props}
          />
        )}
        {createFolder && (
          <CreateFolderModal
            onClose={this._handleModalClose}
            onSubmit={this._handleCreateFolderSubmit}
          />
        )}
        {targetModalInfo && !isFolderInfoActive && showInfoModal && (
          <ResourcesInfoModal
            name={targetModalInfo.name}
            targetModalInfo={targetModalInfo}
            lastModified={targetModalInfo.lastModified}
            creator={targetModalInfo.creator}
            onClose={this._handleModalClose}
            onSubmit={this._handleModalSubmit}
          />
        )}
        {targetModalInfo && isFolderInfoActive && showInfoModal && (
          <ResourcesGroupModal
            name={targetModalInfo.name}
            lastModified={targetModalInfo.lastModified}
            createdAt={targetModalInfo.createdAt}
            fileCount={targetModalInfoCount}
            creator={targetModalInfo.creator}
            onClose={this._handleModalClose}
            onSubmit={this._handleModalSubmit}
          />
        )}
        {modalBulkMoveShow && (
          <BulkMoveModal
            type={type}
            paramsGroupId={{ paramsGroupId }}
            onSubmit={this._handleBulkMoveSubmit}
            onClose={this._handleModalClose}
          />
        )}
      </div>
    );
  }
}

export default connectConfirm(
  connectToast(connectModal(withRouter(ResourceList)))
);
