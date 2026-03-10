import 'globals';
import './main.less';
import React from 'react';
import ReactDOM from 'react-dom';
import Moment from 'moment';
import HENavBarGroup from 'components/HENavBarGroup';
import HETable from 'components/HETable';
import HEIcon from 'components/HEIcon';
import { HEHiddenButtonGroup, HEHiddenButton } from 'components/HEHiddenButton';
import HEButton from 'components/HEButton';
import User from 'components/icons/User';
import zhCN from 'antd/lib/locale/zh_CN';
import { Layout, Modal, message, ConfigProvider } from 'antd';
import { post } from '@k9/x-com';
import { PAGE_WIDTH, PAGE_HEIGHT } from 'common/constants';
import { getLogs } from 'apis/LogAPI';
import HEPagination from 'components/HEPagination';
import BUSINESS_LIST from 'common/businessList';
import { toastError, toastLoading, closeToast } from 'components/HEToast';

const PAGE_SIZE = 10;
const Content = Layout.Content;
const PageData = god.PageData;

god.stageSize = {
  width: PAGE_WIDTH,
  height: PAGE_HEIGHT,
};
class App extends React.Component {
  state = {
    selectedLogId: '',
    current: 1,
    logList: [],
    loading: true,
    total: 0,
    rowId: '',
  };
  onGoBack = () => {
    const refferrer = document.referrer || '/';
    window.location.href = refferrer;
  };
  onRestore = (log) => {
    let project = PageData.project;

    Modal.confirm({
      title: '回滚提示',
      content: '回滚后，重新发布项目才会生效线上页面，请谨慎操作',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        post('/project/restore', {
          id: project._id,
          logId: log._id,
        }).then((rs) => {
          if (rs.errno) {
            message.error(rs.msg);
            return;
          }
          message.success('回滚成功');
        });
      },
    });
  };
  onPreview = (log) => {
    this.setState({
      selectedLogId: log._id,
    });
  };
  _handlePageChange = (event, pageNumber) => {
    if (pageNumber === this.state.current) {
      return;
    }
    this.getHistoryLogs(pageNumber);
  };
  _handleOnRow = (record) => {
    this.setState({
      rowId: record._id,
    });
  };
  setRowClassName = (record) => {
    return record._id === this.state.rowId ? 'row-selected' : '';
  };
  getHistoryLogs = async (current) => {
    let { project } = PageData;
    try {
      toastLoading('正在加载');
      const result = await getLogs(project._id, current, PAGE_SIZE);
      closeToast();
      this.setState({
        logList: result.list,
        total: parseInt(result.total),
        loading: false,
        current: parseInt(current),
      });
    } catch (err) {
      toastError(err.message);
    }
  };
  onEnter() {
    const rowId = this.state.logList[0]._id;
    this.setState((prevState) => ({
      rowId: prevState.rowId == '' ? rowId : prevState.rowId,
    }));
  }
  async UNSAFE_componentWillMount() {
    await this.getHistoryLogs(1);
    this.state.logList.length > 0 && this.onEnter();
  }
  render() {
    let me = this;
    let { project } = PageData;
    let { selectedLogId, logList: logs, current, total } = this.state;
    if (this.state.loading) {
      return null;
    }
    let href = '';
    if (project.remoteUrl) {
      href = `/customRule/${project._id}`;
    } else {
      href = BUSINESS_LIST[project.origin]
        ? `/rule/${project._id}`
        : `/editor/${project._id}`;
    }
    const columns = [
      {
        title: '操作内容',
        dataIndex: 'action',
        key: 'action',
        width: 200,
        render: (text, record) => {
          const actions = [
            {
              name: 'create',
              cn_name: '创建项目',
            },
            {
              name: 'rename',
              cn_name: '重命名',
            },
            {
              name: 'update',
              cn_name: '保存',
            },
            {
              name: 'online_test_publish',
              cn_name: '测试发布',
            },
            {
              name: 'publish',
              cn_name: '发布',
            },
            {
              name: 'move',
              cn_name: '移动',
            },
            {
              name: 'trans',
              cn_name: '转移',
            },
          ];
          const { toFolderName, ownerId } = record;
          let actionName = actions.map((action) => {
            if (text === action.name) {
              switch (action.name) {
                case 'move':
                  action.cn_name = `${action.cn_name}到我的项目`;
                  action.cn_name += toFolderName ? `>${toFolderName}` : '';
                  break;
                case 'trans':
                  action.cn_name = `${action.cn_name}给${ownerId}`;
                  break;
                default:
                  break;
              }
              return action.cn_name;
            }
          });
          return <span>{actionName}</span>;
        },
      },
      {
        title: '操作人',
        dataIndex: 'performer',
        key: 'performer',
        render: (performer) => (
          <span>
            <User className="icon-user" />
            {performer}
          </span>
        ),
      },
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (text) => (
          <span>{Moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>
        ),
      },
    ];
    if (!project.remoteUrl) {
      columns.push({
        title: '操作',
        key: '_id',
        width: 200,
        dataIndex: '_id',
        render: (text, log) => {
          return (
            <HEHiddenButtonGroup className="action-buttons">
              <HEHiddenButton onClick={() => me.onPreview(log)}>
                {'预览'}
              </HEHiddenButton>
              <HEHiddenButton onClick={() => me.onRestore(log)}>
                {'恢复当前记录'}
              </HEHiddenButton>
            </HEHiddenButtonGroup>
          );
        },
      });
    }
    return (
      <Layout className="layout">
        <HENavBarGroup showDepartmentSelect={false} />
        <div className="log__action-nav">
          <div className="log__goback" onClick={this.onGoBack}>
            <HEIcon className="icon-goback" type="icon-goback" />
            <span>返回列表</span>
          </div>
          <span style={{ color: '#E9EAED' }}>|</span>
          <span style={{ marginLeft: '16px' }}>{'操作记录'}</span>
        </div>
        <Content className="log-container">
          <div className="log-container__project-name">
            {project.name}
            <HEButton style={{ marginLeft: '10px' }}>
              <a target="" href={href} style={{ color: '#fff' }}>
                {'编辑项目'}
              </a>
            </HEButton>
          </div>
          <div
            className="log-container__table-container"
            style={project.remoteUrl ? { width: '100%' } : null}
          >
            <HETable
              onRow={(record) => {
                return { onClick: () => this._handleOnRow(record) };
              }}
              columns={columns}
              dataSource={logs}
              rowKey={(record) => record._id}
              rowClassName={this.setRowClassName}
              pagination={false}
              size={'default'}
            />

            {typeof total === 'number' &&
              typeof current === 'number' &&
              total > 1 && (
                <ConfigProvider locale={zhCN}>
                  <HEPagination
                    className="project-list-page__pagination"
                    current={current}
                    total={Math.ceil(total)}
                    onPageChange={this._handlePageChange}
                  />
                </ConfigProvider>
              )}
          </div>
          {logs.length > 0 && !project.remoteUrl && (
            <div className="previewBox">
              <div className="previewBox__container">
                <iframe
                  style={{ height: '100%', width: '100%', border: 0 }}
                  src={`${location.origin}/project/preview?id=${project._id}&log_id=${selectedLogId}`}
                />
              </div>
            </div>
          )}
        </Content>
      </Layout>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('main'));
