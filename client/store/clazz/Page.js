import { observable, isObservableObject } from 'mobx';
import Base from './Base';
import Widget from './Widget';
import uid from 'uid';
import Trigger from './Trigger';
import history from 'common/record';
import merge from 'lodash/merge';
import { modifyAction } from './modifyAction';
import { getWidgetConfigByType } from 'widgets';
import { PAGEDATA } from 'common/defaultConstant';
import { PAGE_HEIGHT } from 'common/constants';

class Page extends Base {
  @observable id = uid(10);

  @observable clazz = PAGEDATA.clazz;

  @observable pageTitle = PAGEDATA.pageTitle;

  @observable name = PAGEDATA.name;

  @observable bgColor = PAGEDATA.bgColor;

  @observable bgImage = PAGEDATA.bgImage;

  @observable bgSize = PAGEDATA.bgSize;
  @observable bgSizeScale = PAGEDATA.bgSizeScale;

  // 背景图片位置
  @observable bgImagePosition = PAGEDATA.bgImagePosition;

  // 背景图片位置
  @observable bgImageRepeat = PAGEDATA.bgImageRepeat;

  @observable widgets = [];

  @observable isSelected = PAGEDATA.isSelected;

  @observable width = PAGEDATA.width;

  @observable heightSetting = PAGEDATA.heightSetting;

  @observable height = PAGEDATA.height;

  @observable isFullPage = PAGEDATA.isFullPage;
  // 触发器
  @observable triggers = [];
  @observable closeImgLazyLoad = PAGEDATA.closeImgLazyLoad;
  @observable path = '';
  @observable variableStore = observable.map({});
  @observable dataBox = {
    dataOrigin: 'json',
    responseData: {},
    params: [],
    requestUrl: '',
    method: 'POST'
  };

  /**
   * 构造函数
   *
   * @param  {Object} data 数据
   */
  constructor(data = {}, reset) {
    super();
    let me = this;
    let wigetTemp = {};
    // 进入图层编辑页，左侧侧边栏的page clazz变为了layer
    Object.assign(me, data, {
      clazz: 'page'
    });
    me.path = me.id;
    this.variableStore = observable.map({});
    if (data.variableStore) {
      this.variableStore.merge(data.variableStore);
    }
    me.triggers = me.triggers.slice().map((trigger) => {
      if (reset) {
        delete trigger.id;
      }
      return new Trigger(trigger, reset);
    });
    me.widgets = me.widgets.map((widget) => {
      if (reset) {
        // delete widget.id;
      }
      if (isObservableObject(widget)) {
        widget = JSON.parse(JSON.stringify(widget));
      }
      let widgetConfig = getWidgetConfigByType(widget.type, widget.version);
      if (widgetConfig && widgetConfig.onRender) {
        Object.keys(widgetConfig.config || []).forEach((key) => {
          if (widgetConfig.config[key].type == 'WidgetSelect') {
            wigetTemp[key] = key;
          }
        });
      }
      if (wigetTemp) {
        Object.keys(wigetTemp).forEach((key) => {
          if (widget.data[key]) {
            widget.data[key] =
              this.id + '-' + widget.data[key].replace(/(\w+-)/, '');
          }
        });
      }
      return new Widget(
        Object.assign(widget, {
          pageWidth: me.width,
          pageHeight: me.height,
          parentPath: me.path
        }),
        reset
      );
    });
  }

  reset(data) {
    data.id = this.id;
    this.constructor.call(this, data, true);
    history.record();
  }

  async modify(modify = {}) {
    let me = this;

    for (let key of Object.keys(modify)) {
      let value = modify[key];
      // 仅某些属性修改需要先经过一些异步处理，大部分属性并不需要
      const modifyActionProperties = [
        'bgSize',
        'height',
        'width',
        'bgSizeScale'
      ];
      if (modifyActionProperties.indexOf(key) !== -1) {
        const modifications = await modifyAction(this, key, value);
        merge(me, modifications);
      } else {
        me[key] = value;
      }
    }

    if (modify.isFullPage == false) {
      me.height = modify.height || PAGE_HEIGHT;

      me.widgets.forEach(function (widget) {
        widget.modify({
          pageHeight: me.height,
          pageWidth: me.width,
          align: widget.align
        });
      });
    }

    if (me.isFullPage == false && modify.height !== undefined) {
      me.widgets.forEach(function (widget) {
        widget.modify({
          pageHeight: me.height,
          pageWidth: me.width
        });
      });
    }
    history.record();
  }
}

export default Page;
