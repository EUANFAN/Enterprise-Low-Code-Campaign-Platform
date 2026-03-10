import React from 'react';
const { useObserver } = require('mobx-react-lite');
import { HENavbar } from 'components/HENavbar';
import HEIconButton from 'components/HEIconButton';
import Save from 'components/icons/Save';
import Send from 'components/icons/Send';
import Preview from 'components/icons/Preview';
import Format from 'components/icons/Format';
import './index.less';
import useRuleComponentEditStore from 'hook/useRuleComponentEditStore';

const NavBar = () => {
  const store = useRuleComponentEditStore();
  const backFunc = () => {
    location.href = '/theme';
  };
  return useObserver(() => <>
    <HENavbar
      className='rule-component-edit-navbar-wrapper'
      backFunc={backFunc}
      actionElement={
        <>
           <HEIconButton
             iconElement={<Format />}
             titleElement='格式化'
             onClick={() => store.handleFormat()}
           />
          <HEIconButton
            iconElement={<Save />}
            titleElement='保存'
            onClick={ store.handleSave}
          />
          <HEIconButton
            iconElement={<Preview />}
            titleElement='预览'
            onClick={store.handlePreview}
          />
          <HEIconButton
            iconElement={<Send />}
            titleElement='发布'
            onClick={store.handleSend}
          />
        </>
      }>
      <p className="rule-component-edit-navbar-title">规则组件配置</p>
    </HENavbar>
  </>);
};
export default NavBar;