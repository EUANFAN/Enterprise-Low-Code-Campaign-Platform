import React, { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import { Icon } from 'antd';
import ControlWrapConfig from './components/ControlWrapConfig';
import './app.less';
import HEEditor from 'components/HEEditor';
import NavBar from './components/Navbar';
import Search from './components/Search';
import CreateRuleComponentModal from './components/CreateRuleComponentModal';
import PublishRuleModal from './components/publishRuleModal';
import useRuleComponentEditStore from 'hook/useRuleComponentEditStore';
import { Spin } from 'antd';
import EditorLeftTabContainer from '@/page/editor/components/EditorLeftContainer';
import Tree from './components/Tree';

const tabConfig = [{
  title: '组件',
  icon: <Icon type="layout" />,
  show: true
},
{
  title: '文件',
  icon: <Icon type="switcher" />,
  show: true
}];
export default function App(props) {
  const store = useRuleComponentEditStore();
  const [currentTab, setCurrentTab] = useState('组件');
  useEffect(() => {
    store.analysisQuery({ history: props.history });
  }, []);
  return useObserver(() => {
    const ruleComponent = store.index;
    const tab = store.tab;
    const type = tab.split('/')[0].slice(1);
    const path = tab.split('/').slice(1).join('/');
    let value = store.editorMap[type]?.[path] || '';
    if(path.endsWith('.json') && typeof value === 'object') {
      value = JSON.stringify(value, null, 2);
    }
    return (
      <div className="app">
        <NavBar></NavBar>
        <Spin spinning={store.loading.isLoading} tip={store.loading.tip} wrapperClassName="wrapContent">
          <div className="container">
            <div className="app-left">
              <EditorLeftTabContainer onChange={setCurrentTab} tabConfig={tabConfig} currentTab={currentTab}>
                { currentTab === '组件' && <Search></Search> }
                {currentTab === '文件' && <Tree store={store} />}
              </EditorLeftTabContainer>
            </div>
            <div className="app-context">
              <HEEditor value={value} onChange={store.updateEditorValue} />
            </div>
            <div className="app-preview">
              <ControlWrapConfig ruleComponent={ruleComponent} />
            </div>
          </div>
          {/* 创建规则组件 */}
          {store.createRuleComponetModal.show && (
            <CreateRuleComponentModal
              onSubmit={store.createRuleComponetModal.onSubmit}
            />
          )}
          {/* 发布弹框 */}
          {store.publishRuleComponentModal && (
            <PublishRuleModal
              accessToken={store.getAccessToken}
              onClose={store.publishRuleComponent.onClose}
              onSubmit={store.publishRuleComponent.onSubmit}
            />
          )}
        </Spin>
      </div>
    );
  });
}
