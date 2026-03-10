/**
 * 项目周期函数
 */

import { context } from './utils';
import stageStore from 'store/stage';
import { getTriggerConfigByType, loadTriggerConfig } from 'triggers';
import { getWidgetConfigByType, loadWidgetConfig } from 'widgets';

let promise = [];

async function getTiggerConfig(ctx, trigger, widget, method) {
  let triggerConfig = getTriggerConfigByType(trigger.type, trigger.version);
  /* triggerConfig 为 null 的情况，当组件发布，用户二次编辑时，并没有升级组件，此时点击发布，installed中的组件版本和当前的组件版本不同，无法拿到triggerConfig */
  if (!triggerConfig) {
    triggerConfig = await loadTriggerConfig(trigger);
  }
  /* 有 triggerConfig 的组件，只有useLifecycle为true时才load组件 */
  if (typeof triggerConfig[method] == 'function') {
    let request = triggerConfig[method].bind(trigger)(
      Object.assign(ctx, { trigger: trigger, widget: widget })
    );
    promise.push(request);
  }
  getTriggerInTriggers(ctx, trigger, method);
}

async function getWidgetConfig(ctx, widget, method) {
  let widgetConfig = getWidgetConfigByType(widget.type, widget.version);
  if (!widgetConfig) {
    widgetConfig = await loadWidgetConfig(widget);
  }
  if (typeof widgetConfig[method] == 'function') {
    let request = widgetConfig[method].bind(widget)(
      Object.assign(ctx, { widget: widget })
    );
    promise.push(request);
  }
}

// 递归trigger中的trigger,执行method
function getTriggerInTriggers(ctx, trigger, method) {
  Object.values(trigger).forEach((value) => {
    if (typeof value == 'object' && value && value.clazz == 'trigger') {
      getTriggerFunc(ctx, { triggers: [value] }, method);
    } else if (typeof value == 'object' && value) {
      getTriggerInTriggers(ctx, value, method);
    }
  });
}

function getTriggerFunc(ctx, element, method) {
  (element.triggers || []).forEach(async (trigger) => {
    getTiggerConfig(ctx, trigger, element, method);
  });

  (element.pages || element.layers || []).forEach((container) => {
    (container.triggers || []).forEach(async (trigger) => {
      getTiggerConfig(ctx, trigger, container, method);
    });
    (container.widgets || []).forEach((widget) => {
      getTriggerFunc(ctx, widget, method);
    });
  });
}

function getWidgetFunc(ctx, element, method) {
  (element.widgets || []).forEach(async (widget) => {
    getWidgetConfig(ctx, widget, method);
    (widget.layers || []).forEach((layer) => {
      getWidgetFunc(ctx, layer, method);
    });
  });

  (element.pages || element.layers || []).forEach((container) => {
    getWidgetFunc(ctx, container, method);
  });
}

let beforePublish = async (project) => {
  /* 重置promise对象数组 */
  promise = [];
  let ctx = context(
    Object.assign({
      project,
      getPageDataByKey: stageStore.getPageDataByKey,
      setPageData: stageStore.setPageData,
    })
  );
  getTriggerFunc(ctx, project, 'beforePublish');
  getWidgetFunc(ctx, project, 'beforePublish');
  await Promise.all(promise);
};

export { beforePublish };
