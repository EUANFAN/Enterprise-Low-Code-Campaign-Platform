import React from 'react';
import { connectToStore } from 'components/StoreContext';
import HEIcon from 'components/HEIcon';
import { HEModal, HEModalHeader, HEModalContent } from 'components/HEModal';
import HESkyLayer from 'components/HESkyLayer';
import './index.less';
class HEEditorLeftEditConfigTitle extends React.Component {
  state = {
    show: false,
  };
  _handleShow = () => {
    this.setState({ show: true });
  };
  _handleHide = () => {
    this.setState({ show: false });
  };
  render() {
    const { show } = this.state;
    const thirdPartyConfig =
      god.PageData.project &&
      god.PageData.project.revisionData &&
      god.PageData.project.revisionData.thirdPartyConfig;
    const { themeName = '配置流程', flowsheet } = thirdPartyConfig || {};
    return (
      <div className="editorleft-editConfig-panel__title">
        <span className="editorleft-editConfig-panel__title__content">
          {' '}
          {themeName}{' '}
        </span>
        <span
          className="editorleft-editConfig-panel__title__icon"
          onClick={this._handleShow}
        >
          <HEIcon type={'icon-bangzhu'}></HEIcon>
        </span>
        {show && (
          <HESkyLayer onOverlayClick={this._handleHide}>
            <HEModal className={'editorleft-editConfig-panel__title__modal'}>
              <HEModalHeader title={'模板流程图'} onClose={this._handleHide} />
              <HEModalContent>
                {flowsheet ? (
                  <div className="editorleft-editConfig-panel__title__img">
                    <img
                      style={{ height: '100%', width: '100%', border: 0 }}
                      src={flowsheet}
                    />
                  </div>
                ) : (
                  <div className="editorleft-editConfig-panel__title__imgbg">
                    未设置
                  </div>
                )}
              </HEModalContent>
            </HEModal>
          </HESkyLayer>
        )}
      </div>
    );
  }
}
export default connectToStore(HEEditorLeftEditConfigTitle);
