import { getImageOriginScaleByUrl } from 'common/getHeight';
import { toJS } from 'mobx';
/**
 * 递归获取容器中所有组件的类型
 *
 * @param  {Object} container 组件容器
 * @return {Object}           组件类型结果
 */
const getWidgetTypes = (container) => {
  container = toJS(container);
  let types = {};
  (container.widgets || []).forEach((widget) => {
    types[widget.type] = widget.version;
    Object.assign(types, getTriggersOfTrigger(widget));
    if (widget.layers) {
      widget.layers.forEach((layer) => {
        Object.assign(types, getWidgetTypes(layer));
      });
    }
  });
  return types;
};

/**
 * 获取工程中所有组件的类型
 *
 * @param  {Object} project   工程数据
 * @return {Object}           组件类型结果
 */
const getProjectWidgetTypes = (project) => {
  project = toJS(project);
  let types = {};
  project.pages.forEach((page) => {
    Object.assign(types, getWidgetTypes(page));
  });
  return types;
};

// 递归获取trigger中的trigger
const getTriggersOfTrigger = (trigger) => {
  trigger = toJS(trigger);

  let types = {};
  if (typeof trigger != 'object' || Object.keys(trigger).length == 0) {
    return types;
  }

  Object.values(trigger).forEach((value) => {
    if (value && typeof value == 'object') {
      if (value.clazz == 'trigger') {
        types[value.type] = value.version;
      }
      if (Object.values(value).some((t) => typeof t == 'object')) {
        Object.assign(types, getTriggersOfTrigger(value));
      }
    }
  });

  return types;
};

/**
 * 递归获取容器中所有行为的类型
 *
 * @param  {Object} container 组件容器
 * @return {Object}           行为类型结果
 */
const getTriggerTypes = (container) => {
  container = toJS(container);
  let types = {};
  (container.triggers || []).forEach((trigger) => {
    types[trigger.type] = trigger.version;
    // trigger下面可能还有trigger
    Object.assign(types, getTriggersOfTrigger(trigger));
  });
  (container.widgets || []).forEach((widget) => {
    Object.assign(types, getTriggerTypes(widget));
    if (widget.layers) {
      widget.layers.forEach((layer) => {
        Object.assign(types, getTriggerTypes(layer));
      });
    }
  });
  return types;
};

/**
 * 获取工程中所有行为的类型
 *
 * @param  {Object} project   工程数据
 * @return {Object}           行为类型结果
 */
const getProjectTriggerTypes = (project) => {
  project = toJS(project);
  let types = {};
  (project.pages || []).forEach((page) => {
    Object.assign(types, getTriggerTypes(page));
  });
  return types;
};

/**
 * 获取工程中所有组件（包括行为）的类型
 *
 * @param  {Object} project 工程数据
 * @return {Object}         所有类型
 */
const getProjectComponentTypes = (project) => {
  project = toJS(project);
  let widgetTypes = getProjectWidgetTypes(project);
  let triggerTypes = getProjectTriggerTypes(project);
  return Object.assign({}, widgetTypes, triggerTypes);
};

const setTriggerVersion = (trigger, widgetConfig) => {
  if (trigger.type === widgetConfig.type) {
    trigger.version = widgetConfig.version;
  }
  Object.values(trigger).forEach((value) => {
    if (typeof value == 'object' && value) {
      setTriggerVersion(value, widgetConfig);
    } else if (
      typeof value == 'object' &&
      value &&
      value.type == 'ModifyPageState'
    ) {
      setTriggerVersion(value.success, widgetConfig);
    }
  });
};

const setProjectComponentVersion = (project, widgetConfig) => {
  (project.pages || []).forEach((page) => {
    setWidgetVersion(page, widgetConfig);
  });
};

/**
 * 设置组件（包括行为）的版本号
 *
 * @param {Object} container    组件容器
 * @param {Object} widgetConfig 组件配置
 */
const setWidgetVersion = (container, widgetConfig) => {
  if (widgetConfig && widgetConfig.category == 'action') {
    // 行为组件更新
    (container.triggers || []).forEach((trigger) => {
      // trigger下面的trigger
      setTriggerVersion(trigger, widgetConfig);
    });

    (container.widgets || []).forEach((widget) => {
      widget = setWidgetVersion(widget, widgetConfig);
      if (widget.layers) {
        widget.layers.forEach((layer) => {
          setWidgetVersion(layer, widgetConfig);
        });
      }
    });

    if (container.category == 'widget') {
      Object.values(container).forEach((value) => {
        if (
          value &&
          typeof value == 'object' &&
          value.category &&
          value.category == 'action'
        ) {
          setTriggerVersion(value, widgetConfig);
        } else if (
          value &&
          typeof value == 'object' &&
          value.type &&
          value.type == 'ModifyPageState'
        ) {
          setTriggerVersion(value.success, widgetConfig);
        }
      });
    }
  } else {
    (container.widgets || []).forEach((widget) => {
      if (widget.type === widgetConfig.type) {
        widget.version = widgetConfig.version;
      }
      if (widget.layers) {
        widget.layers.forEach((layer) => {
          setWidgetVersion(layer, widgetConfig);
        });
      }
    });
  }
  return container;
};
// 修改project内所有组件的某一属性
const changeWidgetAttribute = (project, settingFn) => {
  (project.pages || []).forEach((container) => {
    (container.widgets || []).forEach((widget) => {
      settingFn(widget);
      if (widget.layers) {
        widget.layers.forEach((layer) => {
          setWidgetVersion(layer, settingFn);
        });
      }
    });
  });
};

// 修改容器的尺寸后，处理容器里面的元素的尺寸位置
// 兼容以前的项目，从容器进入layer需重新计算尺寸
const setWidgetSize = (project, widgetInfo) => {
  // 设置的是padding值
  // 当前的元素是容器
  // 先记录容器 宽/高 scale x/y = currentWidth /
  // currentWidth = width - paddingLeft - paddingRight
  // 里面元素现在的宽度 currentWidth currentHeight = currentWidth / ( x / y)
  // 设置修改的widget的layer和其子元素的宽高
  const widgetId = widgetInfo.id;
  const setSize = async (widget) => {
    if (widget.id == widgetId) {
      // 父级的padding 和 margin
      let widgetPadding = widget.padding.split(' ');
      let widgetMargin = widget.margin.split(' ');
      let layerWidth = widget.width;
      let layerHeight;
      if (widget.type != 'DataContainer') {
        layerWidth =
          widget.width -
          parseInt(widgetPadding[1]) -
          parseInt(widgetPadding[3]) -
          parseInt(widgetMargin[1]) -
          parseInt(widgetMargin[3]);
      } else {
        let { columnGap, gridAreas } = widget.data;
        let computedWidth =
          (widget.width -
            parseInt(widgetPadding[1]) -
            parseInt(widgetPadding[3]) -
            parseInt(widgetMargin[1]) -
            parseInt(widgetMargin[3]) -
            (gridAreas - 1) * columnGap) /
          gridAreas;
        layerWidth = computedWidth;
      }
      if (widget.layers && widget.layers.length > 0) {
        widget.layers.forEach(async (layer) => {
          layerHeight = layer.height;
          if (!layer.isFullPage && widget.type == 'DataContainer') {
            let scale = layerWidth / layer.width;
            layerHeight = layerHeight * scale;
          }
          if (layer.widgets && layer.widgets.length > 0) {
            layer.widgets.forEach(async (childWidget) => {
              if (
                childWidget.layout == 'flow' &&
                childWidget.type != 'Container'
              ) {
                if (childWidget.type === 'Image') {
                  let scale = childWidget.width / childWidget.height;
                  scale =
                    (await getImageOriginScaleByUrl(childWidget.data.url)) ||
                    scale;
                  let childWidgetHeight = layerWidth / scale;
                  await childWidget.modify({ width: layerWidth });
                  await childWidget.modify({ height: childWidgetHeight });
                  await childWidget.modify({ minHeight: childWidgetHeight });
                }
              }
              if (!childWidget.isFullPage) {
                await childWidget.modify({
                  pageWidth:
                    childWidget.location == 'screen' ? 375 : layerWidth,
                });
                await childWidget.modify({
                  pageHeight:
                    childWidget.location == 'screen' ? 603 : layerHeight,
                });
              }
            });
          }
          await layer.modify({ width: layerWidth });
        });
      }
    } else {
      if (widget.layers && widget.layers.length > 0) {
        widget.layers.forEach((layer) => {
          if (layer.widgets && layer.widgets.length > 0) {
            layer.widgets.forEach((childWidget) => {
              setSize(childWidget);
            });
          }
        });
      }
    }
  };
  ((project && project.pages) || []).forEach((container) => {
    (container.widgets || []).forEach((widget) => {
      setSize(widget);
    });
  });
};

export {
  getProjectTriggerTypes,
  getProjectWidgetTypes,
  getProjectComponentTypes,
  getTriggerTypes,
  getWidgetTypes,
  setWidgetVersion,
  setProjectComponentVersion,
  changeWidgetAttribute,
  setWidgetSize,
};
