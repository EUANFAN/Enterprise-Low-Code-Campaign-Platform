import React from 'react';
import { Table } from 'antd';
import QuestionPreviewModal from 'components/HEQuestionPreview';
import {
  getQuestionsList,
  getQuestionsDetail,
  getExcelListByUser,
  generateExcel,
} from 'apis/QuestionAPI';
import { toastError, toastSuccess } from 'components/HEToast';

import './index.less';

export default class QuestionData extends React.Component {
  _iframes = null;
  downloading = false;
  downloadTimer = null;
  state = {
    previewCompleted: false, // 预览展示控制
    showDropdownList: false, // 下拉展示控制
    total: 10, // 总数
    pageSize: 10, // 每页数量
    columns: [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
      },
      {
        title: '用户id',
        dataIndex: 'userId',
        key: 'userId',
      },
      {
        title: '填写时间',
        dataIndex: 'time',
        key: 'time',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        // eslint-disable-next-line react/display-name
        render: (text, record) => (
          <a onClick={() => this.handlePreview(text, record)}>查看</a>
        ),
      },
    ],
    downloadList: [],
    dataSource: [],
    sGroupId: null,
  };

  // 预览
  handlePreview = async (text, record) => {
    const {
      data: {
        detail: { question_content: questionDetail },
        nextId: nextPageId,
      },
    } = await this.getQuestionsDetail(record.id);
    // 拿到详情之后调用预览iframe所挂在的渲染方法
    this.setState(
      {
        previewCompleted: true,
        nextPageId,
      },
      () => {
        this._iframes.renderQuestionData(
          JSON.parse(questionDetail.replace(/\n/g, '\\n'))
        );
      }
    );
  };

  // 预览关闭
  handlePreviewClose = () => {
    this.setState({
      previewCompleted: false,
    });
  };

  // 预览下一页
  handleNextPreview = async () => {
    const { nextPageId } = this.state;
    if (nextPageId === 0) {
      toastError('已经是最后一个啦~');
      return;
    }
    const {
      data: {
        detail: { question_content: questionDetail },
        nextId,
      },
    } = await this.getQuestionsDetail(nextPageId);
    this.setState(
      {
        nextPageId: nextId,
      },
      () => {
        this._iframes.renderQuestionData(
          JSON.parse(questionDetail.replace(/\n/g, '\\n'))
        );
      }
    );
  };

  // 下载历史的下拉
  handleToggleDropdownList = (e) => {
    e.nativeEvent.stopImmediatePropagation();
    this.setState({
      showDropdownList: !this.state.showDropdownList,
    });
  };

  // 下拉关闭
  handleDropdownListClose = () => {
    this.setState({
      showDropdownList: false,
    });
  };

  // 改变分页
  handleChangePage = async (page) => {
    const { data: dataSource, total } = await this.getQuestionsListByPage(page);
    this.setState({ dataSource, total });
  };

  handleDownloadFile = (href) => {
    god.location.href = href;
  };

  // 导出excel
  handleDownloadExcel = async () => {
    if (this.downloading) {
      toastSuccess('生成中，请不要退出，稍后自动下载');
      return;
    }
    this.downloading = true;
    const { projectId } = this.props;
    const {
      userInfo: { userId },
      project: { name },
    } = god.PageData;
    const { sGroupId } = this.state;

    const downloadRes = await generateExcel({
      sGroupId,
      projectId,
      userId,
      taskName: name,
    });
    if (downloadRes.code === 0) {
      toastSuccess('生成中，请不要退出，稍后自动下载');
      god.localStorage.setItem('downloadTaskId', downloadRes.data.taskId);
      this.rotationDownloadTask(downloadRes.data.taskId);
    } else {
      toastError(`导出失败:${downloadRes.msg}`);
    }
  };

  // 轮训任务
  rotationDownloadTask = (taskId) => {
    this.downloadTimer = setInterval(async () => {
      console.log('轮训下载中', taskId);
      const data = await this.getExcelListByUser();
      const taskStatus = this.getExcelStatus(taskId, data);
      this.setState({ downloadList: data });
      if (taskStatus) {
        clearInterval(this.downloadTimer);
        this.handleDownloadFile(taskStatus);
        god.localStorage.setItem('downloadTaskId', '');
        this.downloading = false;
        console.log('轮训完成', taskId);
      }
    }, 10000);
  };

  // 获取任务生成状态
  getExcelStatus(taskId, data) {
    taskId = Number(taskId);
    const task = data.find((item) => item.taskId === taskId);
    if (task && task.taskStatus === 'download') {
      return task.downUrl;
    }
    return false;
  }

  // 阻止下拉的冒泡
  dropdownListStopPropagation(e) {
    e.nativeEvent.stopImmediatePropagation();
  }

  // 获取数据列表
  async getQuestionsListByPage(page) {
    const { projectId } = this.props;
    const { pageSize, sGroupId } = this.state;
    const {
      data: { list, total },
    } = await getQuestionsList({ sGroupId, projectId, page, pageSize });
    // 加个key键
    list.forEach((item) => {
      item.key = item.id;
    });
    return {
      data: list,
      total,
    };
  }

  // 获取问卷详情数据
  async getQuestionsDetail(id) {
    const { projectId } = this.props;
    const { sGroupId } = this.state;
    const res = await getQuestionsDetail({ sGroupId, projectId, id });
    return res;
  }

  // 获取历史任务列表
  async getExcelListByUser() {
    const { projectId } = this.props;
    const {
      userInfo: { userId },
    } = god.PageData;
    const { sGroupId } = this.state;
    const {
      data: { list },
    } = await getExcelListByUser({ sGroupId, projectId, userId });
    return list;
  }

  // 获取上次生成未下载任务，打开下拉框
  async getHistoryNotDownload(historyList) {
    const downloadTaskId = god.localStorage.getItem('downloadTaskId');
    if (!downloadTaskId) return;
    const downloadRes = this.getExcelStatus(downloadTaskId, historyList);
    if (downloadRes) {
      this.setState({ showDropdownList: true });
      god.localStorage.setItem('downloadTaskId', '');
    }
  }

  componentDidMount() {
    let sGroupId = null;
    try {
      sGroupId =
        god.PageData.project.revisionData.variableStore.PAGE_VARIABLE.sGroupId;
    } catch (error) {
      console.log('sgroupId error');
    }

    this.setState(
      {
        sGroupId,
      },
      async () => {
        if (sGroupId) {
          // 获取数据列表
          const { data: dataSource, total } = await this.getQuestionsListByPage(
            1
          );

          // 获取历史任务列表
          const downloadList = await this.getExcelListByUser();
          this.getHistoryNotDownload(downloadList);
          this.setState({ dataSource, total, downloadList });
          // 点击其他位置的时候关闭下拉
          document.addEventListener('click', () => {
            if (this.state.showDropdownList) {
              this.setState({
                showDropdownList: false,
              });
            }
          });
        }
      }
    );
  }

  render() {
    const {
      previewCompleted,
      showDropdownList,
      columns,
      total,
      pageSize,
      dataSource,
      downloadList,
      sGroupId,
    } = this.state;
    const { projectId } = this.props;
    const url = `${location.origin}/project/preview?id=${projectId}`;

    // 在没有sGroupId 和没有取到数据时，不展示问卷列表
    if (!sGroupId || dataSource.length === 0) return <div />;

    let downloadListDom;
    if (downloadList.length > 0) {
      downloadListDom = downloadList.map((item) => {
        return (
          <ul className="list-item" key={item.taskId}>
            <li className="header-name">{item.taskName}</li>
            <li className="header-time">{item.createdTime}</li>
            <li className="header-schedule">
              {item.taskStatus === 'download' ? '已完成' : '下载中'}
            </li>
            <li className="header-operate">
              {item.taskStatus === 'download' ? (
                <span
                  className="history-download"
                  onClick={this.handleDownloadFile.bind(this, item.downUrl)}
                >
                  保存至本地
                </span>
              ) : (
                '-'
              )}
            </li>
          </ul>
        );
      });
    } else {
      downloadListDom = <p>暂无历史数据</p>;
    }

    return (
      <div className="question-data">
        <div className="question-header">
          <div className="question-title">问卷调查数据</div>
          <div className="question-operate">
            <div
              className="operate-download"
              onClick={this.handleDownloadExcel}
            >
              导出
            </div>
            <div className="operate-dropdown">
              <div
                className="dropdown-button"
                onClick={this.handleToggleDropdownList}
              >
                导出列表
              </div>
              {showDropdownList && (
                <div
                  className="dropdown-list"
                  onClick={this.dropdownListStopPropagation}
                >
                  <div className="packup">
                    <span
                      className="packup-button"
                      onClick={this.handleDropdownListClose}
                    >
                      收起
                    </span>
                  </div>
                  {downloadList.length > 0 && (
                    <ul className="list-header">
                      <li className="header-name">名称</li>
                      <li className="header-time">下载时间</li>
                      <li className="header-schedule">下载进度</li>
                      <li className="header-operate">操作</li>
                    </ul>
                  )}
                  {downloadListDom}
                </div>
              )}
            </div>
          </div>
        </div>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={{
            total,
            pageSize,
            onChange: this.handleChangePage,
          }}
        />
        {previewCompleted && (
          <QuestionPreviewModal
            url={url}
            onClose={this.handlePreviewClose}
            nextPreview={this.handleNextPreview}
            ref={(el) => (this._iframes = el)}
          />
        )}
      </div>
    );
  }
}
