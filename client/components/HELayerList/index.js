import React from 'react';
import { observer } from 'mobx-react';
import { Icon, Collapse } from 'antd';
import store from 'store/stage';
import './index.less';
import { scrollToWidget } from 'common/getHeight';
import { afterUpdateHook } from 'common/attributeHook';
import MoveWidgetOperation from 'components/HEMoveWidgetOperation';
import { toJS } from 'mobx';
const Panel = Collapse.Panel;

@observer
class LayerList extends React.Component {
  selectWidget = (widgetId) => {
    let stageStore = store.getStageStore();
    let stage = stageStore.getCurrentStage();
    stage.selectChildren(widgetId);
    setTimeout(function () {
      let selectChildren = stage.getSelectedChildren()[0];
      scrollToWidget(stage, selectChildren);
    }, 100);
  };

  toggleVisible = async (widget) => {
    widget.modify({
      visible: !widget.visible
    });
    await afterUpdateHook(widget, 'height', null, 'height');
  };
  onFlowListSortEnd = ({ oldIndex, newIndex }, list, type) => {
    if (
      oldIndex == newIndex ||
      list.length == 1 ||
      newIndex == -1 ||
      newIndex == list.length
    ) {
      return;
    }
    let stageStore = store.getStageStore();
    let stage = stageStore.getCurrentStage();
    let originOrderAll = toJS(list);
    const oldIndexId = originOrderAll[oldIndex];
    const newIndexId = originOrderAll[newIndex];
    // // 1. 先干掉老的位置的元素
    const entireListIds = originOrderAll.filter((item) => {
      return item.id !== oldIndexId.id;
    });
    // // 2. 找到新位置在列表中的下标
    let insertIndex = entireListIds.findIndex(
      (item) => item.id === newIndexId.id
    );
    // // 3. 根据移动方向设置插入位置
    if (newIndex > oldIndex) {
      insertIndex += 1;
    }
    entireListIds.splice(insertIndex, 0, oldIndexId);
    let order = entireListIds.map((item) => {
      return item.id;
    });
    if (type == 'normal') {
      order.reverse();
    }
    stage.sortChildren(order);
  };
  render() {
    let me = this;
    let stageStore = store.getStageStore();
    let stage = stageStore.getCurrentStage();
    let container = stage.component;
    let widgets = stage.list;

    let normalWidgets = [];
    let flowWidgets = [];
    let normalList = [];
    let flowList = [];

    widgets.forEach(function (widget) {
      if (widget.layout == 'normal') {
        normalList.unshift(widget);
      } else {
        flowList.push(widget);
      }
    });
    const currentWidget = (widget, index, list, type) => {
      let moveWidgetOptions = {
        up: list.length != 1,
        down: list.length != 1,
        index: index,
        clickMethod: (options) => this.onFlowListSortEnd(options, list, type)
      };
      return (
        <div
          className={
            widget.isSelected ? 'layer-item-selected layer-item' : 'layer-item'
          }
        >
          <div
            className={[
              'layer-item-content',
              container.locked ? 'no-drag' : ''
            ].join(' ')}
            onClick={me.selectWidget.bind(me, widget.id)}
          >
            <div className="status">
              <Icon
                onClick={me.toggleVisible.bind(me, widget)}
                className={widget.visible ? 'visible' : 'visible-disable'}
                type="eye"
              />
            </div>
            <div className="layer-name">
              【{widget.type}】{widget.name}
            </div>
            <MoveWidgetOperation options={moveWidgetOptions} />
          </div>
        </div>
      );
    };
    normalWidgets = normalList.map((widget, index) => {
      return currentWidget(widget, index, normalList, 'normal');
    });
    flowWidgets = flowList.map((widget, index) => {
      return currentWidget(widget, index, flowList, 'flow');
    });

    return (
      <Collapse>
        <Panel header={'瀑布流布局图层'} key="flow-panel">
          {flowWidgets}
        </Panel>
        <Panel header={'拖拽布局图层'} key="normal-panel">
          {normalWidgets}
        </Panel>
      </Collapse>
    );
  }
}

export default LayerList;
