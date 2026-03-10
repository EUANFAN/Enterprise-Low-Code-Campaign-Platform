import { observable } from 'mobx';
import Widget from './Widget';
import history from 'common/record';
import uid from 'uid';
import { LAYERDATA } from 'common/defaultConstant';
class Layer {
  @observable id = uid(10);

  @observable clazz = LAYERDATA.clazz;

  @observable name = LAYERDATA.name;

  @observable heightSetting = LAYERDATA.heightSetting;

  @observable height = LAYERDATA.height;

  @observable width = LAYERDATA.width;

  @observable widgets = [];

  @observable isSelected = LAYERDATA.isSelected;

  @observable type = LAYERDATA.type;

  @observable bgColor = LAYERDATA.bgColor;

  @observable closeImgLazyLoad = LAYERDATA.closeImgLazyLoad;

  @observable isFullPage = false;

  /**
   * 构造函数
   *
   * @param  {Object} data 数据
   */
  constructor(data = {}, reset) {
    let me = this;

    Object.assign(this, data);
    this.height = parseFloat(this.height);
    this.width = parseFloat(this.width);
    this.path = this.parentPath + '-' + this.id;
    me.widgets = me.widgets.map((widget) => {
      if (reset) {
        delete widget.id;
      }
      return new Widget(
        Object.assign(widget, {
          parentPath: this.path,
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

  modify(modify = {}) {
    let me = this;
    for (let key of Object.keys(modify)) {
      let value = modify[key];
      me[key] = value;
    }

    me.widgets.forEach(function (widget) {
      widget.modify({
        pageHeight: me.height,
        pageWidth: me.width,
      });
    });

    history.record();
  }
}

export default Layer;
