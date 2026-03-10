import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Icon } from 'antd';
import './index.less';

@observer
export default class EditorTreeNode extends Component {
  render() {
    const { item, deepLength, stageStore, prev, next } = this.props;
    return (
      <span className="editor_tree_node">
        {item.clazz === 'widget' && (
          <Icon
            onClick={(e) => {
              e.stopPropagation();
              item.visible = !item.visible;
            }}
            type={item.visible ? 'eye' : 'eye-invisible'}
          />
        )}
        {/* <Tooltip title={item.name}> */}
        <span style={{
          display: 'inline-block', width: '100px', position: 'absolute', left: item.clazz !== 'widget' ? '0' : '25px', overflow: 'hidden',
          'textOverflow': 'ellipsis',
          'whiteSpace': 'nowrap'
        }}>
          {item.name}</span>
        {/* </Tooltip> */}
        {deepLength === 2 && (
          <span className="tree_move">
            <Icon type="arrow-up" className={item.id === prev ? 'disable' : ''} onClick={(e) => {
              e.stopPropagation();
              item.id !== prev && stageStore.changeMoveStage(item.parentPath, item.id, prev);
            }} />
            <Icon type="arrow-down" className={item.id === next ? 'disable' : ''} onClick={(e) => {
              e.stopPropagation();
              item.id !== next && stageStore.changeMoveStage(item.parentPath, item.id, next);
            }} />
          </span>
        )}
        {deepLength === 2 && item.layout === 'normal' ? (
          <Icon type="drag" />
        ) : (
          <i style={{ display: 'inline-block', width: 12.5 }}></i>
        )}
      </span>
    );
  }
}
