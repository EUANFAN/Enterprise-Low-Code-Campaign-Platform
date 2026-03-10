import React, { Component } from 'react';
import TreeNode from '../EditorTreeNode';
import { Tree } from 'antd';
import { observer } from 'mobx-react';
import './index.less';
import classnames from 'classnames';
import { setWidgetSize } from 'common/component';

@observer
export default class EditorTree extends Component {
  state = {
    expandedKeys: [],
    collapsed: false,
  };
  get treeData() {
    const topStage = this.getCurrentProject.component.pages;
    return deep(topStage, (item, stack, deepLength, params) => {
      return {
        title: (
          <TreeNode
            item={item}
            deepLength={deepLength}
            stageStore={this.stageStore}
            {...params}
          />
        ),
        key: item.id,
        id: item.id,
        children: [],
        sourceData: item,
        path: [...stack],
        type: item.clazz,
      };
    });
  }
  componentDidMount() {
    const topStage = this.getCurrentPage.component;
    const expandedKeys = [];
    deep([topStage], (item, stack, deepLength) => {
      if (deepLength < 3) {
        expandedKeys.push(item.id);
      }
    });
    this.setState({ expandedKeys: expandedKeys });
  }
  get stageStore() {
    const store = this.props.store;
    return store.getStageStore();
  }
  get getCurrentProject() {
    return this.stageStore.getCurrentProject();
  }
  get currentState() {
    return this.stageStore.getCurrentStage();
  }
  get getCurrentPage() {
    return this.stageStore.getCurrentPage();
  }
  get selectedKeys() {
    const selectItemId = this.selectedChildren?.id;
    const selectStageId = this.currentState.component?.id;
    return [selectItemId || selectStageId];
  }
  get selectedChildren() {
    return this.currentState.getSelectedChildren()[0];
  }
  handlewidget = (props) => {
    const path = props.path;
    const flag =
      this.currentState.component.id === path[path.length - 2]?.componentId;
    if (flag) {
      this.currentState.selectChildren(props.id);
    } else {
      const item = props.path.pop();
      this.handlelayer(props, true);
      this.currentState.selectChildren(item.componentId);
    }
  };
  handlelayer = ({ path, type }, clazz) => {
    const flag =
      this.currentState.component.id === path[path.length - 1]?.componentId;
    if (!clazz && flag) {
      this.currentState.unselectChildren();
      return;
    }
    this.stageStore.setCurrentStageByPath(path, type);
    this.updateWidget();
  };
  updateWidget() {
    const topStage = this.getCurrentPage.component;
    deep([topStage], (item) => {
      if (item.hasLayers) {
        const widgetWidth = item.width;
        const widgetHeight = item.height;
        if (!item.fixHeight) {
          let heightSetting = 'handAdjust';
          if (item.layout == 'flow') {
            heightSetting = 'autoAdjust';
          }
          // 瀑布流布局的容器，layer页面高度自动调整
          // 拖拽布局的容器,如果layer页面高度高于widget高度,那么layer高度不变
          // 如果layer页面高度低于widget高度，则layer页面高度和widget高度保持一致
          item.layers.forEach((layer) => {
            layer.width = widgetWidth;
            layer.height =
              widgetHeight > layer.height ? widgetHeight : layer.height;
            layer.heightSetting = heightSetting;
            layer.widgets.forEach((currentWidget) => {
              currentWidget.pageHeight = layer.height;
              currentWidget.pageWidth = layer.width;
            });
          });
        }
        setWidgetSize(this.getCurrentProject, item);
      }
    });
  }
  handlepage = (props) => {
    this.handlelayer(props);
    // this.getCurrentProject.selectChildren(props.id);
  };
  handleSelect = (selectedKeys, { selectedNodes }) => {
    if (selectedKeys.length) {
      const props = selectedNodes.find((item) =>
        selectedKeys.includes(item.key)
      ).props;
      this[`handle${props.type}`](props);
    }
  };
  handleExpand = (
    first,
    {
      expanded,
      node: {
        props: { id: expandedKeys },
      },
    }
  ) => {
    if (expanded) {
      this.setState((state) => ({
        ...state,
        expandedKeys: state.expandedKeys.concat(expandedKeys),
      }));
    } else {
      this.setState((state) => ({
        ...state,
        expandedKeys: state.expandedKeys.filter((key) => key !== expandedKeys),
      }));
    }
  };
  toggleCollapsed = () => {
    this.setState({ collapsed: !this.state.collapsed });
  };
  render() {
    return (
      <div
        className={classnames({
          editorTree_container: true,
          editorTree_active: this.state.collapsed,
        })}
      >
        <div className="editorTree_container_tree">
          <Tree
            blockNode
            onExpand={this.handleExpand}
            className="editorTree_tree"
            onSelect={this.handleSelect}
            expandedKeys={this.state.expandedKeys}
            selectedKeys={this.selectedKeys}
            treeData={this.treeData}
            // filterTreeNode={(node) => {
            //   return this.selectedKeys.includes(node.props.id);
            // }}
          />
        </div>
      </div>
    );
  }
}
function deep(
  topStage,
  callback = () => {},
  deepLength = 1,
  stack = [{ type: 'project' }]
) {
  const normalPage = [],
    flowPage = [],
    stage = topStage.slice();
  for (let i = 0; i < stage.length; i++) {
    const item = topStage[i];
    let nextIndex = i,
      prevIndex = i,
      layout = item.layout;
    while (stage[++nextIndex] && stage[nextIndex].layout !== layout) {
      nextIndex += 0;
    }
    while (stage[--prevIndex] && stage[prevIndex].layout !== layout) {
      prevIndex += 0;
    }
    stack.push({ componentId: item.id, type: item.clazz });
    let obj =
      callback(item, stack, deepLength, {
        next: (nextIndex < stage.length ? stage[nextIndex] : item).id,
        prev: (prevIndex >= 0 ? topStage[prevIndex] : item).id,
      }) || {};
    if (item.hasLayers) {
      obj.children = deep(item.layers, callback, deepLength + 1, stack);
    } else if (item.widgets?.length > 0) {
      obj.children = deep(item.widgets, callback, deepLength + 1, stack);
    }
    stack.pop();
    item.layout === 'normal' ? normalPage.push(obj) : flowPage.push(obj);
  }
  return [...flowPage, ...normalPage];
}
