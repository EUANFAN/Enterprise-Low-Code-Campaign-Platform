import React from 'react';
import { useObserver } from 'mobx-react-lite';
import useHomeStore from 'hook/useHomeStore';
// HENavbar 头部 HENavbarPageList 头部中间的ul
import HENavBarGroup from 'components/HENavBarGroup';
import NoticeTip from 'components/NoticeTip';
import Home from './index';
import './App.less';
const App = () => {
  const store = useHomeStore();
  return useObserver(() => (
    <>
      <NoticeTip></NoticeTip>
      <div className="h5">
        <div className="h5__navbar">
          <HENavBarGroup
            showDepartmentSelect={true}
            onSelect={store.handleDepartmentSelect}
          />
        </div>
        <div className="h5__content">
          <Home />
        </div>
      </div>
    </>
  ));
};
export default App;
