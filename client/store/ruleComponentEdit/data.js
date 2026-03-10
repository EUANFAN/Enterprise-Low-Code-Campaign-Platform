import { observable } from 'mobx';
let store = observable({
  hasError: false,
  loading: {
    isLoading: false,
    tip: '加载中...'
  },
  type: '',
  tab: '',
  package: {
    name: '',
    name_cn: '',
    desc: '',
    type: '',
    version: '0.0.0',
    category: 'rule',
    description: '',
    main: 'index.js',
    scripts: {},
    author: '',
    department: 'wx',
    platform: ['h5', 'pc'],
    env: 'prod',
    license: 'ISC',
  },
  editorMap: {},
  index: {
    type: '',
    name: '',
    category: 'rule',
    data: {},
    config: {},
    beforePublish: () => {},
  },
  publishRuleComponentModal: false,
  createRuleComponetModal: {
    show: false,
    onClose: () => {},
    onSubmit: () => {},
  },
  lastModifyTime: Date.now()
});

export default store;
