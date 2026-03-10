import React from 'react';
import { observer } from 'mobx-react';

import { Icon } from 'antd';
import DragSortableList from 'react-drag-sortable';

import store from 'store/stage';
import { connectToStore } from '../StoreContext';

import './index.less';

@observer
class StageList extends React.Component {
  listChange = (list) => {
    let parentStage = store.getStageStore().getParentStage();
    let order = list.map(function (item) {
      return item.component.id;
    });
    parentStage.sortChildren(order);
  };

  addStage = () => {
    let parentStage = store.getStageStore().getParentStage();
    let child = parentStage.addChild();
    this.select(child);
  };

  removeStage = (e, id) => {
    let parentStage = store.getStageStore().getParentStage();

    parentStage.removeChild(id);

    let list = parentStage.list;
    let index = list.map((item) => item.id).indexOf(id);
    let next = list[index - 1 < 0 ? 0 : index - 1];
    let type;
    if (parentStage.type == 'project') {
      type = 'page';
    } else if (parentStage.type == 'widget') {
      type = 'layer';
    }
    parentStage.selectChildren([next.id]);
    store.getStageStore().clearCurrentStage();
    store.getStageStore().setCurrentStage(next, type);

    e.stopPropagation();
  };

  select = (item) => {
    let parentStage = store.getStageStore().getParentStage();

    let type;
    if (parentStage.type == 'project') {
      type = 'page';
    } else if (parentStage.type == 'widget') {
      type = 'layer';
    }

    store.getStageStore().clearCurrentStage();
    store.getStageStore().setCurrentStage(item, type);

    parentStage.selectChildren([item.id]);
  };

  render() {
    let me = this;
    const { store } = this.props;
    let parentStage = store.getStageStore().getParentStage();
    let list = parentStage.list;
    let type;

    if (parentStage.type === 'project') {
      type = '页面';
    } else if (parentStage.type === 'widget') {
      type = '面板';
    }

    list = list.map(function (item, index) {
      const itemName = item.name;
      return {
        content: (
          <div key={index} className="stage" onClick={me.select.bind(me, item)}>
            <span>
              {itemName || type + '-' + (index + 1)}
              {list.length > 1 ? (
                <Icon
                  type="close"
                  className="close"
                  onClick={(e) => {
                    me.removeStage(e, item.id);
                  }}
                />
              ) : null}
            </span>
          </div>
        ),
        classes: ['stage-item', item.isSelected ? 'stage-item-selected' : ''],
        component: item,
        list: list,
      };
    });

    let content = [
      <DragSortableList
        key="sortable-list"
        type="vertical"
        onSort={this.listChange}
        items={list}
      />,
    ];

    let maxLayerCount = parentStage.component.maxLayerCount;
    if (maxLayerCount === undefined || maxLayerCount > list.length) {
      content.push(
        <div key="stage-add" className="stage-add" onClick={this.addStage}>
          <span>
            {'添加'}
            {type}
          </span>
        </div>
      );
    }

    return <div className="stage-list">{content}</div>;
  }
}

export default connectToStore(StageList);
