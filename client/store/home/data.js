import { observable } from 'mobx'

let store = observable({
  config: {
    bannerList: [], // 轮播配置
    recommendList: [] // 优秀推荐配置
  },
  selectDepartmentId: '', // 选择的事业部
  category: [], // page接口数据
  drawerData: [], // 左侧菜单数据
  themeType: '', // 左侧菜单选中的模板分类
  themeGroup: '', // 左侧菜单选中的模板组
  themeHotList: [], // 模板热度列表
  selectDrawerNav: '', // 左侧菜单选中项，我的收藏、优秀推荐
  themeListMap: {}, // 首页模板分类对应的列表数据
  search: {
    // 首页搜索数据
    currentPage: 1,
    total: 1,
    list: []
  },
  // 重命名模板
  renameThemeInfoModal: {
    name: '',
    lastModified: '',
    createdAt: '',
    creator: '',
    onClose: () => {},
    onSubmit: () => {}
  },
  // 复制模板
  copyThemeInfoModal: {
    themeId: '',
    name: '',
    onClose: () => {},
    onSubmit: () => {}
  },
  // 审核模板
  examineThemeInfoModal: {
    auditButtonContent: '',
    name: '',
    statusInfo: '',
    auditStatus: '',
    lastModified: '',
    createdAt: '',
    creator: '',
    onClose: () => {},
    onSubmit: () => {}
  },
  // 创建模板
  createThemeModal: {
    show: false,
    showCreateThemeType: false, // 显示模版类型下拉项
    themeType: '',
    themeGroupId: '',
    onClose: () => {},
    onSubmit: () => {}
  },
  // 移动模板
  removeThemeModal: {
    show: false,
    themeType: '',
    themeGroupId: '',
    onClose: () => {},
    onSubmit: () => {}
  },
  // 创建模板类型
  createThemeTypeModal: {
    show: false,
    currentTempleteData: {},
    onClose: () => {},
    onSubmit: () => {}
  },
  // 创建模板组
  createThemeGroupModal: {
    show: false,
    onClose: () => {},
    onSubmit: () => {}
  },
  // 预览
  previewThemeModal: {
    show: false,
    themeInfo: {},
    onClose: () => {},
    onSubmit: () => {}
  },
  // 创建模板项目
  createThemeProjectModal: {
    show: false,
    onClose: () => {},
    onSubmit: () => {}
  },
  // 更新模板组
  editThemeGroupModal: {
    name: '',
    weight: 0,
    themeCount: '',
    lastModified: '',
    createdAt: '',
    creator: '',
    onClose: () => {},
    onSubmit: () => {}
  },
  // 二级页面数据
  listData: {
    themeTypeData: {},
    themeGroupId: '',
    themeGroupIdCurrentIndex: '',
    currentPage: 1,
    search: '',
    auditStatus: '',
    loading: false,
    sectionArray: [
      {
        _id: '',
        list: []
      }
    ], // 二维数组
    total: 1
  }
})

export default store
