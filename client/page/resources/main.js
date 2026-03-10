import 'globals';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import zhCN from 'antd/lib/locale/zh_CN';
import { ConfigProvider } from 'antd';
import App from './App';
import ConfirmProvider from 'components/Provider/ConfirmProvider';
const { userInfo } = god.PageData;
god.inResources = true;

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <ConfirmProvider>
      <BrowserRouter>
        <App userInfo={userInfo} />
      </BrowserRouter>
    </ConfirmProvider>
  </ConfigProvider>,
  document.getElementById('main')
);
