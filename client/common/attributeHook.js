import store from 'store/stage';
import { computedContentHeight, getImageOriginScaleByUrl, getMargin } from 'common/getHeight';
import { PAGE_WIDTH } from 'common/constants';
import throttle from 'lodash/throttle';
import tools from 'common/tools';
import { changeWidgetAttribute, setWidgetSize } from 'common/component';
import { observable } from 'mobx';
const AFTER_HEIGHT_MAP = [
  'layout',
  'margin',
  'width',
  'height',
  'left',
  'top',
  'url',
  'heightSetting',
  'autoHeight',
  'padding',
  'content'
];
// 属性更新后重新计算高度
// attribute 组件属性
// changeAttribute 要计算的属性
let computeAttribute = async (widget, attribute, namespace, changeAttribute, noNeedAgainCompute) => {
  let isExitAttribute = widget && ((!namespace && widget.hasOwnProperty(attribute)) || (namespace && widget[namespace] && widget[namespace].hasOwnProperty(attribute)));
  if (!isExitAttribute) {
    return;
  }
  let stageStore = store.getStageStore();
  let stage = stageStore && stageStore.getCurrentStage();
  switch (changeAttribute) {
    case 'height':
      if (AFTER_HEIGHT_MAP.indexOf(attribute) < 0 || stage?.component.type === 'fullscreen') {
        return;
      }
      if (stage && stage.component && stage.component.heightSetting === 'autoAdjust' && !noNeedAgainCompute) {
        let maxHeight = await computedContentHeight(stage.list, stage.component.clazz, noNeedAgainCompute);
        stage.component.modify({
          height: maxHeight
        });
      }
      break;
    case 'hasLayers':
      if (widget.hasLayers) {
        if (!widget.fixHeight) {
          let heightSetting = 'handAdjust';
          if (widget.layout == 'flow') {
            heightSetting = 'autoAdjust';
          }
          // 瀑布流布局的容器，layer页面高度自动调整
          // 拖拽布局的容器,如果layer页面高度高于widget高度,那么layer高度不变
          // 如果layer页面高度低于widget高度，则layer页面高度和widget高度保持一致
          widget.layers.forEach(layer => {
            layer.width = widget.width;
            layer.height = widget.height;
            layer.heightSetting = heightSetting;
            layer.widgets.forEach(currentWidget => {
              currentWidget.pageHeight = layer.height;
              currentWidget.pageWidth = layer.width;
            });
          });
        }
      }
      break;
    default:
  }
};
// 属性更新前，计算更新scale
let beforeUpdateHook = async (widget, attribute, value, namespace) => {
  // 后期改造加一层判断，当前元素尺寸是否锁定
  let result = {};
  let isExitAttribute = !namespace && widget && widget.hasOwnProperty(attribute) || namespace && widget && widget[namespace] && widget[namespace].hasOwnProperty(attribute);
  if (!isExitAttribute) {
    if (!namespace) {
      result[attribute] = value;
    } else {
      result[namespace] = {};
      result[namespace][attribute] = value;
    }
    return result;
  }

  switch (attribute) {
    case 'width':
      if (widget.type == 'Image') {
        result.height = Math.round(value / (widget.width / widget.height));
      }
      break;
    case 'height':
      if (widget.type == 'Image') {
        result.width = Math.round(value * (widget.width / widget.height));
      }
      break;
    case 'layout':
      if (widget.clazz == 'project') {
        result.width = PAGE_WIDTH;
        if (value === 'flow') {
          changeWidgetAttribute(widget, (curWidget) => {
            let scale = curWidget.width / curWidget.height;
            curWidget.modify({
              layout: 'flow',
              height: Math.round(result.width / scale),
              minHeight: Math.round(result.width / scale),
              left: 0,
              width: result.width
            });
          });
        } else {
          changeWidgetAttribute(widget, (curWidget) => {
            curWidget.modify({
              layout: 'normal'
            });
          });
        }
      } else {
        if (value === 'flow') {
          result.width = widget.pageWidth;
          let scale = widget.width / widget.height;
          if (widget.type === 'Image') {
            scale = await getImageOriginScaleByUrl(widget.data.url) || scale;
          }
          if (widget.layers.length) {
            widget.layers.forEach(async layer => {
              layer.heightSetting = 'autoAdjust';
              layer.height = await computedContentHeight(layer.widgets, 'layer', false);
            });
          }
          result.height = result.width / scale;
          result.minHeight = result.width / scale;
          result.left = 0;
        }
      }
      break;
    case 'url':
      if (widget.type === 'Image') {
        result.width = widget.width;
        let scale = await getImageOriginScaleByUrl(value);
        if (scale) {
          result.height = widget.width / scale;
        }
        else {
          result.height = widget.height;
        }
      }
      break;
    case 'autoHeight':
      if (value) {
        let contentHeight = tools.getContentHeight(widget);
        result.height = contentHeight;
      } else {
        result.height = widget.height;
      }
      break;
    case 'content':
    case 'padding':
      if (widget.data && widget.data.autoHeight) {
        let contentHeight = tools.getContentHeight(widget) || 100;
        result.height = contentHeight;
      } else {
        result.height = widget.height;
      }
      break;
    case 'margin':
      if (widget.layout == 'flow') {
        let margin = getMargin(widget.margin);
        // result.width = 375 - margin.left - margin.right;
        result.left = margin.left;
      }
      break;
    case 'minHeight':
      result.height = value;
      break;
    case 'dataBox':
      if (widget.clazz == 'page') {
        result.variableStore = observable.map(value.responseData.data);
      } else if (widget.clazz == 'project') {
        !result.variableStore && (result.variableStore = {});
        const PROJECT_VARIABLE = observable.map(value.responseData.data);
        result.variableStore = widget.variableStore.merge({ PROJECT_VARIABLE });
      }
      break;
    case 'isFullPage':
      if (widget.clazz == 'layer' && value) {
        widget.height = widget.height < 603 ? 603 : widget.height;
      }
      break;
    default:
      break;
  }
  if (namespace) {
    result[namespace] = {};
    result[namespace][attribute] = value;
    return result;
  }
  result[attribute] = value;
  return result;
};

let afterUpdateHook = throttle((...args) => {
  let project = store.getProject();
  const attribute = args[1];
  const attributeList = [
    'width',
    'height',
    'layout',
    'url',
    'autoHeight',
    'content',
    'padding',
    'margin',
    'minHeight'
  ];
  if (attributeList.indexOf(attribute) > -1) {
    setWidgetSize(project, args[0]);
  }
  computeAttribute.apply(null, args);
}, 500);
export {
  afterUpdateHook,
  beforeUpdateHook
};
