import React from 'react';
import classNames from 'classnames';
import { HEHiddenButtonGroup, HEHiddenButton } from 'components/HEHiddenButton';
import { HECard, HECardContent, HECardActions } from 'components/HECard';
import HEButton, { HEButtonSizes } from 'components/HEButton';
import HEFileCollection from 'components/HEFileCollection';
import HELoadingString from 'components/HELoadingString';
import HEFrame from 'components/HEFrame';
import { toastSuccess, toastLoading } from 'components/HEToast';
import PlayIcon from 'components/icons/Play';
import AudioIcon from 'components/icons/Audio';
import PreviewIcon from 'components/icons/Preview';
import DownloadUtils from 'utils/DownloadUtils';
import './index.less';

const EXTENSION_REGEX = /\.([a-zA-Z0-9]+)$/;
const EXCEL_ICON = require('./img/xls.png');
const PDF_ICON = require('./img/pdf.png');
const TEXT_ICON = require('./img/txt.png');
const WOED_ICON = require('./img/doc.png');

const Video = (props) => {
  const { url, onCheck, isFolder } = props;
  const className = classNames([
    'resource-card__content__frame__media',
    'resource-card__content__frame__media--video',
  ]);
  return (
    <div className={className}>
      {url && (
        <React.Fragment>
          <video src={url} />
          <div className="resource-card__content__frame__media--video-overlay">
            <PlayIcon onClick={isFolder ? null : onCheck} />
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

const Image = (props) => {
  const className = classNames([
    'resource-card__content__frame__media',
    'resource-card__content__frame__media--image',
  ]);
  return props.url && <img src={props.url} className={className} />;
};

const Audio = (props) => {
  const { url } = props;
  const className = classNames([
    'resource-card__content__frame__media',
    'resource-card__content__frame__media--audio',
  ]);
  return url && <AudioIcon className={className} />;
};

const FilePoster = (url) => {
  let FileIcon = '';
  if (/\.doc$|\.docx$/.test(url)) {
    FileIcon = WOED_ICON;
  }
  if (/\.xls$|\.xlsx$/.test(url)) {
    FileIcon = EXCEL_ICON;
  }
  if (/\.pdf$/.test(url)) {
    FileIcon = PDF_ICON;
  }
  if (/\.txt$/.test(url)) {
    FileIcon = TEXT_ICON;
  }
  if (/\.csv$/.test(url)) {
    FileIcon = TEXT_ICON;
  }
  return (
    url && (
      <img src={FileIcon} className="resource-card__content__frame__file" />
    )
  );
};

const Folder = (props) => {
  const className = classNames([
    'resource-card__content__frame__media',
    'resource-card__content__frame__media--folder',
  ]);
  return <div className={className}>{props.name}</div>;
};

export class BaseCard extends React.Component {
  static defaultProps = {
    urlOrList: [],
  };

  state = {
    hover: false,
  };

  _handleMouseEnter = () => {
    this.setState({ hover: true });
  };

  _handleMouseLeave = () => {
    this.setState({ hover: false });
  };

  _renderMedia = (url, type, index) => {
    switch (type) {
      case 'video':
        return (
          <Video
            key={url || index}
            url={url}
            onCheck={this.props.onCheck}
            isFolder={this.props.isFolder}
          />
        );
      case 'image':
        return <Image url={url} key={url || index} />;
      case 'audio':
        return <Audio url={url} key={url || index} />;
      case 'file':
        return FilePoster(url);
      default:
        return null;
    }
  };
  _handleDownloadClick = async () => {
    const { url, title } = this.props;
    const match = EXTENSION_REGEX.exec(url);

    toastLoading('正在获取资源，请稍后');
    await DownloadUtils.downloadLink(url, title, match ? match[1] : undefined);
    toastSuccess('开始下载', 3000);
  };

  _handlePreview = (event, isPreview) => {
    event.stopPropagation();
    this.props._handlerPreviewUrl(isPreview, this.props.urlOrList);
  };

  _handleSelected = () => {
    const { isFolder, type, onOpen, onToggleSelect } = this.props;
    if (type != 'image') {
      isFolder ? onOpen() : onToggleSelect();
    }
  };

  render() {
    const {
      className: classNameInProps,
      title,
      type,
      isFolder,
      loading,
      urlOrList,
      onOpen,
      onDelete,
      onShowInfo,
      onMove,
      onToggleSelect,
    } = this.props;
    const { hover } = this.state;
    const className = classNames(['resource-card', classNameInProps], {
      'resource-card--loading': loading,
    });

    const srcList = urlOrList.slice(0, 4);

    return (
      <>
        <HECard
          className={className}
          onMouseEnter={this._handleMouseEnter}
          onMouseLeave={this._handleMouseLeave}
          disableFloat={isFolder}
        >
          {hover && type == 'image' && !god.inResources ? (
            <div
              className="resource-card__mask"
              onClick={isFolder ? onOpen : onToggleSelect}
            >
              <PreviewIcon
                className="resource-card__mask--preview"
                width={24}
                height={24}
                onClick={(event) => this._handlePreview(event, true)}
              ></PreviewIcon>
            </div>
          ) : null}
          <HECardContent
            className="resource-card__content"
            onClick={this._handleSelected.bind(this)}
          >
            {loading ? (
              <HEFrame />
            ) : isFolder ? (
              <HEFileCollection className="resource-card__content__frame resource-card__content__frame--folder">
                {srcList.map((item, index) => {
                  return item.isFolder ? (
                    <Folder name={item.name} key={index} />
                  ) : (
                    <div
                      className="resource-card__content__frame--infolder"
                      key={index}
                    >
                      {' '}
                      {this._renderMedia(item.url, type, index)}{' '}
                    </div>
                  );
                })}
              </HEFileCollection>
            ) : (
              <HEFrame className="resource-card__content__frame resource-card__content__frame--list">
                {this._renderMedia(urlOrList, type)}
              </HEFrame>
            )}
          </HECardContent>
          <HECardActions className="resource-card__actions">
            {hover && !loading && god.inResources ? (
              <React.Fragment>
                <HEHiddenButtonGroup className="resource-card__actions__button-group">
                  <HEHiddenButton onClick={onShowInfo}>{'查看'}</HEHiddenButton>
                  <HEHiddenButton onClick={onMove}>{'移动'}</HEHiddenButton>
                  <HEHiddenButton onClick={onDelete}>{'删除'}</HEHiddenButton>
                </HEHiddenButtonGroup>
                <HEButton
                  className="resource-card__actions__main-action"
                  sizeType={HEButtonSizes.SMALL}
                  secondary={true}
                  onClick={isFolder ? onOpen : this._handleDownloadClick}
                >
                  {isFolder ? '打开' : '下载'}
                </HEButton>
              </React.Fragment>
            ) : loading ? (
              <HELoadingString length={128} />
            ) : (
              title
            )}
          </HECardActions>
        </HECard>
        {isFolder && <div className="resource-card__shadow"></div>}
      </>
    );
  }
}
