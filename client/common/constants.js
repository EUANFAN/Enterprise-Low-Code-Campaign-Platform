const CLIENT_LIST = [
  {
    text: '微信',
    value: 'wx'
  },
  {
    text: '微信小程序',
    value: 'wxmini'
  },
  {
    text: '其他',
    value: 'other'
  }
]

const HomeSecondaryPageCategories = {
  POPULAR: 'popular',
  THEME: 'theme',
  FREE: 'free'
}

const ThemeCategories = {
  free: '自由创建',
  theme: '模板创建',
  popular: ''
}

const ResourceSecondaryPages = {
  OFFICIAL_IMAGE: 'officialImage',
  OFFICIAL_AUDIO: 'officialAudio',
  OFFICIAL_VIDEO: 'officialVideo',
  OFFICIAL_FILE: 'officialFile',
  MY_IMAGE: 'myImage',
  MY_AUDIO: 'myAudio',
  MY_VIDEO: 'myVideo',
  MY_FILE: 'myFile'
}

const ThemeGroupTypes = {
  MODAL: 'modal',
  BRAND_BANNER: 'brandBanner',
  NORMAL: 'normal'
}

const PAGE_STATE_VAR_TAG_REGEX = /\$\{(\w+)\.(\w+)\}/g
const PROJECT_VARIABLE_REGEX = /\$\{(\w+)\.(\w+)\.(\w+)\}/g
const PAGE_STATE_KEY_REGEX = /<p>\$\{(\w+)\.(\w+)\}<\/p>/g
const QUERY_SEPARATOR = '+'

const ActionKeys = {
  SCREENSHOT: 'SCREENSHOT',
  SCREENSHOT_RESULT: 'SCREENSHOT_RESULT',
  PREVIEW_SCREENSHOT: 'PREVIEW_SCREENSHOT',
  PREVIEW_SCREENSHOT_RESULT: 'PREVIEW_SCREENSHOT_RESULT'
}

const PageData = god['PageData']
const PAGE_WIDTH = 375
const PAGE_HEIGHT = 603
const LAYER_HEIGHT = 200
const STATIC_URL = PageData.STATIC_URL
const DEFAULT_PADDING = '0 0 0 0'
const DOMAIN_WHITE_LIST = ['xiwang.com']
const WIDGET_EVENT = [
  { text: '点击', value: 'click' },
  { text: '触摸开始/鼠标按下', value: 'touchStart' },
  { text: '触摸结束/鼠标弹起', value: 'touchEnd' }
]

const PROJECT_STATUS = [
  {
    text: '配置中',
    index: 0,
    backgroundColor: '#FFBB4C',
    color: '#ffffff',
    borderRadius: '2px',
    padding: '1px 5px'
  },
  {
    text: '审核中',
    index: 1,
    backgroundColor: '#333',
    color: '#e1ae84',
    borderRadius: '2px',
    padding: '1px 5px'
  },
  {
    text: '被驳回',
    index: 2,
    backgroundColor: '#333',
    color: '#e1ae84',
    borderRadius: '2px',
    padding: '1px 5px'
  },
  { text: '待上线', index: 3, backgroundColor: '#333', color: '#e1ae84' },
  {
    text: '已上线',
    index: 4,
    backgroundColor: '#32DDA1',
    color: '#ffffff',
    borderRadius: '2px',
    padding: '1px 5px'
  },
  {
    text: '影子审核中',
    index: 5,
    backgroundColor: '#333',
    color: '#e1ae84',
    borderRadius: '2px',
    padding: '1px 5px'
  },
  {
    text: '影子被驳回',
    index: 6,
    backgroundColor: '#333',
    color: '#e1ae84',
    borderRadius: '2px',
    padding: '1px 5px'
  },
  {
    text: '影子待上线',
    index: 7,
    backgroundColor: '#333',
    color: '#e1ae84',
    borderRadius: '2px',
    padding: '1px 5px'
  },
  {
    text: '已冻结',
    index: 8,
    backgroundColor: '#333',
    color: '#e1ae84',
    borderRadius: '2px',
    padding: '1px 5px'
  },
  {
    text: '已下线',
    index: 9,
    backgroundColor: '#ADB4BE',
    color: '#e1ae84',
    borderRadius: '2px',
    padding: '1px 5px'
  }
]

const TAG_TITLE = { all: '全部', common: '通用组件', custom: '业务组件' }
const PROJECT_RUNNING_STATUS = { NO_START: '还未开始', COMPLETE: '已经下线了' }
const COMPONENT_PLATS = [
  { key: 'H5', value: 'h5' },
  { key: '小程序+H5', value: 'miniProgram' }
]
const DefaultMiniInfo = {
  wxid: 'wx8a0885f7d58d2d02',
  name: '希望学活动',
  id: 'gh_de755964442e'
}
const BUSINESS_LINE_HOST = {
  xueersi: 'm.xiwang.com',
  xiwang: 'm.xiwang.com',
  vipx: 'h5.vipx.com'
}

export {
  HomeSecondaryPageCategories,
  ThemeCategories,
  ResourceSecondaryPages,
  ThemeGroupTypes,
  PAGE_STATE_VAR_TAG_REGEX,
  PAGE_STATE_KEY_REGEX,
  PROJECT_VARIABLE_REGEX,
  QUERY_SEPARATOR,
  ActionKeys,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  LAYER_HEIGHT,
  DOMAIN_WHITE_LIST,
  STATIC_URL,
  DEFAULT_PADDING,
  WIDGET_EVENT,
  PROJECT_STATUS,
  CLIENT_LIST,
  TAG_TITLE,
  PROJECT_RUNNING_STATUS,
  COMPONENT_PLATS,
  DefaultMiniInfo,
  BUSINESS_LINE_HOST
}
