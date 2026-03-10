import React from 'react';
import { observer } from 'mobx-react';
import { Button } from 'antd';
import BaseTrigger from 'base/trigger';
import { getDefaultClient } from 'common/utils';
import AnimationItem from './AnimationItem';
import TriggerItem from './TriggerItem';
import './index.less';
import { connectToStore } from '../StoreContext';
import WidgetTab from './WidgeTab';
@observer
class SubList extends React.Component {
  onDelete = (sub) => {
    const { namespace, element } = this.props;

    if (namespace == 'animations') {
      element.removeAnimation(sub.id);
    }

    if (namespace == 'triggers') {
      element.removeTrigger(sub.id);
    }
  };

  add = () => {
    const { namespace, element, type } = this.props;
    if (namespace == 'animations') {
      element.addAnimation();
    }
    if (namespace == 'triggers') {
      const { config } = this.props;
      let clientConfig = config['ClIENT'];
      let client = getDefaultClient(clientConfig, 'client');
      const events = BaseTrigger.event.handler(type);
      const defaultEvent = events && events[0] && events[0].value;
      element.addTrigger({
        event: defaultEvent || '',
        client: client,
      });
    }
  };

  onFlowListSortEnd = ({ oldIndex, newIndex }) => {
    const { namespace, element } = this.props;
    if (
      oldIndex == newIndex ||
      element[namespace].length == 1 ||
      newIndex == -1 ||
      newIndex == element[namespace].length
    ) {
      return;
    }

    const originOrderAll = element[namespace];
    const oldIndexId = originOrderAll[oldIndex];
    const newIndexId = originOrderAll[newIndex];
    // // 1. 先干掉老的位置的元素
    const entireListIds = originOrderAll.filter((id) => id !== oldIndexId);
    // // 2. 找到新位置在列表中的下标
    let insertIndex = entireListIds.findIndex((id) => id === newIndexId);
    // // 3. 根据移动方向设置插入位置
    if (newIndex > oldIndex) {
      insertIndex += 1;
    }
    entireListIds.splice(insertIndex, 0, oldIndexId);
    element[namespace] = entireListIds;
  };


  render() {
    const { project, element, type, namespace } = this.props;
    let FeatureContainer;
    if (namespace == 'animations') {
      FeatureContainer = AnimationItem;
    } else if (namespace == 'triggers') {
      FeatureContainer = TriggerItem;
    }
    return (
      <div className="sub-panel">
        <WidgetTab project={project} />
        <div className="sub-list">
          {element[namespace].map((feature, index) => {
            let moveWidgetOptions = {
              up: element[namespace].length != 1,
              down: element[namespace].length != 1,
              index: index,
              clickMethod: this.onFlowListSortEnd,
            };
            const list = [];
            list.push(
              <FeatureContainer
                project={project}
                key={feature.id}
                widget={element}
                element={element}
                sub={feature}
                type={type}
                moveWidgetOptions={moveWidgetOptions}
                onDelete={this.onDelete}
              />
            );
            return list;
          })}
        </div>
        <div className="sub-btn">
          <Button onClick={this.add} style={{ width: '100%' }}>
            {'添加'}
          </Button>
        </div>
      </div>
    );
  }
}

export default connectToStore(SubList);
