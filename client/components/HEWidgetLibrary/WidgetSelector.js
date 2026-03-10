import React from 'react';
import { observer } from 'mobx-react';
import { fetchJSON } from 'apis/BaseAPI';
import {
  getProjectComponentTypes,
  setProjectComponentVersion,
} from 'common/component';
import { loadTriggerConfig } from 'triggers';
import {
  message,
  Button,
  Modal,
  Input,
  Table,
  ConfigProvider,
  Select,
  Row,
} from 'antd';
import store from 'store/stage';
import { toggleComponent } from 'common/componentsAction';
import { toastSuccess } from 'components/HEToast';
import HETagPanel from 'components/HETagPanel';
import noFile from 'components/imgs/nofile.png';
import { getTagList } from 'apis/TagAPI';
import classnames from 'classnames';
import './index.less';
import HEComponentInfoPreview from 'components/HEComponentInfoPreview';
import { getWidgetRole } from 'common/utils';

const Search = Input.Search;
const confirm = Modal.confirm;
let stageStore;
let triggerOrwidgetObjs = {};


const customizeRenderEmpty = () => (
  // 这里面就是我们自己定义的空状态
  <div className="trigger-null">
    <img className="trigger-null__img" src={noFile} />
    <p>当前项目没有使用行为组件呦，快去使用吧～</p>
  </div>
);
const featureType = {
  通用组件: 'common',
  业务组件: 'custom',
};
const featureTypeKey = {
  common: '通用组件',
  custom: '业务组件'
};
const purposeType = {
  已使用组件: 'onlyUsed',
  已经安装组件: 'onlySetuped',
};
@observer
class WidgetSelector extends React.Component {
  currentRef = React.createRef();
  state = {
    widgetSeletorVisible: false,
    pagination: {
      defaultPageSize: 8,
    },
    loading: false,
    current: 1,
    totalCount: 0,
    widgets: [],
    q: '',
    tagType: '',
    onlySetuped: false,
    onlyUsed: false,
    type: 'action', // 组件类型选择
    selectWidget: {},
    changedWidgets: [],
    tagList: [],
    componentTypeList: {
      componentType: [],
    },
    purposeList: {
      purpose: [
        {
          type: 'common',
          name: '已使用组件',
          _id: '已使用组件',
        },
        {
          type: 'custom',
          name: '已经安装组件',
          _id: '已经安装组件',
        },
      ],
    },
    featureList: {
      feature: [
        {
          type: 'common',
          name: '通用组件',
          _id: '通用组件',
        },
        {
          type: 'custom',
          name: '业务组件',
          _id: '业务组件',
        },
      ],
    },
    selectedTags: [],
    descUrl: '',
    isShowComponentInfoPreview: false,
    showTagTitle: false,
    selectedType: 'all'
  };
  // 获取widgetlist
  getWidgetsList = (type, onlySetuped, onlyUsed, q) => {
    // 获取当前页面内使用的组件
    let stageStore = store.getStageStore();
    let usedComponents = Object.keys(stageStore.getUsedComponents() || {});
    if (!usedComponents.length && onlyUsed) {
      this.setState({
        widgets: [],
        pagination: false,
      });
    } else {
      this.fetch({
        current: 1,
        q,
        type,
        onlySetuped,
        onlyUsed: onlyUsed ? usedComponents : null,
      });
    }
  };

  // onOnlyUsedComponent = (e) => {
  //   let onlyUsed = e.target.checked;
  //   this.setState({
  //     onlyUsed,
  //   });
  //   this.getWidgetsList(this.state.type, this.state.onlySetuped, onlyUsed);
  // };
  // onOnlySetupedComponent = (e) => {
  //   let onlySetuped = e.target.checked;
  //   this.setState({
  //     onlySetuped,
  //   });
  //   this.getWidgetsList(this.state.type, onlySetuped, this.state.onlyUsed);
  // };
  initRole() {
    const { showTagTitle, selectedType } = getWidgetRole('TriggerWidget');
    if (selectedType)
      this.setState({
        showTagTitle
      }, () => {
        selectedType != 'all' && this.handlefeature([featureTypeKey[selectedType]]);
      });
  }
  show = () => {
    this.setState({
      widgetSeletorVisible: true,
      pagination: {
        defaultPageSize: 8,
      },
      loading: false,
      current: 1,
      totalCount: 0,
      widgets: [],
      q: '',
      onlySetuped: false,
      type: 'action',
    });

    this.fetch();
  };

  cancel = () => {
    this.setState({
      widgetSeletorVisible: false,
    });
  };

  handleTableChange = (pagination) => {
    let pager = { ...this.state.pagination };
    let { onlyUsed } = this.state;
    let usedComponents = Object.keys(stageStore.getUsedComponents() || {});
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.fetch({
      current: pagination.current,
      onlyUsed: onlyUsed ? usedComponents : null,
    });
  };

  fetch = (params = { current: 1 }) => {
    this.setState({
      loading: true,
    });
    stageStore = store.getStageStore();
    let usedComponents = Object.keys(stageStore.getUsedComponents() || {});
    fetchJSON('/widget/list', {
      method: 'post',
      q: this.state.q,
      tagType: this.state.tagType,
      onlySetuped: this.state.onlySetuped,
      onlyUsed: this.state.onlyUsed ? usedComponents : null,
      type: this.state.type,
      selectedTags: this.state.selectedTags,
      ...params,
    }).then((data) => {
      const pagination = { ...this.state.pagination };
      pagination.total = data.totalCount;
      pagination.current = data.current;
      data.widgets.map((item) => {
        if (this.state.changedWidgets.hasOwnProperty(item.type)) {
          item.value = this.state.changedWidgets[item.type];
        }
      });
      let query = {
        loading: false,
        widgets: data.widgets,
        pagination,
      };
      if (params.q != undefined) {
        query.q = params.q || '';
      }
      if (params.type != undefined) {
        query.type = params.type;
      }

      query.onlySetuped = data.onlySetuped;

      this.setState(query);
    });
  };

  onSearch = (value) => {
    this.getWidgetsList(
      this.state.type,
      this.state.onlySetuped,
      this.state.onlyUsed,
      value
    );
  };

  toggleSetup = (record, setup) => {
    let me = this;
    let project = this.props.project;
    this.setState({
      loading: true,
    });
    // 如果卸载，需要判断当前页面是否正在使用此组件
    if (!setup) {
      let useTypes = {};
      let types = getProjectComponentTypes(project);
      for (let typeName in types) {
        if (types[typeName]) {
          useTypes[typeName] = types[typeName];
        }
      }
      if (useTypes[record.type]) {
        message.info('当前页面正在使用此组件, 请勿删除！');
        this.setState({
          loading: false,
        });
        return false;
      }
    }

    toggleComponent(record, setup).then(() => {
      let title, desc;
      if (setup) {
        title = '应用成功';
        desc = '当前组件已经应用到项目配置选项里。';
      } else {
        title = '卸载成功';
        desc = '当前组件已成功从项目配置选项里清除。';
      }
      toastSuccess(title, 2000, desc);
      me.setState({
        loading: false,
      });
    });
  };

  update = (record) => {
    let me = this;
    confirm({
      title: '确认',
      content:
        '你真的将' +
        '【' +
        record.name +
        '】' +
        '组件更新到' +
        record.version +
        '版本吗？',
      cancelText: '取消',
      okText: '确认',
      async onOk() {
        me.setState({
          loading: true,
        });
        let currentStage = stageStore.getCurrentProject();
        await loadTriggerConfig({
          type: record.type,
          version: record.version,
        });
        // 替换已使用的组件version
        setProjectComponentVersion(currentStage.component, record);
        stageStore.updateInstallComponents(record, true);
        if (me.state.loading) {
          me.setState({
            loading: false,
          });
        }
      },
    });
  };

  onChange = (record, value) => {
    const dataWidgets = this.state.widgets;
    const changedWidgets = this.state.changedWidgets;
    dataWidgets.map((item) => {
      if (item.type == record.type) {
        item.value = value;
        changedWidgets[record.type] = value;
      }
    });
    this.setState({
      widgets: dataWidgets,
      changedWidgets,
    });
  };
  async UNSAFE_componentWillMount() {

    this.show();
    const { list } = await getTagList('action');
    this.setState({
      tagList: list,
    });
    this.initRole();
  }
  handlefeature = (selectedTags) => {
    this.setState(
      {
        tagType: featureType[selectedTags[0]] || '',
        selectedTags: [],
        componentTypeList: {
          componentType: this.state.tagList[featureType[selectedTags[0]]],
        },
      },
      () => {
        const current = this.currentRef.current;
        if (current) {
          current.onSelectAll();
        }
        this.fetch();
      }
    );
  };
  handlecomponentType = (selectedTags) => {
    this.setState(
      {
        selectedTags: selectedTags,
      },
      () => {
        this.fetch();
      }
    );
  };
  handlepurpose = (selectedTags) => {
    const keys = Object.keys(purposeType);
    const state = keys.reduce((memo, key) => {
      const value = purposeType[key];
      memo[value] = selectedTags.includes(key);
      return memo;
    }, {});

    this.setState(state, () => {
      this.fetch();
    });
  };
  getWidgetByTag(selectedTags, type) {
    this[`handle${type}`](selectedTags);
  }
  _handleIconClick = (widget, e) => {
    e.stopPropagation();
    this.setState({
      isShowComponentInfoPreview: widget.descUrl && true,
      descUrl: widget.descUrl,
    });
  };
  render() {
    let me = this;
    const { isShowComponentInfoPreview, descUrl, showTagTitle } = this.state;
    if (!this.state.loading) {
      stageStore = store.getStageStore();
      triggerOrwidgetObjs = stageStore.getUsedComponents() || {};
    }
    const columns = [
      {
        title: '行为组件名称',
        dataIndex: 'name',
        width: '15%',
        render(text) {
          return text;
        },
      },
      {
        title: '组件说明',
        dataIndex: 'desc',
        width: '15%',
        render(text, widget) {
          return (
            <span
              onClick={me._handleIconClick.bind(me, widget)}
              key={widget._id}
              className={classnames({
                'action-active': Boolean(widget.descUrl),
              })}
            >
              {text}
            </span>
          );
        },
      },
      {
        title: '组件ID',
        dataIndex: 'type',
        width: '15%',
        render(text) {
          return <span>{text}</span>;
        },
      },
      {
        title: '类型',
        dataIndex: 'tags',
        width: '15%',
        render(text) {
          return (
            <span>
              {text && text.length
                ? text.map((item) => item.name).join(',')
                : '其他'}
            </span>
          );
        },
      },
      {
        title: '当前使用版本',
        dataIndex: 'downVersion',
        width: '15%',
        render(text, record) {
          let isUpdate =
            record.isSetuped &&
            triggerOrwidgetObjs[record.type] &&
            record.version &&
            triggerOrwidgetObjs[record.type] != record.version;
          return (
            <React.Fragment>
              <span>
                {(record.isSetuped && triggerOrwidgetObjs[record.type]) || '无'}
              </span>
              {isUpdate ? (
                <span
                  className="action-tag"
                  onClick={me.update.bind(me, record)}
                >
                  可更新
                </span>
              ) : null}
            </React.Fragment>
          );
        },
      },
      {
        title: '指定版本',
        dataIndex: 'history',
        width: '10%',
        render(text, record) {
          if (!record.isSetuped || !triggerOrwidgetObjs[record.type]) {
            return <span>{record.version}</span>;
          }
          // 未安装的组件可以通过其指定组件安装，已安装且使用的组件可以通过其修改组件版本
          let value =
            record.value ||
            triggerOrwidgetObjs[record.type] ||
            record.historys[0].version;
          return (
            <div>
              <Select
                defaultValue={value}
                onChange={me.onChange.bind(me, record)}
              >
                {record.historys.map((item, index) => (
                  <Select.Option key={index} value={item.version}>
                    {item.version}
                  </Select.Option>
                ))}
              </Select>
            </div>
          );
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '15%',
        render(text, record) {
          let btns = [];
          if (record.isSetuped) {
            btns.push(
              <Button
                key="setup"
                onClick={me.toggleSetup.bind(me, record, false)}
              >
                {'卸载'}
              </Button>
            );
          } else {
            btns.push(
              <Button
                key="setuped"
                type="primary"
                onClick={me.toggleSetup.bind(me, record, true)}
              >
                {'应用'}
              </Button>
            );
          }
          if (
            record.isSetuped &&
            triggerOrwidgetObjs[record.type] &&
            record.value &&
            triggerOrwidgetObjs[record.type] != record.value
          ) {
            const targetComponent = {};
            Object.assign(targetComponent, record, {
              version: record.value,
            });
            btns.push(
              <Button
                key="update"
                type="primary"
                onClick={me.update.bind(me, targetComponent)}
                style={{ marginLeft: '10px' }}
              >
                {'更新'}
              </Button>
            );
          }

          return btns;
        },
      },
    ];
    return (
      <div>
        {me.state.widgetSeletorVisible ? (
          <div style={{ padding: '12px 20px 0px' }}>
            <div className="trigger-header">
              <Row>
                {/* 功能 */}
                {showTagTitle && <HETagPanel
                  className="trigger-header__panel"
                  tagList={me.state.featureList}
                  getWidgetByTag={this.getWidgetByTag.bind(this)}
                  title={'组件功能'}
                  selectedType="feature"
                ></HETagPanel>}
                {me.state.tagType && (
                  <HETagPanel
                    ref={this.currentRef}
                    className="trigger-header__panel"
                    tagList={me.state.componentTypeList}
                    getWidgetByTag={this.getWidgetByTag.bind(this)}
                    title={'组件分类'}
                    selectedType="componentType"
                  ></HETagPanel>
                )}

                <HETagPanel
                  className="trigger-header__panel"
                  tagList={me.state.purposeList}
                  getWidgetByTag={this.getWidgetByTag.bind(this)}
                  title={'组件使用情况'}
                  selectedType="purpose"
                ></HETagPanel>
                {/* 用途 */}
              </Row>
              <Search
                placeholder={'搜索组件名称'}
                style={{ width: 300, height: 36 }}
                onSearch={this.onSearch}
              />
            </div>
            <ConfigProvider renderEmpty={customizeRenderEmpty}>
              <Table
                columns={columns}
                size="small"
                style={{ overflow: 'hidden', margin: '10px 0px' }}
                rowKey={(record) => record._id}
                dataSource={this.state.widgets}
                pagination={this.state.pagination}
                loading={this.state.loading}
                onChange={this.handleTableChange}
              />
            </ConfigProvider>
          </div>
        ) : null}
        {isShowComponentInfoPreview && (
          <HEComponentInfoPreview
            previewTargetUrl={descUrl}
            onClose={() => {
              this.setState({ isShowComponentInfoPreview: false });
            }}
          />
        )}
      </div>
    );
  }
}

export default WidgetSelector;
