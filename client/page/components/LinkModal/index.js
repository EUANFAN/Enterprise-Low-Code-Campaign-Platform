import React from 'react';
import { HEModal, HEModalHeader, HEModalContent } from 'components/HEModal';
import HEButton from 'components/HEButton';
import HEInput from 'components/HEInput';
import HESkyLayer from 'components/HESkyLayer';
import Loading from 'components/icons/Loading';
import { noop } from 'utils/FunctionUtils';
import { getOnlineUrl, handerRuleUrl } from 'common/utils';
import './index.less';
import ClipboardUtils from 'utils/ClipboardUtils';
import { toastSuccess, toastError } from 'components/HEToast';

function Row(props) {
  return <div className="link-modal__content__row">{props.children}</div>;
}

function Label(props) {
  return (
    <label className="link-modal__content__row__label">{props.children}</label>
  );
}

export default class ProjectFolderInfoModal extends React.Component {
  static defaultProps = {
    onClose: noop,
  };

  state = { url: null, jsonUrl: '', miniProgramUrl: '' };

  async componentDidMount() {
    const { projectId, origin, componentPlat, remoteUrl } = this.props;
    if (remoteUrl) {
      this.setState({
        url: handerRuleUrl(remoteUrl, projectId),
      });
    } else {
      let { currentUrl, jsonUrl } = await getOnlineUrl('', {
        _id: projectId,
        origin: origin,
        componentPlat: componentPlat,
      });
      this.setState({
        url: currentUrl,
        jsonUrl: jsonUrl,
      });
    }
    if (componentPlat && componentPlat.includes('miniProgram')) {
      // 项目id前八位，小程序中使用获取json数据用
      // 小程序基础链接
      const miniProgramUrl = `pages/oldNew/newTemplate?p=${projectId.slice(
        0,
        8
      )}`;
      this.setState({
        miniProgramUrl: miniProgramUrl,
      });
    }
  }
  _handleTextCopy = async (text) => {
    try {
      await ClipboardUtils.copyTextToClipboard(text);
      toastSuccess('已复制到剪贴板');
    } catch (err) {
      toastError(err.message);
    }
  };
  _handleOpen = async (url) => {
    const { onOpenInNewTab } = this.props;
    if (!url) {
      return;
    }

    try {
      god.open(url);
      onOpenInNewTab && onOpenInNewTab();
    } catch (err) {
      onOpenInNewTab && onOpenInNewTab(err);
    }
  };

  render() {
    const { onClose } = this.props;
    const { url, jsonUrl, miniProgramUrl } = this.state;
    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="link-modal">
          <HEModalHeader title={'项目链接'} onClose={onClose} />
          <HEModalContent className="link-modal__content">
            {url ? (
              <Row>
                <Label>{'H5链接'}：</Label>
                <HEInput
                  value={url}
                  className="link-modal__content__row__input"
                  type="text"
                />
                <HEButton
                  className="link-modal__content__row__button"
                  onClick={this._handleOpen.bind(this, url)}
                >
                  {'新tab打开'}
                </HEButton>
              </Row>
            ) : (
              <Loading className="link-modal__content__icon" />
            )}
            {jsonUrl && (
              <Row>
                <Label>{'JSON'}：</Label>
                <HEInput
                  value={jsonUrl}
                  className="link-modal__content__row__input"
                  type="text"
                />
                <HEButton
                  className="link-modal__content__row__button"
                  onClick={this._handleOpen.bind(this, jsonUrl)}
                >
                  {'新tab打开'}
                </HEButton>
              </Row>
            )}
            {miniProgramUrl && (
              <Row>
                <Label>{'小程序'}：</Label>
                <HEInput
                  value={miniProgramUrl}
                  className="link-modal__content__row__input"
                  type="text"
                />
                <HEButton
                  className="link-modal__content__row__button"
                  onClick={this._handleTextCopy.bind(this, miniProgramUrl)}
                >
                  {'复制链接'}
                </HEButton>
              </Row>
            )}
          </HEModalContent>
        </HEModal>
      </HESkyLayer>
    );
  }
}
