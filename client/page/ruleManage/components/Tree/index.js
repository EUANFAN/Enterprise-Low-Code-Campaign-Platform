import React, { useEffect, useState } from 'react';
import { Tree } from 'antd';
import { useObserver } from 'mobx-react-lite';
import './index.less';
import useRuleComponentEditStore from 'hook/useRuleComponentEditStore';

const getTreeData = (editorMap = {}) => {
  let arr = [];
  for(let type in editorMap) {
    let item = {
      title: type,
      key: type
    };
    for(let path in editorMap[type]) {
      !item.children && (item.children = []);
      item.children.push({
        title: path,
        key: `${type}-${path}`
      });
    }
    arr.push(item);
  }
  return arr;
};
const EditorTree = () => {
  const store = useRuleComponentEditStore();
  const [treeData, setTreeData] = useState([]);
  const handleSelect = (selectedKeys) => {
    if(selectedKeys.length <= 0 || !selectedKeys[0].includes('-')) return;
    store.handleEditorTabChange('@' + selectedKeys[0].replace(/-/ig, '/'));
  };
  useEffect(() => {
    setTreeData(getTreeData(store.editorMap));
  }, [store.editorMap]);
  return useObserver(() =>
    <Tree
      className='rule-component-edit-tree-wrapper'
      blockNode={true}
      defaultExpandAll
      onSelect={handleSelect}
      treeData={treeData}
    />
  );
};
export default EditorTree;
