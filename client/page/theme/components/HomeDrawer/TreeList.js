import React from 'react';
import { useObserver } from 'mobx-react-lite';
import { Tree } from 'antd';
import useHomeStore from 'hook/useHomeStore';
import HEThemeActionBar from 'components/HEThemeActionBar';
const { TreeNode, DirectoryTree } = Tree;

const createrGoupList = (store, parentIndex, group, history) => {
  return group.map((item) => {
    return (
      <TreeNode
        key={parentIndex + '-' + item._id}
        isLeaf
        icon={() => null}
        title={
          <HEThemeActionBar
            name={item.name}
            isGroup={true}
            onDelete={() => store.deleteThemeGroup({ group: item._id })}
            onSelect={async () => {
              history.push('/theme');
              store.setThemeTypeAndThemeGroup({
                themeType: parentIndex,
                themeGroup: item._id,
              });
              const list = await store.getThemeList({ themeGroupId: item._id });
              store.setThemeListMap(parentIndex, list);
              setTimeout(() => {
                document.querySelector('.swiperlist-' + parentIndex) &&
                  document
                    .querySelector('.swiperlist-' + parentIndex)
                    .scrollIntoView();
              });
            }}
            onEdit={() =>
              store.editThemeGroup({ ...item, themeCount: item.metadata.count })
            }
          ></HEThemeActionBar>
        }
      ></TreeNode>
    );
  });
};
const createDrawList = (store, history) => {
  return (
    store.drawerData.length > 0 &&
    store.drawerData.map((item) => {
      const { groups, key, name } = item;
      return (
        <TreeNode
          icon={() => null}
          key={key}
          title={
            <HEThemeActionBar
              name={name}
              isGroup={false}
              isSelectedThemeType={
                store.themeType == item.key && !store.themeGroup
              }
              onAudit={() =>
                store.createThemeType({
                  currentTempleteData: {
                    ...item,
                    title: '更新模板类别',
                    isCreateTheme: false,
                    keyIds: key,
                  },
                })
              }
              onDelete={() => store.deleteThemeType({ category: item._id })}
              onCreate={() => store.createThemeGroup(item)}
              onSelect={() => {
                history.push('/theme');
                store.setThemeTypeAndThemeGroup({
                  themeType: item.key,
                  themeGroup: '',
                });
                setTimeout(() => {
                  document.querySelector('.swiperlist-' + item.key) &&
                    document
                      .querySelector('.swiperlist-' + item.key)
                      .scrollIntoView();
                });
              }}
            ></HEThemeActionBar>
          }
        >
          {groups &&
            groups.length > 0 &&
            createrGoupList(store, key, groups, history)}
        </TreeNode>
      );
    })
  );
};
const TreeList = (props) => {
  const store = useHomeStore();
  return useObserver(() => {
    let defaultSelectedKey = store.themeType;
    if (store.themeGroup) {
      defaultSelectedKey += '-' + store.themeGroup;
    }
    const defaultSelectedKeys = [defaultSelectedKey];

    return (
      <DirectoryTree
        blockNode={true}
        className="he-drawer-section__container"
        defaultSelectedKeys={defaultSelectedKeys}
        defaultExpandedKeys={defaultSelectedKeys}
        selectedKeys={defaultSelectedKeys}
      >
        {createDrawList(store, props.history)}
      </DirectoryTree>
    );
  });
};

export default TreeList;
