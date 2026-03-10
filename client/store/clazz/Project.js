import { observable } from 'mobx';
import Base from './Base';
import Page from './Page';
import Share from './Share';
import history from 'common/record';
import { PROJECTDATA } from 'common/defaultConstant';
import { getComponentInfo, toggleComponent } from 'common/componentsAction';
import { installedTriggers } from 'triggers';

class Project extends Base {
  @observable clazz = PROJECTDATA.clazz;

  // 用户ID
  @observable userId = PROJECTDATA.userId;

  // 项目名称
  @observable name = PROJECTDATA.name;
  // 页面动效
  @observable pageTransition = PROJECTDATA.pageTransition;
  // 页面标题
  @observable title = PROJECTDATA.title;
  // 页面关键字
  @observable keywords = PROJECTDATA.keywords;
  // 页面内容描述
  @observable description = PROJECTDATA.description;
  // 日志公共字段
  @observable comLogData = {};
  // 预加载背景
  @observable preLoadBackgroundImg = PROJECTDATA.preLoadBackgroundImg;

  // 页面列表
  @observable pages = [];

  // 创建时间
  @observable createdAt = new Date();

  // 修改时间
  @observable lastModifyTime = new Date();

  // 发布时间
  @observable lastPublished = new Date();

  // 上线时间
  @observable runingStartTime = new Date();

  // 下线时间
  @observable runingEndTime = new Date('2099-01-01 08:00:00'); // 默认下线时间，1年

  // 是否流式
  @observable layout = PROJECTDATA.layout;

  // 使用数据
  @observable useData = PROJECTDATA.useData;

  // 启用预加载
  @observable usePreloader = PROJECTDATA.usePreloader;
  @observable showDisplay = PROJECTDATA.showDisplay;

  @observable userSelect = PROJECTDATA.userSelect;

  // 页面变量存储数据的地方
  @observable variableStore = observable.map({});

  // 项目数据源配置
  @observable dataBox = {
    dataOrigin: 'json',
    responseData: {},
    params: [],
    requestUrl: '',
    method: 'POST',
  };
  // 页面类型 h5/image
  @observable type = PROJECTDATA.type;

  // 页内变量
  @observable pageState = observable.map({});

  // 是否使用神策平台
  @observable isUseSensor = PROJECTDATA.isUseSensor;
  // 神策平台业务线
  @observable sensorBusinessType = PROJECTDATA.sensorBusinessType;
  // 是否动态加载JS
  @observable dynamicLoadScript = PROJECTDATA.dynamicLoadScript;

  @observable backgroundColor = PROJECTDATA.backgroundColor;
  @observable stageWidth = PROJECTDATA.stageWidth;
  @observable maxWidth = PROJECTDATA.maxWidth;
  @observable closeImgLazyLoad = PROJECTDATA.closeImgLazyLoad;
  @observable thirdPartyConfig = PROJECTDATA.thirdPartyConfig;
  @observable origin = PROJECTDATA.origin;
  @observable bgImage = PROJECTDATA.bgImage;
  @observable bgSize = PROJECTDATA.bgSize;
  @observable bgSizeScale = PROJECTDATA.bgSizeScale;
  // 背景图片位置
  @observable bgImagePosition = PROJECTDATA.bgImagePosition;
  @observable bgImageRepeat = PROJECTDATA.bgImageRepeat;

  // 规则配置
  @observable rulesConfig = observable({});
  // 项目类型
  @observable editorType = 'project';
  // 是否添加登录行为组件
  @observable checkLogin = PROJECTDATA.checkLogin;

  @observable shareConfig = observable({});
  // 是否展示外部行为组件弹窗
  @observable widgetLibraryVisible = false;

  @observable componentPlat = PROJECTDATA.componentPlat;

  @observable miniProgramId = PROJECTDATA.miniProgramId;

  checkLoginTriggerId = '';
  /**
   * 构造函数
   *
   * @param  {Object} data 项目数据
   */
  constructor(data) {
    super();
    Object.assign(this, data);
    this.pageState = observable.map({});
    this.pageState.merge(data.pageState);
    this.variableStore = observable.map({});
    this.rulesConfig = Object.assign({}, data.rulesConfig);
    this.shareConfig = new Share(data.shareConfig || {});
    if (data.variableStore) {
      this.variableStore.merge(data.variableStore);
    }
    if (this.pages && this.pages.length) {
      this.pages = this.pages.map((page) => {
        return new Page(page, null);
      });
    } else {
      this.pages.push(
        new Page(
          {
            name: '页面-1',
            isSelected: true,
          },
          null
        )
      );
    }
  }
  /**
   * 获取选中的page
   *
   * @return {Page} 选中的页面
   */
  getSelectedPage() {
    let current;
    this.pages.map(function (page) {
      if (page.isSelected == true) {
        current = page;
      }
    });
    return current;
  }
  // 修改规则配置数据
  modifyRuleConfig(modify) {
    for (let key of Object.keys(modify)) {
      let value = modify[key];
      this.rulesConfig = { ...this.rulesConfig, [key]: value };
    }
    history.record();
  }
  // 修改分享配置数据
  modifyShareConfig(modify) {
    for (let key of Object.keys(modify)) {
      let value = modify[key];
      this.shareConfig = { ...this.shareConfig, [key]: value };
    }
    history.record();
  }
  /**
   * 修改项目数据
   *
   * @param  {Object} modify 修改项目
   */
  async modify(modify, namespace) {
    let me = this;
    if (namespace == 'rulesConfig') {
      this.modifyRuleConfig(modify);
      return;
    }
    for (let key of Object.keys(modify)) {
      me[key] = modify[key];
    }

    if (Object.hasOwnProperty.call(modify, 'checkLogin')) {
      this.toggleCheckLoginTrigger(modify['checkLogin']);
    }

    history.record();
  }
  setPageData(key, value) {
    const type = this.pageState.get(key) && this.pageState.get(key).type || 'String';
    this.pageState.set(key, {
      value: value,
      type: type,
    });
    let obj = {};
    obj[key] = value;
    let pageVariable = this.variableStore.get('PAGE_VARIABLE');
    if (pageVariable) {
      pageVariable = Object.assign(pageVariable, obj);
    } else {
      pageVariable = Object.assign({}, obj);
    }
    this.variableStore.set('PAGE_VARIABLE', pageVariable);
  }
  getPageDataByKey(key) {
    return this.pageState.get(key) && this.pageState.get(key).value;
  }

  // 添加删除 checkLogin 行为组件
  async toggleCheckLoginTrigger(installOrRemove) {
    // true install
    if (installOrRemove) {
      if (this.checkLoginTriggerId) return;

      const installed = Object.hasOwnProperty.call(
        installedTriggers,
        'CheckLogin'
      );

      if (!installed) {
        const info = await getComponentInfo('CheckLogin', 'action');

        toggleComponent(info, true);
      }

      this.pages[0].addTrigger({ type: 'CheckLogin', event: 'willmount' });

      const [{ id }] = this.pages[0].triggers.slice(-1);

      this.checkLoginTriggerId = id;

      return;
    }

    if (!this.checkLoginTriggerId) return;

    this.pages[0].removeTrigger(this.checkLoginTriggerId);
    this.checkLoginTriggerId = '';
  }
}

export default Project;
