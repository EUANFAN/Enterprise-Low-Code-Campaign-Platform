import React from 'react';
import { HEFloatingButton } from 'components/HEFloatingButton';
import Redo from 'components/icons/Redo';
import Undo from 'components/icons/Undo';

import './index.less';

export default class EditorFloatingActions extends React.Component {
  render() {
    const { redoable, undoable, onUndo, onRedo /* , onHelp*/ } = this.props;
    return (
      <div className="editor-floating-actions">
        <HEFloatingButton
          className="editor-floating-actions__button"
          disabled={!undoable}
          onClick={onUndo}
        >
          <Undo />
          {'撤回'}
        </HEFloatingButton>
        <HEFloatingButton
          className="editor-floating-actions__button"
          disabled={!redoable}
          onClick={onRedo}
        >
          <Redo />
          {'前进'}
        </HEFloatingButton>
      </div>
    );
  }
}
