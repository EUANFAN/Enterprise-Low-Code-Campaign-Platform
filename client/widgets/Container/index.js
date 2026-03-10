import './index.less';
import Layer from '../Layer';
import React from 'react';
import { getDataContainerData } from 'common/handlePageDataByVariable';
import { toJS } from 'mobx';
export default {
  name: '容器',
  type: 'Container',
  icon: 'inbox',
  group: 'Container',
  height: 200,
  defaultLayerCount: 1,
  maxLayerCount: 1,
  hasLayers: true,
  data: {
    result: {},
    dataSource: true,
    dataModel: {
      dataOrigin: 'json',
      responseData: {},
      params: [],
      requestUrl: '',
      method: 'GET',
    },
    dataName: '',
    mockData: '',
    useData: false,
  },

  config: {
    useData: {
      text: '是否使用数据',
      type: 'Radio',
      options: [
        {
          text: '使用',
          value: true,
        },
        {
          text: '不使用',
          value: false,
        },
      ],
    },
    dataModel: {
      text: '数据',
      type: 'DataBox',
      when(data) {
        return data.data.useData;
      },
    },
    dataSource: {
      text: '数据来源',
      type: 'Radio',
      options: [
        {
          text: '本身数据',
          value: true,
        },
        {
          text: '继承父元素数据',
          value: false,
        },
      ],
      when(data) {
        return data.data.useData;
      },
    },
    dataName: {
      text: '取值字段名称',
      type: 'PickData',
      when(data) {
        return data.data.useData;
      },
    },
  },
  methods: {
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
        dataName,
      } = ctx.widget.data;
      let data = responseData;
      if (dataOrigin != 'json') {
        data = await getDataContainerData(method, requestUrl, params);
      }
      if (data && data.code == 0) {
        ctx.widget.data.result = this.getResponce(data.data, dataName);
      } else if (data && data.msg) {
        ctx.showToast({
          message: data.msg,
          duration: 2000,
        });
      }
    },
    getFatherData(ctx) {
      let { widget, variableMap, page } = ctx;
      let { dataName } = widget.data;
      let response = variableMap ? variableMap : toJS(page.variableStore);
      ctx.widget.data.result = this.getResponce(response, dataName);
    },
    getEditorData(responseData, dataName) {
      return this.getResponce(responseData, dataName);
    },
  },
  willMount: async function (ctx) {
    ctx.widget.data.isLoaded = false;
    // 如果在编辑的时候，获取的是responseData的数据
    // 如果是预览的时候，走接口数据
    if (!god.inEditor) {
      await this.getData(ctx);
      ctx.widget.data.isLoaded = true;
    } else {
      ctx.widget.data.isLoaded = true;
    }
    ctx.widget.layers[0].minHeight = ctx.widget.height;
  },
  onRender(ctx) {
    let { widget, page, variableMap } = ctx;
    let layers = widget.layers;
    let firstLayer = layers[0];
    let widgets = firstLayer.widgets;
    let { dataSource, dataModel, dataName, useData } = widget.data;
    if (!useData) {
      return (
        <Layer
          widgets={widgets}
          project={ctx.project}
          container={firstLayer}
          onAction={ctx.dispatchAction}
        />
      );
    }
    // 切换是否使用数据的时候，需要重新渲染页面
    let editorData = dataSource
      ? dataModel.responseData.data
      : variableMap
      ? variableMap
      : toJS(page.variableStore);
    const result =
      (god.inEditor
        ? this.getEditorData(editorData, dataName)
        : widget.data.result) || {};
    const finalResult = dataName
      ? {
          [dataName.split('.')[1]]: result,
        }
      : result;
    firstLayer.variableMap = finalResult;
    if (ctx.widget.data.isLoaded) {
      return (
        <Layer
          variableMap={finalResult}
          widgets={widgets}
          project={ctx.project}
          container={firstLayer}
          onAction={ctx.dispatchAction}
        />
      );
    } else {
      return null;
    }
  },
};
