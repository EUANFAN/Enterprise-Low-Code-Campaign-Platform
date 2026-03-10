import React from 'react'
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalFooter
} from 'components/HEModal'
import HESkyLayer from 'components/HESkyLayer'
import AudioIcon from 'components/icons/Audio'
import FileIcon from 'components/icons/File'
import HEUpload from 'components/HEUpload'
import { connectToast } from 'context/feedback'
import { noop } from 'utils/FunctionUtils'
import { uploadResource } from 'apis/ResourceAPI'
import { Table, Icon } from 'antd'

import downIcon from './img/down.png'

import './index.less'

const FOLDER_KEY_MY = 'my'
const FOLDER_KEY_OFFICIAL = 'official'
const MAX_SIZE = {
  image: 2 * 1024 * 1024,
  audio: 10 * 1024 * 1024,
  video: 1000 * 1024 * 1024
}
let mediaType = ''
let dataNormalFiles = []
let maxFiles = []
const columns = [
  {
    title: '文件',
    dataIndex: 'filePicture',
    key: 'filePicture',
    width: '20%',
    render: (filePicture) => {
      if (mediaType == 'image') {
        return (
          <div className="table-img-content">
            <img src={filePicture} className="table-img-content__img"></img>
          </div>
        )
      }
      if (mediaType == 'audio') {
        return (
          <div className="table-img-content">
            <AudioIcon className="table-img-content__img" />
          </div>
        )
      }
      if (mediaType == 'video') {
        return (
          <div className="table-img-content">
            <video
              src={filePicture}
              className="table-img-content__img"
              controls
            />
          </div>
        )
      }
      if (mediaType == 'file') {
        return (
          <div className="table-img-content">
            {/* className="table-img-content__img"  */}
            <FileIcon />
          </div>
        )
      }
    }
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: '20%'
  },
  {
    title: '大小',
    dataIndex: 'size',
    key: 'size',
    width: '20%'
  },
  {
    title: '创建者',
    dataIndex: 'creator',
    key: 'creator',
    width: '20%'
  },
  {
    title: '状态',
    key: 'stat',
    dataIndex: 'stat',
    render: (stat) => {
      if (stat == '上传中') {
        return (
          <span>
            <Icon type="sync" spin /> {stat}
          </span>
        )
      }
      if (stat == '上传成功') {
        return (
          <span>
            <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />{' '}
            {stat}
          </span>
        )
      }
      if (stat == '上传失败') {
        return (
          <span>
            <Icon type="close-circle" theme="twoTone" twoToneColor="#4A82F7" />{' '}
            {stat}
          </span>
        )
      }
    }
  }
]

class DownLoadModal extends React.Component {
  static defaultProps = {
    onClickAway: noop
  }

  state = {
    dimension: null,
    isFilesNull: true,
    data: [],
    files: [],
    uploadSuccess: false
  }
  _handleUploadSelect = async (event) => {
    // 我们希望一选定就上传，因此防止预设行为让同一档案上传是可以的
    event.preventDefault()
    const {
      match: {
        params: { 0: isMyResourcePage, 1: type, groupId }
      }
    } = this.props.parentProps
    const { type: uploadType } = this.props
    const folderKey = isMyResourcePage
      ? FOLDER_KEY_MY
      : groupId
      ? groupId // eslint-disable-line indent
      : FOLDER_KEY_OFFICIAL // eslint-disable-line indent
    let targetFiles = []
    if (event.target.files && event.target.files.length) {
      this.setState({
        isFilesNull: false
      })
      Object.values(event.target.files).forEach((targetFile) => {
        const file = new File(
          [targetFile],
          uploadType == 'image'
            ? targetFile.name.replace(/_/g, '-')
            : targetFile.name,
          { type: targetFile.type }
        )
        let obj = {}
        obj.key = file.lastModified
        obj.name = file.name
        obj.size = this.getFileSize(file)
        obj.creator = this.props.parentProps.userInfo.userId
        obj.filePicture = this.getObjectURL(file)
        let res =
          /\.json$|\.pdf$|\.doc$|\.docx$|\.xls$|\.xlsx$|\.txt$|\.csv$|\.jpg$|\.jpeg$|\.gif$|\.svg$|\.png$|\.mp3$|\.mp4$|\.m3u8$/i.test(
            obj.name
          )
        if (res) {
          if (file.size > MAX_SIZE[type]) {
            obj.stat = '上传失败'
            maxFiles.push(obj)
            this.setState({
              uploadSuccess: false
            })
          } else {
            dataNormalFiles.push(obj)
            targetFiles.push(file)
            obj.stat = '上传中'
          }
        } else {
          // 兼容火狐浏览器上传文件错误提示
          obj.stat = '上传失败'
          maxFiles.push(obj)
          this.setState({
            uploadSuccess: false
          })
        }
      })
      this.setState({
        data: [...dataNormalFiles, ...maxFiles]
      })
    }
    try {
      if (!targetFiles.length) return
      // 只有正常的资源格式才会上传
      const results = await uploadResource(targetFiles, folderKey)
      this.setState((preState) => ({
        files: [...preState.files, ...results.files]
      }))
      dataNormalFiles.forEach((file) => {
        file.stat = '上传成功'
      })
      this.setState({
        data: [...dataNormalFiles, ...maxFiles],
        uploadSuccess: true
      })
      this.props.onConfirm(this.state.files)
      this.setState({
        files: []
      })
    } catch (err) {
      this.setState({
        uploadSuccess: false
      })
      console.log('上传失败', err)
    }
  }
  _handleClose() {
    this.setState({
      files: [],
      data: []
    })
    dataNormalFiles = []
    maxFiles = []
    this.props.onClose()
  }
  getFileSize(file) {
    let size =
      file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(1)}KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)}M`
    return size
  }
  getObjectURL(file) {
    var binaryData = []
    binaryData.push(file)
    return god.URL.createObjectURL(
      new Blob(binaryData, { type: 'application/zip' })
    )
  }

  render() {
    const { type, accept, value } = this.props
    mediaType = type
    let title, info
    switch (type) {
      case 'image': {
        title = '上传图片'
        info = '为了保证素材的正常使用，仅支持2M以内图片上传'
        break
      }
      case 'video': {
        title = '上传视频'
        info = '为了保证素材的正常使用，仅支持1000M以内视频上传'
        break
      }
      case 'file': {
        title = '上传文件'
        info = '为了保证素材的正常使用，仅支持10M以内文件上传'
        break
      }
      case 'audio':
      default: {
        title = '上传音频'
        info = '为了保证素材的正常使用，仅支持10M以内音频上传'
        break
      }
    }

    return (
      <HESkyLayer onOverlayClick={this._handleClose.bind(this)}>
        <HEModal className="download-modal">
          <HEModalHeader title={title} onClose={this._handleClose.bind(this)} />
          <HEModalContent className="download-modal__content">
            {this.state.isFilesNull ? (
              <div className="download-modal__content__info-section">
                <img src={downIcon} className="file-null-img" />
                <HEUpload
                  className="download-modal__button"
                  value={value}
                  onChange={this._handleUploadSelect.bind(this)}
                  accept={accept}
                  multiple={true}
                >
                  {'上传'}
                </HEUpload>
                <p>{info}</p>
              </div>
            ) : (
              <div className="download-modal__content__group">
                {this.state.uploadSuccess ? (
                  <p className="download-modal__content__tableInfo">
                    本次成功上传 {this.state.data.length} 个文件
                  </p>
                ) : null}
                <Table
                  columns={columns}
                  dataSource={this.state.data}
                  pagination={false}
                  scroll={{ y: 300 }}
                  className="download-modal__content__table"
                />
              </div>
            )}
          </HEModalContent>
          <HEModalFooter
            isFilesNull={this.state.isFilesNull}
            onUpload={this._handleUploadSelect.bind(this)}
            onConfirm={this._handleClose.bind(this)}
            onClose={this._handleClose.bind(this)}
            accept={accept}
            value={value}
          />
        </HEModal>
      </HESkyLayer>
    )
  }
}

export default connectToast(DownLoadModal)
