/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:03:16
 */
import React from 'react';
import keyBy from 'lodash/keyBy';

import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions
} from 'components/HEModal';
import HESkyLayer from 'components/HESkyLayer';
import HESelectable from 'components/HESelectable';
import HEButton, { HEButtonSizes } from 'components/HEButton';
import HEUpload from 'components/HEUpload';
import HESearchInput from 'components/HESearchInput';
import HEPagination from 'components/HEPagination';
import CreateFolderModal from '../../page/components/CreateFolderModal';
import HEBreadcrumb from 'components/HEBreadcrumb';
import { toastError, toastLoading, toastSuccess } from 'components/HEToast';
import { BaseCard } from './ResourceCard';
import PreviewModal from './PreviewModal';
import { ResourceSecondaryPages } from 'common/constants';

import { Icon, message } from 'antd';
import {
  getResourcesByType,
  getMyResourcesByType,
  createNewFolder,
  searchResources,
  uploadResource,
  saveResource,
  getUrlById
} from 'apis/ResourceAPI';

import './HEFilePicker.less';

/**
 * 注意：不建议手动引入节点实例化，推荐使用 ./Show.js 的自动实例化调用的方式
 *
 * filePciker 在 Editor 中被引用的三种 场景 及 对应的调用位置
 * 1. 场景：NavBar onAddWidget
 *    位置：widgets/(Image|Video) 的 onEnter 方法
 * 2. 场景：workSpace Stage 中 widget onDoubleClick
 *    位置：widgets/(Image|Video) 的 onDoubleClick 方法
 * 3. 场景：SettingPanel 中选择了Image 等多媒体组件时，出现的特性配置
 *    位置：controls/FilePicker.js
 */

const DEFAULT_PAGE_SIZE = 8;

const RESOURCE_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio',
  IMAGE: 'image',
  FILE: 'file'
};

const RESOURCE_TYPE_NAME_LOOKUP = {
  video: '视频',
  audio: '音频',
  image: '图片',
  file: '文件'
};

const urlType = {
  officialImage: 'image',
  officialAudio: 'audio',
  officialVideo: 'video',
  myImage: 'image',
  myAudio: 'audio',
  myVideo: 'video',
  myFile: 'file'
};

const DEFAULT_TYPE = {
  image: 'myImage',
  audio: 'myAudio',
  video: 'myVideo',
  file: 'myFile'
};

const UPLOAD_ACCEPT_LOOKUP = {
  [RESOURCE_TYPES.FILE]: [
    '.doc',
    '.docx',
    '.pdf',
    '.xls',
    '.xlsx',
    '.txt',
    '.csv'
  ].join(', '),
  [RESOURCE_TYPES.VIDEO]: ['audio/mpeg', 'video/mp4', 'video/mpeg'].join(', '),
  [RESOURCE_TYPES.AUDIO]: ['audio/mp3', 'audio/wav'].join(', '),
  [RESOURCE_TYPES.IMAGE]: [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/svg+xml',
    'image/gif',
    'image/bmp'
  ].join(', ')
};

const EMPTY_UPLOAD_VALUE = '';
const TOAST_TIMEOUT = 3000;

/**
 * 暂时不支持选中文件夹
 */
export default class HEFilePicker extends React.Component {
  ok;
  cancel;
  state = {
    customUrl: '',
    cloudUrl: '',
    isCustom: 'my',
    visible: false,
    fileType: '',
    list: [],
    resourceMap: {},
    selectedFile: null,
    breadcrumbList: [],
    createFolder: false,
    selectedFolder: null,
    drawerSelected: ResourceSecondaryPages.MY_IMAGE,
    groupName: null,
    keyword: '',
    total: null,
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    loading: true,
    error: false,
    groupId: null,
    folderInfoMap: null,
    selectedIds: null,
    previewTargetId: '',
    showPreview: false,
    previewUrl: ''
  };

  componentDidMount() {
    const { fileType } = this.state;
    fileType && this._fetchCurrentPage();
  }

  _fetchCurrentPage = async (id = '') => {
    const { keyword, current, fileType: type, pageSize } = this.state;
    try {
      // const isMyResourcePage = drawerSelected.search('official') === -1;
      const isMyResourcePage = 1;
      // TODO 目前只提供官方资源搜索
      let result = await (keyword
        ? searchResources(keyword, type, 'official', current)
        : isMyResourcePage
        ? getMyResourcesByType(type, current, id, pageSize) // eslint-disable-line indent
        : getResourcesByType(type, current, id, pageSize)); // eslint-disable-line indent

      const {
        resources,
        total,
        groupId,
        groupName,
        breadcrumbList,
        folderInfoMap
      } = result;
      this.setState({
        list: resources.map((resource) => resource._id),
        resourceMap: {
          ...keyBy(resources, (item) => item._id)
        },
        total,
        groupId,
        groupName,
        breadcrumbList,
        folderInfoMap,
        loading: false
      });
    } catch (e) {
      this.setState({ error: true });
    }
  };

  _handleCreateFolder = async () => {
    this.setState({ createFolder: true });
  };
  _handleCreateFolderModalClose = () => {
    this.setState({ createFolder: false });
  };
  _handleCreateFolderSubmit = async (event, folderName) => {
    const { groupId, fileType } = this.state;
    if (!folderName) {
      toastError('输入框不为空!', TOAST_TIMEOUT);
      return;
    }
    toastLoading('正在保存');
    const currentGroupId = groupId || 'official';
    try {
      const { resource } = await createNewFolder(
        folderName,
        fileType,
        currentGroupId
      );
      let newItem = {
        ...resource
      };

      this.setState((prevState) => {
        let resourceMap = { [resource._id]: newItem, ...prevState.resourceMap };
        return {
          list: [resource._id].concat(prevState.list),
          resourceMap,
          createFolder: false
        };
      });
      toastSuccess('保存成功', TOAST_TIMEOUT);
    } catch (e) {
      toastError('保存失败', TOAST_TIMEOUT);
    }
  };

  // 外部调用入口，在此处传递成功回调、取消回调、以及默认展示的options等
  show = (ok, cancel, options = {}) => {
    this.ok = ok;
    this.cancel = cancel;
    this.setState({
      visible: true,
      customUrl: options.url
    });
    let type = this.state.fileType;
    let fileType = options.type || type || 'image';

    fileType = fileType.toLowerCase();
    // 之前有传入 options.url 作为默认选中项，现有版本暂不支持
    // 如果要则增加，需要改为传递 selectedFileId
    const { groupId: selectedFileId } = this.state;
    this.setState(
      {
        drawerSelected: DEFAULT_TYPE[fileType],
        fileType: fileType,
        keyword: ''
      },
      () => this._fetchCurrentPage(selectedFileId)
    );
  };

  hide = () => {
    this.setState({
      isCustom: 'my',
      visible: false,
      selectedIds: null,
      selectedFile: null
    });
  };

  // TODO：目前外部调用有 选择文件、选择文件夹两种，
  // 确认是否保留两种，然后确认是否删除其中一个state，修改调用方式
  handleOk = async () => {
    let {
      fileType,
      selectedFile,
      selectedFolder,
      isCustom,
      customUrl,
      cloudUrl,
      groupId
    } = this.state;
    if (isCustom === 'online') {
      selectedFile = null;
      if (fileType == 'image') {
        selectedFile = await this._handleRemoteImg(fileType, customUrl);
        let data = Object.assign({}, { selectedFile });
        this.ok(data);
      } else {
        selectedFile = {
          type: fileType,
          url: customUrl
        };
        let data = Object.assign({}, { selectedFile });
        this.ok(data);
      }
      this.hide();
      const folderKey = groupId ? groupId : 'official';
      const fileName = selectedFile['url']
        .match(/[^/]*$/)[0]
        .replace(/_/g, '-');
      await saveResource(
        Object.assign(selectedFile, { name: fileName }),
        folderKey
      );
    } else if (isCustom === 'my') {
      if (this.ok && selectedFile) {
        let data = Object.assign({}, { selectedFile, selectedFolder });
        if(!data.size) { // 兼容 svg 的宽高问题
          data.size = {
            width: 350,
            height: 150
          };
        }
        this.ok(data);
        this.hide();
      }
    } else if (isCustom === 'cloud') {
     const result = await getUrlById(cloudUrl);
     if(result.success) {
      const { data } = result;
      selectedFile = {
        type: fileType,
        url: data[0].videoPlayUrl,
        expireTime: data[0].expireTime,
        id: cloudUrl
      };
      let res = Object.assign({}, { selectedFile });
      this.ok(res);
      this.hide();
      const folderKey = groupId ? groupId : 'official';
      await saveResource(
        Object.assign(selectedFile, { name: '内容云视频' }),
        folderKey
      );
     }else{
       message.error(result.message);
     }
    }
  };

  _handleRemoteImg = (type, url) => {
    return new Promise((resolve) => {
      let img = new Image();
      img.src = url;
      img.onload = () => {
        resolve({
          type: type,
          url: url,
          size: {
            width: img.width,
            height: img.height
          }
        });
        img.onload = null; // 避免重复加载
      };
      img.onerror = () => {
        toastError('当前资源不存在', TOAST_TIMEOUT);
        resolve(true);
      };
    });
  };

  _handleCheck = (event, id) => {
    const { resourceMap } = this.state;
    const target = resourceMap[id];
    if (!target) {
      return;
    }
    this.setState({ previewTargetId: id });
  };

  _handleOpen = (event, id) => {
    const { resourceMap } = this.state;
    const target = resourceMap[id];
    if (!target) {
      return;
    }
    this.setState({ current: 1, keyword: '', groupId: id }, () =>
      this._fetchCurrentPage(id)
    );
  };

  _handleMove = (event, id) => {
    const { resourceMap } = this.state;
    const target = resourceMap[id];

    if (!target) {
      return;
    }
    this.setState({ current: 1, keyword: '' }, () =>
      this._fetchCurrentPage(id)
    );
  };

  // 切换左侧tab选项，个人以及官方的视频，音频，图片；
  _handlePageSelect = (key) => {
    this.setState(
      {
        drawerSelected: key,
        fileType: urlType[key],
        current: 1,
        keyword: ''
      },
      () => this._fetchCurrentPage()
    );
  };

  _handleToggleSelect = (event, id) => {
    const { resourceMap, fileType } = this.state;
    const target = resourceMap[id];
    if (!target) {
      return;
    }
    // 目前仅支持选择文件
    if (target.type !== fileType) return;

    this.setState({
      selectedIds: id,
      selectedFile: target
    });
  };

  //  切换页码
  _handlePageChange = (event, pageNumber) => {
    const { groupId } = this.state;
    if (pageNumber === this.state.current) {
      return;
    }
    this.setState({ current: pageNumber }, () =>
      this._fetchCurrentPage(groupId)
    );
  };

  _handleSearch = async (event) => {
    const value = event.target.value;
    const keyword = value.trim();
    this.setState({ keyword: keyword }, () => this._fetchCurrentPage());
  };
  _handleChange = (event, cloud = '') => {
    const value = event.target.value;
   if(value != null && cloud === 'cloud') {
      this.setState({ cloudUrl: value });
      return;
    }
    if (value != null) {
      this.setState({ customUrl: value });
    }
  };
  _handleUploadSelect = async (event) => {
    event.preventDefault();
    const { groupId } = this.state;
    const folderKey = groupId ? groupId : 'official';
    try {
      toastLoading('上传中');
      let targetFiles = [];
      Object.values(event.target.files).forEach((targetFile) => {
        const file = new File(
          [targetFile],
          targetFile.name.replace(/_/g, '-'),
          { type: targetFile.type }
        );
        targetFiles.push(file);
      });
      await uploadResource(targetFiles, folderKey);
      toastSuccess('上传成功');
    } catch (err) {
      console.log('err', err);
      return toastError('上传失败');
    }
    this._fetchCurrentPage(groupId);
  };

  _handleBreadcrumbClick = (e, index, item) => {
    const { _id } = item;
    this.setState(
      { current: 1, keyword: '', groupId: _id, groupName: item.name },
      () => this._fetchCurrentPage(_id)
    );
  };
  // 顶部：我的/ 远程  /内容云 切换
  _handleCustomClick = (isCustom) => {
    this.setState({
      isCustom
    });
    if (isCustom === 'my') this._fetchCurrentPage();
  };

  _handlePreviewModalClose = () => {
    this.setState({ previewTargetId: '', isCustom: 'my' });
  };

  _handlerPreviewUrl = (showPreview, previewUrl) => {
    this.setState({
      showPreview: showPreview,
      previewUrl: previewUrl,
      selectedFile: null,
      selectedIds: null
    });
  };
  render() {
    let {
      list,
      resourceMap,
      selectedFile,
      total,
      current,
      drawerSelected,
      folderInfoMap,
      fileType,
      groupId,
      breadcrumbList,
      selectedIds,
      previewTargetId,
      isCustom,
      customUrl,
      cloudUrl,
      createFolder,
      visible,
      showPreview,
      previewUrl
    } = this.state;
    // const breadcrumbList = this._getBreadcrumbList();
    const isMyResourcePage = drawerSelected.search('official') === -1;
    const myResourceName = `${isMyResourcePage ? '我的' : ''}${
      RESOURCE_TYPE_NAME_LOOKUP[fileType]
    }`;
    const isCloud = fileType === 'video';
    const CustomName = `远程${RESOURCE_TYPE_NAME_LOOKUP[fileType]}`;

    const previewTarget = previewTargetId && resourceMap[previewTargetId];
    return (
      visible && (
        <React.Fragment>
          <HESkyLayer onOverlayClick={this.hide}>
            <HEModal className="he-file-picker">
              <HEModalHeader title={'资源库'} onClose={this.hide} />
              <HEModalContent className="he-file-picker__content-container">
                <div className="he-file-picker__content-container__content">
                  <div className="he-file-picker__content-container__content__header">
                    <div className="he-file-picker__content-container__content__header__tab">
                      <div
                        className={
                          isCustom === 'my'
                            ? 'he-file-picker__active he-file-picker__content-container__content__header__tab__my'
                            : 'he-file-picker__content-container__content__header__tab__my'
                        }
                        onClick={() => this._handleCustomClick('my')}
                      >
                        {myResourceName}
                      </div>
                      <div
                        className={
                          isCustom === 'online'
                            ? 'he-file-picker__active he-file-picker__content-container__content__header__tab__custom'
                            : 'he-file-picker__content-container__content__header__tab__custom'
                        }
                        onClick={() => this._handleCustomClick('online')}
                      >
                        {CustomName}
                      </div>
                      {false && (
                        <div
                          className={
                            isCustom === 'cloud'
                              ? 'he-file-picker__active he-file-picker__content-container__content__header__tab__custom'
                              : 'he-file-picker__content-container__content__header__tab__custom'
                          }
                          onClick={() => this._handleCustomClick('cloud')}
                        >
                          内容云{RESOURCE_TYPE_NAME_LOOKUP[fileType]}
                        </div>
                      )}
                    </div>
                    {isCustom !== 'my' ? null : (
                      <HESearchInput
                        key={''}
                        placeholder={'查找标题/名称/类型'}
                        onSearch={this._handleSearch}
                        defaultValue={''}
                      />
                    )}
                  </div>
                  <div className="he-file-picker__content-container__content__content">
                    {isCustom === 'online' && (
                      <input
                        className="he-file-picker__content-container__content__content__input"
                        placeholder="请输入远程资源地址"
                        onChange={(event) => {
                          this._handleChange(event);
                        }}
                        value={customUrl || ''}
                      />
                    )}
                    {isCustom === 'cloud' && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%,-50%)',
                          width: '400px'
                        }}
                      >
                        <label
                          style={{
                            left: '0px',
                            position: 'absolute',
                            transform: 'translate(-64px,-50%)'
                          }}
                        >
                          内容云ID:
                        </label>
                        <input
                          className="he-file-picker__content-container__content__content__input"
                          placeholder="请输入内容云视频id"
                          onChange={(event) => {
                            this._handleChange(event, 'cloud');
                          }}
                          value={cloudUrl || ''}
                        />
                      </div>
                    )}
                    {isCustom === 'my' && (
                      <div
                        style={{
                          paddingTop: '10px',
                          width: '100%',
                          justifyContent: 'center'
                        }}
                      >
                        {groupId && (
                          <HEBreadcrumb
                            className="he-file-picker__content-container__content__header__tab__breadcrumb"
                            loading={!breadcrumbList}
                            list={breadcrumbList}
                            onClick={this._handleBreadcrumbClick}
                          />
                        )}
                        <div className="he-file-picker__content-container__content__content__cards">
                          {list.map((itemId) => {
                            const item = resourceMap[itemId];
                            const isFolder = item.isFolder;
                            const urlOrList =
                              isFolder && folderInfoMap && folderInfoMap[itemId]
                                ? folderInfoMap[itemId].list
                                : item.url;
                            return (
                              <HESelectable
                                key={itemId}
                                className="he-file-picker__content-container__content__content__cards__card"
                                selectable={selectedIds === itemId}
                                selected={selectedIds === itemId}
                                onToggleSelect={(event) => {
                                  this._handleToggleSelect(event, itemId);
                                }}
                              >
                                <BaseCard
                                  loading={false}
                                  key={itemId}
                                  title={item.name}
                                  selected={
                                    selectedFile && selectedFile._id === itemId
                                  }
                                  creator={item.creator}
                                  onShowInfo={() => {}}
                                  onCheck={(event) => {
                                    this._handleCheck(event, itemId);
                                  }}
                                  onOpen={(event) => {
                                    this._handleOpen(event, itemId);
                                  }}
                                  onMove={(event) => {
                                    this._handleMove(event, itemId);
                                  }}
                                  lastModified={item.lastModified}
                                  urlOrList={urlOrList}
                                  type={fileType}
                                  isFolder={isFolder}
                                  onToggleSelect={(event) => {
                                    this._handleToggleSelect(event, itemId);
                                  }}
                                  _handlerPreviewUrl={this._handlerPreviewUrl}
                                />
                              </HESelectable>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {showPreview && (
                      <div className="he-file-picker__content-container__content__content__modal ">
                        <Icon
                          type="close-circle"
                          theme="twoTone"
                          twoToneColor="#4A82F7"
                          className="he-file-picker__content-container__content__content__modal__close "
                          onClick={this._handlerPreviewUrl.bind(this, false)}
                        />
                        <div
                          className="he-file-picker__content-container__content__content__modal__box"
                          style={{ backgroundImage: `url(${previewUrl})` }}
                        ></div>
                      </div>
                    )}
                    {isCustom === 'my' &&
                      current != null &&
                      total != null &&
                      total > 1 && (
                        <div className="he-file-picker__content-container__content__content__pager">
                          <HEPagination
                            className="h5-resources-images__pagination"
                            total={total}
                            current={current}
                            onPageChange={this._handlePageChange}
                          />
                        </div>
                      )}
                  </div>

                  <div className="he-file-picker__content-container__content__footer">
                    <HEModalActions>
                      {isCustom === 'my' && isMyResourcePage ? (
                        <div className="he-file-picker__content-container__content__footer__upload">
                          <HEUpload
                            secondary={true}
                            sizeType={HEButtonSizes.LARGE}
                            value={EMPTY_UPLOAD_VALUE}
                            onChange={this._handleUploadSelect}
                            accept={UPLOAD_ACCEPT_LOOKUP[fileType]}
                            multiple={true}
                          >
                            {'上传'}
                          </HEUpload>
                          <HEButton
                            secondary={true}
                            onClick={this._handleCreateFolder}
                            sizeType={HEButtonSizes.LARGE}
                          >
                            {'新建文件夹'}
                          </HEButton>
                        </div>
                      ) : (
                        <span></span>
                      )}
                      <HEButton
                        secondary={true}
                        onClick={this.hide}
                        sizeType={HEButtonSizes.SMALL}
                      >
                        {'取消'}
                      </HEButton>
                      <HEButton
                        className="he-file-picker__content-container__content__footer__insert"
                        sizeType={HEButtonSizes.SMALL}
                        onClick={this.handleOk}
                      >
                        {'插入'}
                      </HEButton>
                    </HEModalActions>
                  </div>
                </div>
              </HEModalContent>
            </HEModal>
          </HESkyLayer>
          {createFolder && (
            <CreateFolderModal
              onClose={this._handleCreateFolderModalClose}
              onSubmit={this._handleCreateFolderSubmit}
            />
          )}
          {previewTarget && (
            <PreviewModal
              name={previewTarget.name}
              createdAt={previewTarget.lastModified}
              url={previewTarget.url}
              onClose={this._handlePreviewModalClose}
              type={previewTarget.type}
              creator={previewTarget.creator}
              duration={previewTarget.duration}
              width={previewTarget.size && previewTarget.size.width}
              height={previewTarget.size && previewTarget.size.height}
            />
          )}
        </React.Fragment>
      )
    );
  }
}
