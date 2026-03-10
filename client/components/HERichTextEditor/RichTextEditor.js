import './index.less';
import React from 'react';
import { observer } from 'mobx-react';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HESkyLayer from 'components/HESkyLayer';
import HEButton, { HEButtonSizes } from 'components/HEButton';
import BraftEditor from 'braft-editor';
import ColorPicker from 'braft-extensions/dist/color-picker';
import 'braft-editor/dist/index.css';
import 'braft-extensions/dist/color-picker.css';
import BraftEditorComponent from './BraftEditor';
BraftEditor.use(
  ColorPicker({
    theme: 'light', // 支持dark和light两种主题，默认为dark
  })
);

@observer
class RichTextEditor extends React.Component {
  state = {
    show: true,
    editorState: BraftEditor.createEditorState(null),
  };

  show = (value, ok /**/, cancel /**/) => {
    this.ok = ok;
    this.cancel = cancel;
    this.setState({
      show: true,
      editorState: BraftEditor.createEditorState(value),
    });
  };

  hide = () => {
    this.setState({
      show: false,
    });
  };

  handleOk = () => {
    const htmlContent = this.state.editorState.toHTML();
    if (this.ok) {
      this.ok({
        content: htmlContent,
      });
    }
    this.setState({
      show: false,
    });
  };

  handleCancel = () => {
    if (this.cancel) {
      this.cancel();
    }
    this.setState({
      show: false,
    });
  };

  handleEditorChange = (editorState) => {
    this.setState({ editorState });
  };

  render() {
    const excludeControls = ['media', 'code', 'blockquote', 'hr'];
    // TODO: 此处每次隐藏都destory了整个组件，目前测试如果不的话会有BUG，暂时保持原状
    return this.state.show ? (
      <React.Fragment>
        <HESkyLayer onOverlayClick={this.handleCancel}>
          <HEModal className="he-rich-text">
            <HEModalHeader title={'文本管理器'} onClose={this.handleCancel} />
            <HEModalContent>
              <BraftEditorComponent
                excludeControls={excludeControls}
                value={this.state.editorState}
                onChange={this.handleEditorChange}
              />
            </HEModalContent>
            <HEModalActions className="he-rich-text__actions">
              <HEButton
                secondary={true}
                onClick={this.handleCancel}
                sizeType={HEButtonSizes.SMALL}
              >
                {'取消'}
              </HEButton>
              <HEButton sizeType={HEButtonSizes.SMALL} onClick={this.handleOk}>
                {'确认'}
              </HEButton>
            </HEModalActions>
          </HEModal>
        </HESkyLayer>
      </React.Fragment>
    ) : null;
  }
  componentDidMount() {
    if (!this.state.show) {
      return;
    }
  }
}

export default RichTextEditor;
