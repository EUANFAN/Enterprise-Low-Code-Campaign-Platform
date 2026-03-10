import 'globals';
import React from 'react';
import { Route } from 'react-router-dom';
import { useObserver } from 'mobx-react-lite';
import Popular from './Popular';
import List from './List';

import './index.less';
import HEThemePreview from 'components/HEThemePreview';
import CreateProjectModal from '../components/CreateProjectModal';
import ThemeInfoModal from './components/ThemeInfoModal';
import CopyThemeModal from './components/CopyThemeModal';
import ExamineThemeInfoModal from './components/ExamineThemeInfo';
import CreateThemeModal from './components/CreateThemeModal';
import RemoveThemeModal from './components/RemoveThemeModal';
import ThemeGroupModal from './components/ThemeGroupModal';

import useHomeStore from 'hook/useHomeStore';

const { userInfo } = god.PageData;

const Home = () => {
  const store = useHomeStore();
  return useObserver(() => (
    <div className="index-wrapper">
      <Route exact path="/theme" component={Popular}></Route>
      <Route path="/theme/list/:themeType" component={List}></Route>

      {/* 修改模板信息弹窗 */}
      {store.renameThemeInfoModal.name && (
        <ThemeInfoModal
          name={store.renameThemeInfoModal.name}
          lastModified={store.renameThemeInfoModal.lastModified}
          createdAt={store.renameThemeInfoModal.createdAt}
          creator={store.renameThemeInfoModal.creator}
          onClose={store.renameThemeInfoModal.onClose}
          onSubmit={(e, name) => store.renameThemeInfoModal.onSubmit(name)}
        />
      )}
      {/* 复制模板弹窗 */}
      {store.copyThemeInfoModal.themeId && (
        <CopyThemeModal
          onClose={store.copyThemeInfoModal.onClose}
          onSubmit={(e, name) => store.copyThemeInfoModal.onSubmit(name)}
        />
      )}
      {/* 审核模板 */}
      {store.examineThemeInfoModal.name && (
        <ExamineThemeInfoModal
          auditButtonContent={store.examineThemeInfoModal.auditButtonContent}
          name={store.examineThemeInfoModal.name}
          statusInfo={store.examineThemeInfoModal.statusInfo}
          lastModified={store.examineThemeInfoModal.lastModified}
          createdAt={store.examineThemeInfoModal.createdAt}
          creator={store.examineThemeInfoModal.creator}
          onClose={store.examineThemeInfoModal.onClose}
          onSubmit={(e, message) =>
            store.examineThemeInfoModal.onSubmit(message)
          }
        />
      )}
      {/* 创建模板 */}
      {store.createThemeModal.show && (
        <CreateThemeModal
          showCreateThemeType={store.createThemeModal.showCreateThemeType}
          themeType={store.createThemeModal.themeType}
          themeGroupId={store.createThemeModal.themeGroupId}
          drawerData={store.drawerData}
          onClose={store.createThemeModal.onClose}
          onSubmit={(e, options) => store.createThemeModal.onSubmit(options)}
        />
      )}
      {/* 预览模板 */}
      {store.previewThemeModal.show && (
        <HEThemePreview
          onClose={store.previewThemeModal.onClose}
          themeInfo={store.previewThemeModal.themeInfo}
          onCreateProject={store.previewThemeModal.onSubmit}
        />
      )}
      {/* 移动模板 */}
      {store.removeThemeModal.show && (
        <RemoveThemeModal
          themeType={store.removeThemeModal.themeType}
          themeGroupId={store.removeThemeModal.themeGroupId}
          drawerData={store.drawerData}
          onClose={store.removeThemeModal.onClose}
          onSubmit={(options) => store.removeThemeModal.onSubmit(options)}
        />
      )}
      {/* 创建模板项目 */}
      {store.createThemeProjectModal.show && (
        <CreateProjectModal
          roles={userInfo.roles}
          componentPlat={store.createThemeProjectModal.componentPlat}
          onClose={store.createThemeProjectModal.onClose}
          onSubmit={store.createThemeProjectModal.onSubmit}
        />
      )}
      {/* 重命名模板组信息 */}
      {store.editThemeGroupModal.name && (
        <ThemeGroupModal
          name={store.editThemeGroupModal.name}
          weight={store.editThemeGroupModal.weight}
          themeCount={store.editThemeGroupModal.themeCount}
          lastModified={store.editThemeGroupModal.lastModified}
          createdAt={store.editThemeGroupModal.createdAt}
          creator={store.editThemeGroupModal.creator}
          onClose={store.editThemeGroupModal.onClose}
          onSubmit={(e, name, weight) =>
            store.editThemeGroupModal.onSubmit(name, weight)
          }
        />
      )}
    </div>
  ));
};
export default Home;
