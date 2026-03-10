export const baseControlsArray = [
  { type: 'NormalText', name: '普通文本' },
  { type: 'InputNumber', name: '数字输入框' },
  { type: 'Radio', name: '单选-按照是否形式展示' },
  { type: 'RadioButton', name: '单选-按钮形式' },
  { type: 'CheckBox', name: '多选' },
  { type: 'Select', name: '下拉选择' },
  { type: 'MultipleSelect', name: '下拉选择多选' },
  { type: 'FilePicker', name: '文件选择' },
  { type: 'Slider', name: '滑块-可拖动调整数值' },
  { type: 'TimePicker', name: '时间选择器' },
  { type: 'ColorPicker', name: '颜色选择' },
  { type: 'Set', name: 'key-value集合' },
  { type: 'AssembleList', name: '选项列表' },
];
let defaultConfig = {
  text: '',
  type: '',
  msg: '',
  value: '',
  require: false,
};

const controlsExtraConfig = {
  InputNumber: {
    step: 1,
  },
  Radio: {
    options: [
      { text: 'Radio', value: '1' },
    ]
  },
  RadioButton: {
    options: [
      { text: 'RadioButton', value: '1' },
    ]
  },
  CheckBox: {
    options: [
      { text: 'CheckBox', value: '1' },
    ]
  },
  Select: {
    options: [
      { text: 'Select', value: '1' },
    ]
  },
  MultipleSelect: {
    options: [
      { text: 'MultipleSelect', value: '1' },
    ]
  },
  FilePicker: {
    controlParams: {
      type: 'Image' // 限制选择类型，支持Image，Video，Audio, File
    }
  },
  Slider: {
    min: 0,
    max: 100
  },
  Set: {
    value: {
      clickid: {
        type: '',
        value: '0.1'
      }
    }
  },
  AssembleList: {
    noAssembleListDragSort: false,
    minCount: 1, // 最小个数
    maxCount: 6, // 最大个数
    itemTitle: '配置Item',
    fields: {},
    value: []
  }
};
let controlsConfig = baseControlsArray.reduce((memo, item) => {
  memo[item.type] = { ...defaultConfig, ...controlsExtraConfig[item.type], text: item.name };
  return memo;
}, {});
export default controlsConfig;