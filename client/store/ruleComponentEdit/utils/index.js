export * from './wrapCustomComponent';
import get from 'lodash/get';
import set from 'lodash/set';
import message from 'antd/lib/message/index.js';
export const deepObject = (target, callback = () => {}) => {
  for (let key in target) {
    if (target.hasOwnProperty(key)) {
      callback(target[key], key);
    }
  }
};
export const setComponentDefaultValue = (type) => {
  switch (type) {
    case 'FilePicker':
      return '';
    case 'Radio': {
      return '1';
    }
    case 'RadioButton': {
      return '1';
    }
    case 'NormalText':
      return '';
    case 'InputNumber':
      return 0;
    case 'RichText':
      return '';
    case 'Slider': {
      return 0;
    }
    case 'AssembleList': {
      return [];
    }
    case 'MultipleSelect': {
      return ['1'];
    }
    case 'Select': {
      return '1';
    }
    case 'CheckBox': {
      return ['1'];
    }
    case 'Set': {
      return {
        clickid:'0.1'
      };
    }
    default:
      return '';
  }
};
export const merge = function (ruleComponent = {}, ...newConfigs) {
  const result = newConfigs.reduce((memo, next) => {
    deepObject(next, (item, key) => {
      switch (key) {
        case 'config': {
          deepObject(item, (config, props) => {
            if (typeof config === 'object') {
              const value = get(memo, [key, props], {});
              set(memo, [key, props], Object.assign({}, value, config));
            }
          });
          break;
        }
        case 'data': {
          deepObject(item, (data, props) => {
            set(memo, [key, props], data);
          });
          break;
        }
      }
    });
    return memo;
  }, ruleComponent);
  const value = result.data;
  deepObject(result.config, (item, key) => {
    if (Object.keys(item).length > 0) {
      if (item.type == null) {
        deepObject(item, (config, props) => {
          if (value[props] == null) {
            value[props] =
              value[props] || setComponentDefaultValue(config.type);
          }
        });
      } else {
        value[key] = value[key] || setComponentDefaultValue(item.type);
      }
    } else {
      delete result.config[key];
    }
  });
  return result;
};
export const formatRuleComponentConfig = ({ type, config, data }) => {
  let obj = {
    config,
    data
  };
  // Object.keys(config).forEach((key) => {
  //   if (key.includes('-')) {
  //     obj['config'][`${key.split('-')[0]}-${type}_${key.split('-')[1]}`] =
  //       Object.keys(config[key]).reduce((memo, item) => {
  //         memo[`${type}_${item}`] = config[key][item];
  //         obj['data'][`${type}_${item}`] = data[item];
  //         return memo;
  //       }, {});
  //   } else {
  //     obj['config'][`${type}_${key}`] = config[key];
  //     obj['data'][`${type}_${key}`] = data[key];
  //   }
  // });
  return obj;
};

export const execCommandWrap = (DAPENG_INJECT_DATA = {}) => {
  let cache = {};
  function handRepeatKey(mergeConfigs, keys = {}) {
    mergeConfigs.forEach(({ data }) => {
      if (data != null) {
        for (let key in data) {
          if (keys[key] != null) {
            CommandWrap.repetitiveKeys.push(key);
          }
          keys[key] = true;
        }
      }
    });
  }
  function execCommand(expression) {
    const mergeInternalConfigs = [];
    const mergeExternalConfigs = [];
    const module = {
      exports: {
        config: {}
      }
    };
    function AutoAddInternalComponent(config = { config: {} }) {
      mergeInternalConfigs.push(config);
    }
    function AutoAddExternalComponent(path = '') {
      const config = formatRuleComponentConfig(daPeng_require(path));
      mergeExternalConfigs.push(config);
    }
    function daPeng_require(path = '') {
      if (cache[path]) {
        return cache[path];
      }
      const sourceData = DAPENG_INJECT_DATA.editorMap;
      let type = path.split('/').shift();
      if (type.startsWith('@')) {
        type = type.slice(1);
        const relativePath = path.split('/').slice(1).join('/');
        const content = sourceData[type][relativePath];
        if (relativePath.endsWith('.json')) {
          if (typeof content === 'string') {
            try {
              cache[path] = new Function(`return ${content}`)();
            } catch (error) {
              cache[path] = JSON.parse(content);
            }
          } else {
            cache[path] = content;
          }
          return cache[path];
        }
        cache[path] = execCommand(sourceData[type][relativePath]);
        return cache[path];
      }
    }
    try {
      const fn = new Function(
        'module',
        'daPeng_require',
        'AutoAddExternalComponent',
        'AutoAddInternalComponent',
        `${expression}`
      );
      fn(
        module,
        daPeng_require,
        AutoAddExternalComponent,
        AutoAddInternalComponent
      );
      const baseObject = {
        data: module.exports.data,
        config: module.exports.config
      };
      const mergeConfigs = [
        ...mergeExternalConfigs,
        ...mergeInternalConfigs,
        baseObject
      ];
      handRepeatKey(mergeConfigs);
      module.exports = merge(module.exports, ...mergeConfigs);
      return module.exports;
    } catch (e) {
      console.log('预览错误:', e);
      message.error('预览错误');
      return module.exports;
    }
  }
  function CommandWrap(...args) {
    CommandWrap.repetitiveKeys = [];
    const result = execCommand(...args);
    cache = {};
    return result;
  }
  CommandWrap.repetitiveKeys = [];
  return CommandWrap;
};
