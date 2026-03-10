import './index.less';
import Layer from '../Layer';
import Widget from '../../store/clazz/Widget';
import { getDataContainerData } from 'common/handlePageDataByVariable';
import { toJS } from 'mobx';
import React from 'react';
export default {
  name: '数据模板',
  type: 'DataContainer',
  icon: 'inbox',
  group: 'DataContainer',
  height: 200,
  isCml: true,
  defaultLayerCount: 1,
  hasLayers: true,
  fixHeight: true,
  data: {
    resultList: [],
    dataSource: true,
    dataModel: {
      dataOrigin: 'json',
      responseData: {},
      params: [],
      requestUrl: '',
      method: 'GET'
    },
    dataName: '',
    mockData: '',
    gridAreas: 1,
    columnGap: 20,
    rowGap: 20,
    layerList: []
  },

  config: {
    dataModel: {
      text: '数据',
      type: 'DataBox'
    },
    dataSource: {
      text: '数据来源',
      type: 'Radio',
      options: [
        {
          text: '本身数据',
          value: true
        },
        {
          text: '继承父元素数据',
          value: false
        }
      ]
    },
    dataName: {
      text: '取值字段名称',
      type: 'PickData'
    },
    gridAreas: {
      text: '一行几个',
      type: 'Slider',
      min: 1,
      max: 10,
      msg: '一行有几个元素'
    },
    columnGap: {
      text: '列间距',
      type: 'Slider',
      min: 0,
      max: 100,
      msg: '每一列之间的间距'
    },
    rowGap: {
      text: '行间距',
      type: 'Slider',
      min: 0,
      max: 100,
      msg: '每一行之间的间距'
    }
  },
  onMount: async function (ctx) {
    // 如果在编辑的时候，获取的是responseData的数据
    // 如果是预览的时候，走接口数据
    if (!god.inEditor) {
      await this.getData(ctx);
    }
  },
  willMount: function (ctx) {
    ctx.widget.layers[0].width = this.getWidth(ctx);
    ctx.widget.layers[0].heightSetting = 'handAdjust';
    ctx.widget.data.resultList = [];
  },
  willUpdate: async function (ctx) {
    // 尺寸不一致，遍历元素内部尺寸，更改
    let computedWidth = this.getWidth(ctx);
    if (computedWidth != ctx.widget.layers[0].width) {
      let scale = computedWidth / ctx.widget.layers[0].width;
      ctx.getScaledValue(ctx.widget.layers[0].widgets, scale);
      ctx.widget.layers[0].width = computedWidth;
      ctx.widget.layers[0].height = ctx.widget.layers[0].height * scale;
    }
  },
  methods: {
    getWidth: function (ctx) {
      let { widget } = ctx;
      let containerWidth = widget.width;
      let padding = widget.padding.split(' ');
      let margin = widget.margin.split(' ');
      let { columnGap, gridAreas } = widget.data;
      let width =
        (containerWidth -
          parseInt(padding[1]) -
          parseInt(padding[3]) -
          parseInt(margin[1]) -
          parseInt(margin[3]) -
          (gridAreas - 1) * columnGap) /
        gridAreas;
      return width;
    },
    getData: async function (ctx) {
      let { dataSource } = ctx.widget.data;
      if (dataSource) {
        await this.getOwnData(ctx);
      } else {
        this.getFatherData(ctx);
      }
    },
    getResponce(data, dataName) {
      if (dataName) {
        dataName.split('.').forEach((item) => {
          data = data && data[item];
        });
      }
      return data;
    },
    async getOwnData(ctx) {
      let {
        dataModel: { dataOrigin, responseData, params, requestUrl, method },
        dataName
      } = ctx.widget.data;
      if (dataOrigin == 'json') {
        if (responseData.code == 0) {
          ctx.widget.data.resultList = this.getResponce(
            responseData.data,
            dataName
          );
        } else {
          if (responseData.msg) {
            ctx.showToast({
              message: responseData.msg,
              duration: 2000
            });
          }
        }
      } else {
        const response = await getDataContainerData(method, requestUrl, params);
        if (response.code == 0) {
          ctx.widget.data.resultList = this.getResponce(
            response.data,
            dataName
          );
        } else {
          if (response.msg) {
            ctx.showToast({
              message: response.msg,
              duration: 2000
            });
          }
        }
      }
    },
    getFatherData(ctx) {
      let { page, widget, variableMap } = ctx;
      let { dataName } = widget.data;
      let response = variableMap ? variableMap : toJS(page.variableStore);
      ctx.widget.data.resultList = this.getResponce(response, dataName);
    },
    getEditorData(responseData, dataName) {
      return this.getResponce(responseData, dataName);
    }
  },
  onRender(ctx) {
    let { widget, variableMap, page } = ctx;
    let { dataSource, dataModel, dataName } = widget.data;
    let layers = widget.layers;
    let style = {
      gridRowGap: `${widget.data.rowGap}px`,
      gridColumnGap: `${widget.data.columnGap}px`,
      gridTemplateColumns: `repeat(${widget.data.gridAreas}, 1fr)`
    };
    let firstLayer = layers[0];
    let padding = widget.padding.split(' ');
    let margin = widget.margin.split(' ');
    let editorData = dataSource
      ? dataModel.responseData.data
      : variableMap
      ? variableMap
      : toJS(page.variableStore);
    const resultList =
      (god.inEditor
        ? this.getEditorData(editorData, dataName)
        : widget.data.resultList) || [];
    return (
      <div className="grid-container" style={style}>
        {!resultList.length
          ? [
              <div
                className="grid-container-item grid-container-item-01"
                key={0}
              >
                <Layer
                  hideWigets={true}
                  widgets={firstLayer.widgets}
                  project={ctx.project}
                  container={firstLayer}
                  onAction={ctx.dispatchAction}
                />
              </div>
            ]
          : resultList.map((item, key) => {
              // 这里variableMap是为了选择变量时显示item内值
              item.index = key;
              firstLayer.variableMap = { H5ITEM: item };
              let widgets = firstLayer.widgets.map((widgetItem) => {
                let data = new Widget(widgetItem);
                return data;
              });
              return (
                <div className="grid-container-item" key={key}>
                  <Layer
                    _width={
                      ctx.widget.width -
                      parseInt(padding[1]) -
                      parseInt(padding[3]) -
                      parseInt(margin[1]) -
                      parseInt(margin[3])
                    }
                    variableMap={{ H5ITEM: item }}
                    widgets={god.inEditor ? firstLayer.widgets : widgets}
                    project={ctx.project}
                    container={firstLayer}
                    onAction={ctx.dispatchAction}
                  />
                </div>
              );
            })}
      </div>
    );
  }
};
