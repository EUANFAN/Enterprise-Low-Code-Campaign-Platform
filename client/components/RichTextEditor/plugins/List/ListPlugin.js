import React from 'react';
import EditList from 'slate-edit-list';
import { ListTypes } from './constants';
import List from './List.js';
import { Map } from 'immutable';
import {
  NumberListItem,
  AlphabetListItem,
  CircleListItem,
} from './ListItem.js';

const { LIST_ITEM, ORDERED_LIST, UNORDERED_LIST } = ListTypes;
const {
  utils: SlateListUtils,
  changes: SlateListChanges,
  ...others
} = EditList();

export const utils = SlateListUtils;
export const changes = {
  ...SlateListChanges,
  setCurrentList(change, properties) {
    const currentList = SlateListUtils.getCurrentList(change.value);
    const listData = currentList.data || Map();

    change.setNodeByKey(currentList.key, {
      data: listData.mergeDeep(properties),
    });
  },
};
export default {
  ...others,
  shouldNodeComponentUpdate(prevProps, nextProps) {
    const { node: prevNode, parent: prevParent } = prevProps;
    const { node: nextNode, parent: nextParent } = nextProps;

    if (
      nextNode.type !== LIST_ITEM ||
      prevNode.type !== LIST_ITEM ||
      nextParent.type !== ORDERED_LIST ||
      prevParent.type !== ORDERED_LIST
    ) {
      // Return any falsy other then false will go through default update check
      return null;
    }
    if (nextParent.data !== prevParent.data) {
      return true;
    }

    const nextIndex = nextParent.nodes.findIndex((item) => item === nextNode);
    const prevIndex = prevParent.nodes.findIndex((item) => item === prevNode);

    if (prevIndex === nextIndex) {
      return null;
    }

    return true;
  },
  renderNode(props) {
    const { node, children } = props;
    switch (node.type) {
      case UNORDERED_LIST:
      case ORDERED_LIST: {
        const { data } = node;

        return (
          <List {...props}>
            {React.Children.map(children, (child, index) => {
              return React.cloneElement(child, {
                index,
                listType: data.get('type'),
                decoratorSize: data.get('decoratorSize'),
                padding: data.get('padding'),
              });
            })}
          </List>
        );
      }
      case LIST_ITEM: {
        const {
          type: parentType,
          data: parentData,
          nodes: parentNodes,
        } = props.parent;

        const itemType = parentData.get('type');
        const index =
          parentType === ORDERED_LIST
            ? parentNodes.findIndex((item) => item === props.node)
            : undefined;

        const Tag =
          itemType === 'number'
            ? NumberListItem
            : itemType === 'alphabet'
            ? AlphabetListItem // eslint-disable-line
            : CircleListItem; // eslint-disable-line

        return (
          <Tag
            index={index}
            {...props.attributes}
            decoratorSize={parentData.get('decoratorSize')}
            padding={parentData.get('padding')}
            parent={props.parent}
            node={props.node}
          >
            {props.children}
          </Tag>
        );
      }
    }
  },
};
