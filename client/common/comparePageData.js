import Project from 'defaultData/project';
import Page from 'defaultData/page';
import Widget from 'defaultData/widget';
import Layer from 'defaultData/layer';
import jsonpatch from 'fast-json-patch'; // 对json数据做处理
import { loadWidgetConfig, getWidgetConfigByType } from 'widgets';
const specialAttribute = ['pages', 'layers', 'widgets'];

let compareData = async (pageData, type) => {
  let newPageData = {};
  let targetObj;
  let config = {};
  switch (type) {
    case 'project':
      targetObj = Project;
      break;
    case 'page':
      targetObj = Page;
      break;
    case 'layer':
      targetObj = Layer;
      break;
    default: {
      targetObj = Widget;
      // 如果是内部组件或者,已经显示的组件可能存在父容器隐藏的情况，这样getWidgetConfigByType也无法获取信息
      let curWidget = !pageData.version
        ? getWidgetConfigByType(pageData.type, pageData.version)
        : await loadWidgetConfig({
            type: pageData.type,
            version: pageData.version,
          });
      config = (curWidget && curWidget.config) || {};
    }
  }
  for (let key in pageData) {
    if (!pageData[key]) {
      if (pageData[key] != targetObj[key]) {
        newPageData[key] = pageData[key];
      }
    } else {
      if (specialAttribute.indexOf(key) >= 0 && pageData[key].length) {
        newPageData[key] = await Promise.all(
          pageData[key].map(async (data) => {
            let getdata = await compareData(data, data.clazz);
            return getdata;
          })
        );
      } else if (Array.isArray(pageData[key])) {
        // 当前属性下的值为数组
        if (
          !targetObj[key] ||
          (pageData[key].length != targetObj[key].length &&
            specialAttribute.indexOf(key) < 0)
        ) {
          newPageData[key] = pageData[key];
        }
        // 当前属性值为对象
      } else if (pageData[key] instanceof Object) {
        // 如果是组件，如果data里的属性config里没有，就不保存
        // config属性不需要保存在数据库内
        if (key === 'data' && pageData['clazz'] === 'widget') {
          // newPageData['data']不存在
          if (!newPageData[key]) {
            newPageData[key] = {};
          }
          let widgetData = pageData[key];
          for (let dataKey in widgetData) {
            if (config && config.hasOwnProperty(dataKey)) {
              newPageData[key][dataKey] = widgetData[dataKey];
            }
          }
        } else if (key != 'config') {
          if (!targetObj[key]) {
            newPageData[key] = pageData[key];
          } else {
            let diff = jsonpatch.compare(targetObj[key], pageData[key]);
            if (diff.length > 0) {
              newPageData[key] = pageData[key];
            }
          }
        }
      } else {
        if (pageData[key] != targetObj[key]) {
          newPageData[key] = pageData[key];
        }
      }
    }
  }
  return newPageData;
};
export { compareData };
