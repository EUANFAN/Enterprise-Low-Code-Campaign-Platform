import {
  PAGE_STATE_VAR_TAG_REGEX,
  PAGE_WIDTH,
  PROJECT_VARIABLE_REGEX,
} from 'common/constants';
import TextUtils from 'utils/TextUtils';
import computeValueMap from 'common/computeValueMap';

const DEFAULT_BG_POSITION = 'center-center';

export function hasVariable(value) {
  if (typeof value == 'string') {
    return (
      new RegExp(PAGE_STATE_VAR_TAG_REGEX).test(value) ||
      new RegExp(PROJECT_VARIABLE_REGEX).test(value)
    );
  }
  return false;
}
function computedAtt(att, component, scale) {
  if (computeValueMap[att]) {
    if (['padding', 'margin'].indexOf(att) > -1) {
      component[att] = component[att]
        .split(' ')
        .map((item) => item * scale)
        .join(' ');
    } else {
      component[att] = component[att] * scale;
    }
  }
}
export function getScaledValue(components, scale) {
  components.forEach((component) => {
    Object.keys(component).forEach((att) => {
      computedAtt(att, component, scale);
    });
    if (component.hasLayers) {
      component.layers.forEach((layer) => {
        layer.widgets.forEach((widget) => {
          Object.keys(widget).forEach((att) => {
            computedAtt(att, widget, scale);
          });
        });
      });
    }
  });
}
// 兼容外部组件使用该方法的情况,等比缩放
export function getComputedValue(value, project, attr) {
  if (computeValueMap[attr]) {
    let scale = god.stageSize.width / PAGE_WIDTH;
    if (['padding', 'margin'].indexOf(attr) > -1) {
      return value
        .split(' ')
        .map((item) => `${item * scale}px`)
        .join(' ');
    }
    return Math.round(value * scale);
  }
  return value;
}

function addRem(value) {
  if (/^(-|\d)[\S\s]*(px|\d)$|^[1-9]$/.test(value)) {
    return value
      .toString()
      .replace(/(-)*([\d]*\.*[\d]*)(px)*/, (match, symbol, num) => {
        return `${symbol || ''}${(num / 37.5).toFixed(2)}rem`;
      });
  }
  return value;
}

export function px2rem(style) {
  for (const attr in style) {
    if (
      /^(-|\d)[\S]*(px|\d)$|^\d$/.test(style[attr]) &&
      !/opacity|zIndex/.test(attr)
    ) {
      style[attr] = addRem(style[attr]);
    } else if (
      /^(-|\d)[\s\S]*(px|\d)$/.test(style[attr]) &&
      !/opacity|zIndex/.test(attr)
    ) {
      // margin padding 这种多个值的情况
      const value = style[attr].split(' ');
      for (let i = 0; i < value.length; i++) {
        value[i] = addRem(value[i]);
      }
      style[attr] = value.join(' ');
    }
  }
}

function useDataValueContent(value, variableMap, page, project, flag) {
  // 判断是使用全局数据源还是数据容器还是页内变量
  let variableStore = project.variableStore;
  if (typeof value != 'string') {
    return value;
  }

  let result;
  // 判断是使用项目数据
  result = value.replace(
    PROJECT_VARIABLE_REGEX,
    (match, category, selectedParent, selectKey) => {
      if (category === 'PROJECT_VARIABLE') {
        const projectVariable = variableStore.get
          ? variableStore.get('PROJECT_VARIABLE')
          : variableStore['PROJECT_VARIABLE'];
        const finalValue = projectVariable.get
          ? projectVariable.get(selectedParent)?.[selectKey]
          : projectVariable[selectedParent]
          ? projectVariable[selectedParent]?.[selectKey]
          : undefined;
        return switchValue(finalValue, flag);
      }
    }
  );
  if (result !== value) {
    return /^(true|false)$/.test(result) ? JSON.parse(result) : result;
  }
  result = value.replace(
    PAGE_STATE_VAR_TAG_REGEX,
    (match, selectedParent, selectKey) => {
      if (selectedParent.match(/^[H5]/)) {
        let finalValue = variableMap
          ? variableMap[selectedParent]
            ? variableMap[selectedParent][selectKey]
            : value
          : value;
        return switchValue(finalValue, flag);
      } else {
        if (selectedParent == 'PAGE_VARIABLE') {
          const targetStore = variableStore.get
            ? variableStore.get(selectedParent)
            : variableStore[selectedParent];
          let finalValue = targetStore ? targetStore[selectKey] : undefined;
          return switchValue(finalValue, flag);
        }
        // 剩下的情况就是选择容器内的变量还是页面内的变量
        if (
          variableMap &&
          variableMap[selectedParent] &&
          variableMap[selectedParent][selectKey] !== undefined
        ) {
          return switchValue(variableMap[selectedParent][selectKey], flag);
        } else {
          if (page.variableStore) {
            if (
              page.variableStore.get &&
              page.variableStore.get(selectedParent)
            ) {
              return switchValue(
                page.variableStore.get(selectedParent)[selectKey],
                flag
              );
            } else {
              return switchValue(
                page.variableStore[selectedParent][selectKey],
                flag
              );
            }
          } else {
            return value;
          }
        }
      }
    }
  );
  return /^(true|false)$/.test(result) ? JSON.parse(result) : result;
}

export function useDataValue(value, variableMap, page, project, flag) {
  try {
    return useDataValueContent(value, variableMap, page, project, flag);
  } catch (error) {
    let result = value.replace(PAGE_STATE_VAR_TAG_REGEX, void 0);
    return result == 'undefined' ? void 0 : result;
  }
}

function switchValue(value, flag) {
  if (!flag) {
    if (typeof value == 'object') {
      return JSON.stringify(value);
    }
    return value;
  }
  switch (typeof value) {
    case 'object': {
      return JSON.stringify(value);
    }
    case 'string':
      return '\'' + value + '\'';
    default:
      return value;
  }
}
export function getBackgroundImageAttribute(data) {
  const containerBgImage = data.bgImage;
  const containerBgImageRepeat = data.bgImageRepeat;
  const containerBgImagePosition = data.bgImagePosition || DEFAULT_BG_POSITION;
  const congtainerBgSize = data.bgSize;
  let containerBgSizeScale = data.bgSizeScale;
  let repeatMap = {
    horizon: 'repeat-x',
    vertical: 'repeat-y',
    'horizon-vertical': 'repeat',
    none: 'no-repeat',
  };
  if (data.clazz == 'project') {
    containerBgSizeScale =
      congtainerBgSize == 'custom' ? `${containerBgSizeScale}%` : 'auto';
  } else {
    containerBgSizeScale =
      typeof containerBgSizeScale === 'number'
        ? `${containerBgSizeScale}%`
        : 'auto';
  }
  if (containerBgImage) {
    return {
      backgroundImage: `url(${TextUtils.escape(containerBgImage, {
        quote: true,
      })})`,
      backgroundRepeat: repeatMap[containerBgImageRepeat],
      backgroundPosition: containerBgImagePosition.split('-').join(' '),
      backgroundSize: containerBgSizeScale,
    };
  }
  return {};
}
