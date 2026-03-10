import BraftEditor from 'braft-editor';
import { observer } from 'mobx-react';
import React from 'react';
import ColorPicker from 'braft-extensions/dist/color-picker';
import 'braft-editor/dist/index.css';
import 'braft-extensions/dist/color-picker.css';
import store from 'store/stage';
BraftEditor.use(
  ColorPicker({
    theme: 'light', // 支持dark和light两种主题，默认为dark
  })
);
@observer
class BraftEditorComponent extends React.Component {
  componentWillUnmount() {
    let stageStore = store.getStageStore();
    stageStore.closeHotKeys = false;
  }
  static createEditorState(value) {
    return BraftEditor.createEditorState(value);
  }
  UNSAFE_componentWillMount() {
    let stageStore = store.getStageStore();
    stageStore.closeHotKeys = true;
  }
  render() {
    let { excludeControls, value, onChange } = this.props;
    return (
      <BraftEditor
        excludeControls={excludeControls}
        value={value}
        onChange={onChange}
      />
    );
  }
}
export default BraftEditorComponent;
