import { action } from 'mobx';
import 'globals';
import god from 'common/god';
import controls from './controls';
import data from './data';
import toString from 'tosource';
import beautify from 'js-beautify';
import LocalStorage from 'common/localStorage';
import QueryString from 'common/queryString';
import patch from 'fast-json-patch';
import { Modal, message } from 'antd';
import {
  setComponentDefaultValue,
  execCommandWrap,
  wrapCustomComponent
} from './utils/index';
import { mountRule, loadFileContent } from 'apis/RuleAPI';
import HandleEditor from './babelT';
import { toastError } from 'components/HEToast';
import { getComponentInfo } from 'common/componentsAction';
import { widgetCount } from 'apis/WidgetAPI';

const execCommand = execCommandWrap(data);
function findMaxIndexByName(name, max = 0) {
  const d = data.index.data;
  Object.keys(d).forEach((key) => {
    const reg = new RegExp(`${name}_(\\d+)`, 'g');
    const result = reg.exec(key);
    if (result != null) {
      max = Math.max(max, Number(result[1]));
    }
  });
  return max + 1;
}
const selectControl = (type) => {
  const baseControl = Object.assign({}, controls[type], { type });
  const max = findMaxIndexByName(type);
  const result = {
    config: { [`${type}_${max}`]: baseControl },
    data: {
      [`${type}_${max}`]: setComponentDefaultValue(type)
    }
  };
  addComponent(`AutoAddInternalComponent(${toString(result)})`);
};
const handleLoading = (isLoading = true, tip = 'load....') => {
  data.loading = {
    isLoading,
    tip
  };
};
const selectRuleComponent = async ({ type }) => {
  handleLoading(true, '外部组件加载中...');
  await handleFilecontent(type);
  handleLoading(false);
  addComponent(`AutoAddExternalComponent("@${type}/index.js");`);
  // 更新组件插入次数
  widgetCount(type);
};
const addComponent = (content = '') => {
  const mainType = data.type;
  const mainContent = data.editorMap[mainType]['index.js'];
  data.editorMap[mainType]['index.js'] = `${content}\n${mainContent}`;
  handlePreview(false);
  handleFormat(`@${mainType}/index.js`, false);
};

const updateEditorValue = (value) => {
  const tab = data.tab;
  const type = tab.split('/')[0].slice(1);
  const path = tab.split('/').slice(1).join('/');
  if (path.endsWith('.json') && typeof value === 'string') {
    try {
      value = new Function(`return ${value}`)();
    } catch (error) {
      value = JSON.parse(value);
    }
  }
  data.editorMap[type][path] = value;
};
const handlePreview = (isShowToast = true) => {
  try {
    handleError(false);
    const value = data.editorMap[data.type]['index.js'];
    data.index = execCommand(value);
    if (execCommand.repetitiveKeys.length > 0) {
      message.warn(
        `请注意,这些key值： ${execCommand.repetitiveKeys
          .slice(0, 3)
          .join(',')}等重复!!!`
      );
      return true;
    }
    if (isShowToast) {
      message.success('预览成功');
    }
  } catch (error) {
    isShowToast && message.error('预览失败');
  }
};
const handleFormat = (tab = '', isShowToast = true) => {
  if (tab === '') {
    tab = data.tab;
  } else {
    data.tab = tab;
  }
  const type = tab.split('/')[0].slice(1);
  const path = tab.split('/').slice(1).join('/');
  const str = beautify.js(data.editorMap[type][path]);
  updateEditorValue(str);
  isShowToast && message.success('格式化成功');
};
const handleSave = () => {
  data.lastModifyTime = Date.now();
  LocalStorage.setItem(
    data.type,
    JSON.stringify({
      editorMap: data.editorMap,
      package: data.package,
      tab: data.tab
    })
  );
  message.success('保存成功');
};
const handleAccessTokenSave = (accessToken) => {
  localStorage.setItem('accessToken', accessToken);
};
const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};
const removeSave = () => {
  return LocalStorage.removeItem(data.type);
};
const UpdateVersion = (version, type = 'add') =>
  version.replace(/(\d+)\.(\d+)\.(\d+)(.*)/, (a, b, c, d, e) => {
    return b + '.' + c + '.' + (Number(d) + (type === 'add' ? 1 : -1)) + e;
  });
const handleSend = () => {
  if (!handlePreview(false)) {
    publishRuleComponent.onShow();
  }
};

const setPackageData = ({
  type,
  name,
  desc,
  department,
  version = '0.0.0'
}) => {
  data.type = type;
  data.package.type = type;
  data.package.name = type.toLowerCase();
  data.package.name_cn = name;
  data.package.desc = desc;
  data.package.description = desc;
  data.package.version = version;
  data.package.department = department;
  data.index.type = type;
  data.index.name = name;
};
const createRuleComponet = async ({
  show,
  onClose = () => {},
  onSubmit = () => {}
}) => {
  data.createRuleComponetModal = {
    show,
    onClose: () => {
      onClose && onClose();
      data.createRuleComponetModal = {};
    },
    onSubmit: async ({ type, name, desc, department }) => {
      const componentInfo = (await getComponentInfo(type, 'rule')) || {};
      if (componentInfo.type) return toastError('组件名称已存在，请重新输入');
      setPackageData({ type, name, desc, department });

      if (type && data.editorMap[type] == null) {
        data.editorMap[type] = {};
      }
      data.editorMap[type]['index.js'] = beautify.js(
        `module.exports={type:${JSON.stringify(type)},name:${JSON.stringify(
          name
        )},config:{},data:{},beforePublish:()=>{}}`
      );
      await LocalStorage.setItem(
        type,
        JSON.stringify({
          editorMap: data.editorMap,
          package: data.package,
          tab: `@${type}/index.js`
        })
      );
      data.lastModifyTime = Date.now();
      location.href = '/ruleManage?type=' + type;
      onSubmit && onSubmit();
      data.createRuleComponetModal = {};
    }
  };
};
const rewriteData = ({ env }) => {
  data.package.env = env;
  data.package.author = god.PageData.userInfo.userId;
  data.package.version = UpdateVersion(data.package.version);
};
const publishRuleComponent = {
  onShow: () => {
    data.publishRuleComponentModal = true;
  },
  onClose: () => {
    data.publishRuleComponentModal = false;
  },
  onSubmit: async ({ info, env, access_token }) => {
    data.publishRuleComponentModal = false;
    handleLoading(true, '发布中...');
    try {
      const { editorMap } = data;
      rewriteData({ info, env, access_token });
      const code = `const DAPENG_INJECT_DATA=${JSON.stringify({ editorMap })}`;
      const wrapIndex = wrapCustomComponent(
        code,
        data.type,
        data.package.version
      );
      const packages = JSON.stringify(
        Object.assign(data.package, { byWebEditor: true }),
        null,
        2
      );
      await mountRule({
        accessToken: access_token,
        commit: info,
        packages,
        index: wrapIndex
      });
      await removeSave();
      handleAccessTokenSave(access_token);
      handleLoading(false);
      message.success({ content: '发布成功' });
      location.href =
        '/monster/widget/rule?type=rule&name=%E8%A7%84%E5%88%99%E7%BB%84%E4%BB%B6';
    } catch (error) {
      handleLoading(false);
      message.error({ content: '发布失败: ' + error.message });
      data.package.version = UpdateVersion(data.package.version, 'remove');
    }
  }
};
const mergeEditorMap = (newEditorMap) => {
  const EditorMap = data.editorMap;
  return Object.assign({}, EditorMap, newEditorMap);
};
const handleFilecontent = async (type) => {
  const content = await loadFileContent({ type });
  const byWebEditor = content.find(({ path }) => path === 'package.json')
    .content.byWebEditor;
  const newContent = new HandleEditor(content, type, byWebEditor).init();
  data.editorMap = mergeEditorMap(newContent);
};
const analysisQuery = async ({ history }) => {
  const { type, version } = QueryString.parse(history.location.search);
  const lastModifyTime = data.lastModifyTime;
  let localData = await LocalStorage.getItem(type);
  localData = localData ? JSON.parse(localData) : undefined;
  if (type) {
    data.type = type;
  }
  if (type && version) {
    const componentInfo =
      (await getComponentInfo(type, 'rule')) || {};
    if(componentInfo.xcli) return handleLoading(true, '不能编辑x-cli发布的组件');
    if (componentInfo.version && componentInfo.version != version) {
      return Modal.confirm({
        className: 'rule-component-edit-update-version-modal-confirm-wrapper',
        title: '编辑中断？',
        content: '只能编辑最新版本，确定加载最新版本？',
        okText: '确定',
        cancelText: '',
        onOk: async () => {
          location.href =
            '/ruleManage?type=' + type + '&version=' + componentInfo.version;
        }
      });
    }
    handleLoading(true, '加载中...');
    await handleFilecontent(type);
    if (
      localData &&
      patch.compare(data.editorMap, localData.editorMap || {}).length > 0
    ) {
      Modal.confirm({
        title: '编辑中断？',
        content:
          '本地改动已经保存，上次修改时间为' +
          new Date(lastModifyTime) +
          '是否加载本地修改？',
        okText: '加载本地改动',
        cancelText: '忽略吧~',
        onOk: async () => {
          data.package = localData.package;
          data.editorMap = localData.editorMap;
          data.tab = localData.tab;
          data.index = execCommand(localData.editorMap[type]['index.js']);
        },
        onCancel: async () => {
          await LocalStorage.removeItem(type);
          data.tab = `@${type}/index.js`;
          data.index = execCommand(data.editorMap[type]['index.js']);
        }
      });
    } else {
      console.log(data.editorMap[type]);
      data.tab = `@${type}/index.js`;
      data.index = execCommand(data.editorMap[type]['index.js']);
    }
    handleLoading(false);
    setPackageData({
      type: componentInfo.type || type,
      name: componentInfo.name,
      desc: componentInfo.desc,
      department: componentInfo.department,
      version: componentInfo.version || version
    });
  } else if (type && localData) {
    data.package = localData.package;
    data.editorMap = localData.editorMap;
    data.tab = localData.tab;
    data.index = execCommand(localData.editorMap[type]['index.js']);
  } else {
    createRuleComponet({ show: true, history });
  }
};
const handleError = (result) => {
  data.hasError = result;
};
const handleEditorTabChange = (tab) => {
  data.tab = tab;
};
let actions = {
  handleError,
  getAccessToken,
  parse: execCommand,
  // inspect,
  handleFormat,
  handleSend,
  handleSave,
  handlePreview,
  selectControl,
  selectRuleComponent,
  updateEditorValue,
  createRuleComponet,
  publishRuleComponent,
  analysisQuery,
  handleEditorTabChange
};
const createActions = (actions) => {
  return Object.entries(actions).reduce((memo, item) => {
    if (typeof item[1] === 'function') {
      memo[item[0]] = action(item[1]);
    } else {
      memo[item[0]] = createActions(item[1]);
    }

    return memo;
  }, {});
};
export default createActions(actions);
