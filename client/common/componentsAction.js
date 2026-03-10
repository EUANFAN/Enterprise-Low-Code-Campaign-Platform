import { fetchJSON } from 'apis/BaseAPI';
import { installWidget, uninstallWidget } from 'widgets';
import { installTrigger, uninstallTrigger } from 'triggers';
import { widgetCount } from 'apis/WidgetAPI';
import store from 'store/stage';

export function getComponentInfo(componentName, componentType) {
  return fetchJSON('/widget/list', {
    method: 'post',
    q: componentName,
    onlySetuped: false,
    type: componentType,
    current: 1,
    precise: true,
  }).then((data) => data.widgets?.[0] || null);
}

export function toggleComponent(record, setup) {
  const action = setup;
  const stageStore = store.getStageStore();
  return fetchJSON('/widget/setup', {
    method: 'get',
    type: record.type,
    version: record.version,
    setup: action,
  }).then((data) => {
    if (data) {
      record.isSetuped = action;
      record.widgetUrl = data.widgetUrl;
      let info = {
        name: record.name,
        type: record.type,
        category: record.category,
        version: record.version,
        widgetUrl: data.widgetUrl,
      };
      if (info.category == 'widget') {
        action ? installWidget(info) : uninstallWidget(info);
      } else {
        action ? installTrigger(info) : uninstallTrigger(info);
      }
      stageStore.updateInstallComponents(record, action);
      widgetCount(record.type);
    }
  });
}
