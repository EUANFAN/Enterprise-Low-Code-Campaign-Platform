import React from 'react';
import Moment from 'moment';

import { HEModal, HEModalHeader, HEModalContent } from 'components/HEModal';
import HESkyLayer from 'components/HESkyLayer';
import HEFrame from 'components/HEFrame';
import { toastSuccess, toastInfo } from 'components/HEToast';
import HEButton, { HEButtonSizes } from 'components/HEButton';
import AudioIcon from 'components/icons/Audio';
import { connectToast } from 'context/feedback';
import { noop } from 'utils/FunctionUtils';
import ImageUtils from 'utils/ImageUtils';
import VideoUtils from 'utils/VideoUtils';
import DownloadUtils from 'utils/DownloadUtils';

import './index.less';

const Paragraph = ({ children }) => (
  <p className="preview-modal__content__info-section__paragraph">{children}</p>
);

const FRAME_RATIO = 420 / 280;
const EXTENSION_REGEX = /\.([a-zA-Z0-9]+)$/;

class PreviewModal extends React.Component {
  static defaultProps = {
    onClickAway: noop,
  };

  state = { dimension: null };

  async componentDidMount() {
    const { type, url } = this.props;
    let dimension;

    if (type === 'image') {
      dimension = await ImageUtils.getImageDimension(url);
    } else if (type === 'video') {
      dimension = await VideoUtils.getVideoDimension(url);
    } else {
      dimension = await Promise.resolve({ width: '100%', height: '100%' });
    }

    this.setState({ dimension });
  }

  _handleDownloadClick = async () => {
    const { url, name } = this.props;
    const match = EXTENSION_REGEX.exec(url);

    toastInfo('正在获取资源，请稍后');
    await DownloadUtils.downloadLink(url, name, match ? match[1] : undefined);
    toastSuccess('开始下载');
  };

  render() {
    const { onClose, type, width, height, createdAt, name, creator, url } =
      this.props;
    const { dimension } = this.state;
    let title, typeInfoName, typeInfoValue, media;

    const loaded = Boolean(dimension);
    const shouldFitHorizontally =
      dimension &&
      typeof dimension.width === 'number' &&
      typeof dimension.height === 'number' &&
      dimension.width / dimension.height > FRAME_RATIO;
    const mediaStyle = shouldFitHorizontally
      ? { width: '100%' }
      : { height: '100%' };

    switch (type) {
      case 'image': {
        title = '图片详情';
        typeInfoName = '图片尺寸';
        typeInfoValue = `${width}*${height}`;
        media = loaded && <img src={url} style={mediaStyle} />;
        break;
      }
      case 'video': {
        title = '视频详情';
        // TODO：按照需求 typeInfoName 应该 = 视频时长，但是音视频时长获取暂时比较麻烦
        // 暂时使用 创建者 替代展示，待优化
        typeInfoName = '创建者';
        // typeInfoValue = TimeUtils.durationToTime(duration);
        typeInfoValue = creator;
        media = loaded && <video src={url} style={mediaStyle} controls />;
        break;
      }
      case 'audio':
      default: {
        title = '音频详情';
        // TODO：按照需求 typeInfoName 应该 = 音频时长，但是音频时长获取暂时比较麻烦
        // 暂时使用 创建者 替代展示，待优化
        typeInfoName = '创建者';
        // typeInfoValue = TimeUtils.durationToTime(duration);
        typeInfoValue = creator;
        const className = [
          'preview-modal__content__media-section__background',
          'preview-modal__content__media-section__background--audio',
        ].join(' ');

        media = (
          <React.Fragment>
            <audio src={url} controls />
            <AudioIcon className={className} />
          </React.Fragment>
        );
        break;
      }
    }

    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="preview-modal">
          <HEModalHeader title={title} onClose={onClose} />
          <HEModalContent className="preview-modal__content">
            <HEFrame className="preview-modal__content__media-section">
              {media}
            </HEFrame>
            <div className="preview-modal__content__info-section">
              <h1 className="preview-modal__content__info-section__title">
                {name}
              </h1>
              <Paragraph>
                {typeInfoName}： {typeInfoValue}
              </Paragraph>
              <Paragraph>
                {'创建时间'}： {Moment(createdAt).format('YYYY-MM-DD')}
              </Paragraph>
              <HEButton
                className="preview-modal__content__info-section__action-button"
                sizeType={HEButtonSizes.SMALL}
                outline={true}
                onClick={this._handleDownloadClick}
              >
                {'下载'}
              </HEButton>
              <a
                style={{ marginLeft: '10px' }}
                target={'_blank'}
                rel="noopener noreferrer"
                href={url}
              >
                <HEButton
                  className="preview-modal__content__info-section__action-button"
                  sizeType={HEButtonSizes.SMALL}
                  outline={true}
                >
                  {'打开'}
                </HEButton>
              </a>
            </div>
          </HEModalContent>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default connectToast(PreviewModal);
