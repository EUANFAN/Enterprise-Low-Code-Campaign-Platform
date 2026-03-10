import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Value } from 'slate';

import { connectToStore } from 'components/StoreContext';
import RichTextEditor from 'components/RichTextEditor/index.js';

@observer
class RichTextEditorContainer extends Component {
  _handleChange = (change) => {
    const { store, widgetId } = this.props;
    const widget = store.getStageStore().getComponentById(widgetId);

    widget.modify({ content: change.value }, 'data');
  };

  render() {
    const { store, widgetId, style } = this.props;
    const widget = store.getStageStore().getComponentById(widgetId);

    if (!widget) {
      return null;
    }

    const { content } = widget.data;
    const editorValue = !content
      ? undefined
      : Value.isValue(content)
      ? content // eslint-disable-line
      : Value.fromJS(toJS(content)); // eslint-disable-line

    return (
      <RichTextEditor
        value={editorValue}
        style={style}
        onChange={this._handleChange}
      />
    );
  }
}

export default connectToStore(RichTextEditorContainer);
