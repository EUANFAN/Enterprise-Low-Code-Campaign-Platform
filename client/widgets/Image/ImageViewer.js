import React from 'react';
import Viewer from '@k9/react-viewer-mobile';
// import '@k9/react-sortable-hoc/dist/index.css';
export default class ImageViewer extends React.Component {
  render() {
    let { visible, onClose, images } = this.props;
    return (
      <Viewer visible={visible} onClose={onClose} images={images}></Viewer>
    );
  }
}
