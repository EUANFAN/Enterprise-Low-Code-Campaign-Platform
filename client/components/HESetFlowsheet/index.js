import React from 'react';
import { toastError, toastLoading, toastSuccess } from 'components/HEToast';
import LocalStorage from 'common/localStorage';
import history from 'store/history';
import { updateProject } from 'apis/ProjectAPI';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HESkyLayer from 'components/HESkyLayer';
import HEButton, { HEButtonSizes } from 'components/HEButton';
import HELoading from 'components/HELoading';
import './index.less';
import { HEFilePickerShow } from 'components/HEFilePicker';

export default class SetFlowsheet extends React.Component {
  state = {
    saving: false,
    show: false,
    loading: false,
    imgUrl: null,
  };
  _handleSave = async (event) => {
    event.preventDefault();
    const { project } = this.props;
    if (!project.editable) {
      toastError('您无权限保存');
      return;
    }
    const { saving } = this.state;
    if (saving) {
      return;
    }
    this.setState({ saving: true });
    toastLoading('正在保存...');
    try {
      project.modify({
        thirdPartyConfig: {
          flowsheet: this.state.imgUrl,
          themeName: god.PageData.project.name,
        },
      });
      await updateProject(project._id, project);
      history.record();
      LocalStorage.removeItem(project._id);
      toastSuccess('保存成功');
      this._handleHide();
    } catch (err) {
      toastError('保存失败');
      return;
    } finally {
      this.setState({ saving: false });
    }
  };
  show = () => {
    const thirdPartyConfig =
      god.PageData.project &&
      god.PageData.project.revisionData &&
      god.PageData.project.revisionData.thirdPartyConfig;
    const { flowsheet } = thirdPartyConfig || {};
    this.setState({ show: true, imgUrl: flowsheet });
  };
  _handleHide = () => {
    this.setState({
      show: false,
      loading: false,
      imgUrl: null,
    });
  };
  _handleUpload = () => {
    HEFilePickerShow(
      ({ selectedFile: file }) => {
        this.setState({ imgUrl: file.url });
      },
      () => {}
    );
  };
  render() {
    const { show, imgUrl, loading } = this.state;

    return (
      <React.Fragment>
        {show && (
          <HESkyLayer
            className="theme-setThirdConfig-layer"
            onOverlayClick={this._handleHide}
          >
            <HEModal className="theme-setThirdConfig-modal">
              <HEModalHeader title={'模板流程图'} onClose={this._handleHide} />
              <HEModalContent className="theme-setThirdConfig-modal__content">
                <div className="theme-setThirdConfig-modal__content-container">
                  <div className="theme-setThirdConfig-modal__content-container__iframe">
                    {loading ? (
                      <HELoading />
                    ) : imgUrl ? (
                      <img
                        style={{ height: 'auto', width: '100%', border: 0 }}
                        src={imgUrl}
                      />
                    ) : (
                      <div className="theme-setThirdConfig-modal__content-container__iframe__bg">
                        未设置
                      </div>
                    )}
                  </div>
                </div>
                <HEModalActions>
                  <>
                    <div className="theme-setThirdConfig-modal__content-container__upload">
                      <HEButton
                        onClick={this._handleUpload}
                        className="theme-setThirdConfig-modal__content-container__footer"
                        sizeType={HEButtonSizes.LARGE}
                      >
                        {'上传'}
                      </HEButton>
                    </div>
                    {imgUrl && (
                      <HEButton
                        outline={true}
                        secondary={true}
                        onClick={this._handleHide}
                        sizeType={HEButtonSizes.LARGE}
                        className="theme-setThirdConfig-modal__content-container__footer"
                      >
                        {'取消'}
                      </HEButton>
                    )}
                    {imgUrl && (
                      <HEButton
                        className="theme-setThirdConfig-modal__content-container__footer"
                        onClick={this._handleSave}
                        sizeType={HEButtonSizes.LARGE}
                      >
                        {'保存'}
                      </HEButton>
                    )}
                  </>
                </HEModalActions>
              </HEModalContent>
            </HEModal>
          </HESkyLayer>
        )}
      </React.Fragment>
    );
  }
}
