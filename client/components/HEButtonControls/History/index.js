import React from 'react';
import { observer } from 'mobx-react';
import Hotkeys from 'react-hot-keys';
import EditorFloatingActions from '../EditorFloatingActions';
import { connectToStore } from 'components/StoreContext';
import history from 'store/history';

class History extends React.Component {
  _handleHelp = () => {
    god.location.href = '/doc/index.html';
  };

  _handleRedo = () => {
    history.forward();
  };

  _handleUndo = () => {
    history.back();
  };

  render() {
    const undoable = history.hasBack();
    const redoable = history.hasForward();

    return (
      <React.Fragment>
        <EditorFloatingActions
          undoable={undoable}
          redoable={redoable}
          onRedo={this._handleRedo}
          onUndo={this._handleUndo}
          onHelp={this._handleHelp}
        />
        <Hotkeys
          key="undo"
          keyName="control+z,⌘+z"
          onKeyDown={this._handleUndo}
        />
        <Hotkeys
          key="redo"
          keyName="control+shift+z,⌘+shift+z"
          onKeyDown={this._handleRedo}
        />
      </React.Fragment>
    );
  }
}

export default connectToStore(observer(History));
