import 'globals';
import React from 'react';
import ReactDOM from 'react-dom';
import HENavBarGroup from 'components/HENavBarGroup';
import { Layout } from 'antd';

const Content = Layout.Content;

class App extends React.Component {
  render() {
    return (
      <Layout className="layout">
        <HENavBarGroup showDepartmentSelect={false} />
        <Content style={{ padding: '0 50px', backgroundColor: '#fff' }}>
          <div
            style={{
              margin: '50px 0',
              border: 'solid 1px #d9d9d9',
              textAlign: 'center',
              lineHeight: '50px',
            }}
          >
            <span style={{ fontSize: '16px' }}>{god.PageData.status}</span>
            {god.PageData.msg}
          </div>
        </Content>
      </Layout>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('main'));
