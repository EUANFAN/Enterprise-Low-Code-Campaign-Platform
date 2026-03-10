import 'globals';
import React from 'react';
import ReactDOM from 'react-dom';
import './main.less';
import { getAdminList } from 'apis/DataAPI';
import Dashboard from './DashBoard';
import LineBoard from './LineBoard';
import PieBoard from './PieBoard';
import { Radio, Icon } from 'antd';
import { getProjectData } from 'apis/DataAPI';
import HENavBarGroup from 'components/HENavBarGroup';
import ProjectPreviewModal from 'components/HEProjectPreview';
import HEPagination from 'components/HEPagination';
import QuestionData from '../components/QuestionData';
const dateOption = [
  {
    label: '昨天',
    value: 0,
  },
  {
    label: '今天',
    value: 1,
  },
  {
    label: '7天',
    value: 7,
  },
  {
    label: '15天',
    value: 15,
  },
  {
    label: '30天',
    value: 30,
  },
];
const LogOption = [
  {
    label: 'PV',
    value: 0,
  },
  {
    label: 'UV',
    value: 1,
  },
];
const pageData = [
  { name: '累计曝光人次（PV)', count: '--' },
  { name: '累计曝光人数（UV)', count: '--' },
  { name: '累计转发人次（PV)', count: '--' },
  { name: '累计转发人数（UV)', count: '--' },
];
const { project } = god.PageData;
const projectId = project && project._id;
export default class App extends React.Component {
  state = {
    title: '希望学',
    adminData: [
      { name: '项目总数', count: '--' },
      { name: '已发布项目总数', count: '--' },
      { name: '今日新增项目数', count: '--' },
      { name: '今日发布项目数', count: '--' },
    ],
    newAddData: [],
    publishedData: [],
    pageLog: {},
    shareLog: {},
    logData: {}, // PV,UV统计
    tableData: [], // 排行榜统计
    searchType: 7,
    logType: 0,
    previewTarget: null,
  };
  async UNSAFE_componentWillMount() {
    if (project && project._id) {
      this.setState({
        adminData: pageData,
        id: project._id,
      });
    }
    const adminData = await getAdminList(projectId);
    this.setState({
      adminData: adminData,
    });
    await this.getProjectData(
      this.state.searchType,
      this.state.logType,
      projectId
    );
  }
  onChange(e) {
    this.setState(
      {
        searchType: e.target.value,
        newAddData: [],
        publishedData: [],
        pageLog: {},
        shareLog: {},
        logData: {}, // PV,UV统计
        tableData: [], // 排行榜统计
      },
      () => {
        this.getProjectData();
      }
    );
  }
  changeLog(e) {
    this.setState(
      {
        logType: e.target.value,
        tableData: [], // 排行榜统计
      },
      () => {
        this.getProjectData();
      }
    );
  }
  async getProjectData() {
    const lineCartData = await getProjectData(
      this.state.searchType,
      this.state.logType,
      projectId
    );
    if (projectId) {
      this.setState(
        {
          title: lineCartData.title,
          pageLog: lineCartData.pageLog,
          shareLog: lineCartData.shareLog,
          tableData: lineCartData.tableData,
        },
        () => {
          this.setState({
            current: 1,
            currentRankData: this.state.tableData.slice(0, 10),
          });
        }
      );
    } else {
      this.setState(
        {
          newAddData: lineCartData.newAddData,
          publishedData: lineCartData.publishedData,
          logData: lineCartData.logData,
          tableData: lineCartData.tableData,
        },
        () => {
          this.setState({
            current: 1,
            currentRankData: this.state.tableData.slice(0, 10),
          });
        }
      );
    }
  }
  selectedProject(data) {
    this.setState({
      currentProject: data,
    });
  }
  backHome() {
    location.href = '/projects/my';
  }
  _handlePreviewClose = () => {
    this.setState({ previewTarget: null });
    if (document.body.hasAttribute('style')) {
      document.body.removeAttribute('style');
    }
  };
  _handlePreview = (data) => {
    this.setState({
      previewTarget: data.id,
      currentProject: data,
    });
    document.body.style.position = 'fixed';
  };

  _handlePageChange = (event, pageNumber) => {
    const { tableData } = this.state;
    if (pageNumber === this.state.current) {
      return;
    }
    this.setState({
      current: pageNumber,
      currentRankData: tableData.slice(pageNumber * 10 - 10, pageNumber * 10),
    });
  };

  render() {
    const {
      adminData,
      newAddData,
      logData,
      publishedData,
      tableData,
      currentProject,
      previewTarget,
      pageLog,
      shareLog,
    } = this.state;
    const { current, title, currentRankData } = this.state;
    const total = Math.ceil(tableData.length / 10);
    return (
      <div className="data">
        <HENavBarGroup showDepartmentSelect={false} />
        <div className="data__content">
          <div className="data__content__scroller">
            <div className="data__content__scroller__box">
              {projectId ? (
                <div className="data__content__header">
                  <span
                    className="header-right"
                    onClick={this.backHome.bind(this)}
                  >
                    <Icon type="left" /> 返回
                  </span>
                  {title}
                </div>
              ) : null}
              <div className="data__content__total">
                {adminData.map((item, index) => (
                  <div key={'data-item-' + index} className="data-item">
                    <p className="data-item-count">{Number(item.count)}</p>
                    <p className="data-item-name">{item.name}</p>
                  </div>
                ))}
              </div>
              <div className="data-details">
                <div className="data-details-header">
                  <span className="data-details-header__title">数据详情</span>
                  <Radio.Group
                    onChange={this.onChange.bind(this)}
                    defaultValue={7}
                    buttonStyle="solid"
                    className="data-details-header__option"
                  >
                    {dateOption.map((date) => (
                      <Radio.Button value={date.value} key={date.value}>
                        {date.label}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </div>
                {projectId ? (
                  <div>
                    <LineBoard
                      lineCartData={pageLog}
                      title="页面曝光"
                      firstTitle="页面曝光PV总数"
                      secondTitle="页面曝光UV总数"
                    ></LineBoard>
                    <LineBoard
                      lineCartData={shareLog}
                      title="页面转发"
                      firstTitle="转发PV总数"
                      secondTitle="转发UV总数"
                    ></LineBoard>
                  </div>
                ) : (
                  <div>
                    <Dashboard
                      lineCartData={newAddData}
                      title="新增项目数"
                      subTitle="新增项目总数"
                      themeColor="#FF5E50"
                    ></Dashboard>
                    <Dashboard
                      lineCartData={publishedData}
                      title="发布项目数"
                      subTitle="发布项目总数"
                      themeColor="#899ECC"
                    ></Dashboard>
                    <LineBoard
                      lineCartData={logData}
                      title="PV、UV统计"
                      firstTitle="PV总数"
                      secondTitle="UV总数"
                    ></LineBoard>
                  </div>
                )}
              </div>
              <div className="data-modules">
                <div className="data-details-header">
                  <span className="data-details-header__title">访问量排行</span>
                  <Radio.Group
                    onChange={this.changeLog.bind(this)}
                    defaultValue={0}
                    buttonStyle="solid"
                    className="data-details-header__option"
                  >
                    {LogOption.map((date) => (
                      <Radio.Button value={date.value} key={date.value}>
                        {date.label}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </div>
                <div className="data-modules__content">
                  {currentRankData && currentRankData.length ? (
                    <div>
                      <div className="data-modules__content__ranking">
                        {currentRankData.map((data, index) => (
                          <div
                            key={'ranking_' + index}
                            className={
                              currentProject && currentProject.id == data.id
                                ? 'ranking-item ranking-active'
                                : 'ranking-item'
                            }
                            onClick={
                              !projectId && this._handlePreview.bind(this, data)
                            }
                          >
                            <span className="item-com item-index">
                              {index + 1}
                            </span>
                            <span className="item-com item-name">
                              {data.name}
                            </span>
                            <span className="item-com item-user">
                              {data.user}
                            </span>
                            <span className="item-com item-user">
                              {data.count}
                            </span>
                          </div>
                        ))}
                        <HEPagination
                          className="data-modules__pagination"
                          total={total}
                          current={current}
                          onPageChange={this._handlePageChange}
                        />
                      </div>
                      <div className="data-modules__content__chart">
                        <PieBoard lineCartData={currentRankData}></PieBoard>
                      </div>
                      {previewTarget && (
                        <ProjectPreviewModal
                          id={previewTarget}
                          target="data"
                          url={`${god.location.origin}/project/preview?id=${previewTarget}`}
                          onClose={this._handlePreviewClose}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="content-tip">暂无数据</div>
                  )}
                </div>
              </div>
              <QuestionData projectId={projectId} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('main'));
