const { db } = require('../utils/mongo');
const instance = db();
const bizunitList = [
  {
    permissionRule: {
      editor: {
        value: '1',
        name: '自定义项目',
        key: 'editor',
        children: {
          editorWidget: {
            value: '1',
            name: '组件展示',
            key: 'editorWidget',
            children: {
              editorUIWidgetCommon: {
                value: '1',
                name: 'UI通用组件',
                key: 'editorUIWidgetCommon'
              },
              editorUIWidgetCustom: {
                value: '1',
                name: 'UI业务组件',
                key: 'editorUIWidgetCustom'
              },
              editorTriggerWidgetCommon: {
                value: '1',
                name: '行为通用组件',
                key: 'editorTriggerWidgetCommon'
              },
              editorTriggerWidgetCustom: {
                value: '1',
                name: '行为业务组件',
                key: 'editorTriggerWidgetCustom'
              }
            }
          },
          editorBaseWidget: {
            value: '1',
            name: '顶部基础组件',
            key: 'editorBaseWidget',
            children: {
              editorBaseWidgetText: {
                value: '1',
                name: '顶部基础组件-文本',
                key: 'editorBaseWidgetText'
              },
              editorBaseWidgetImg: {
                value: '1',
                name: '顶部基础组件-图片',
                key: 'editorBaseWidgetImg'
              },
              editorBaseWidgetVideo: {
                value: '1',
                name: '顶部基础组件-视频',
                key: 'editorBaseWidgetVideo'
              },
              editorBaseWidgetButton: {
                value: '1',
                name: '顶部基础组件-按钮',
                key: 'editorBaseWidgetButton'
              },
              editorBaseWidgetHotArea: {
                value: '1',
                name: '顶部基础组件-热区',
                key: 'editorBaseWidgetHotArea'
              },
              editorBaseWidgetContainer: {
                value: '1',
                name: '顶部基础组件-容器',
                key: 'editorBaseWidgetContainer'
              },
              editorBaseWidgetDataContainer: {
                value: '1',
                name: '顶部基础组件-数据模板',
                key: 'editorBaseWidgetDataContainer'
              }
            }
          },
          editorProjectPanel: {
            value: '1',
            name: '项目配置',
            key: 'editorProjectPanel',
            children: {
              editorProjectPanelBackgroundColor: {
                value: '1',
                name: '项目配置-背景颜色',
                key: 'editorProjectPanelBackgroundColor'
              },
              editorProjectPanelBgImage: {
                value: '1',
                name: '项目配置-背景图片',
                key: 'editorProjectPanelBgImage'
              },
              editorProjectPanelStageWidth: {
                value: '1',
                name: '项目配置-舞台宽度',
                key: 'editorProjectPanelStageWidth'
              },
              editorProjectPanelImgLazyLoad: {
                value: '1',
                name: '项目配置-图片懒加载',
                key: 'editorProjectPanelImgLazyLoad'
              },
              editorProjectPanelUseData: {
                value: '1',
                name: '项目配置-使用数据',
                key: 'editorProjectPanelUseData'
              },
              editorProjectPanelShowDisplay: {
                value: '1',
                name: '项目配置-展示显示条件',
                key: 'editorProjectPanelShowDisplay'
              },
              editorProjectPanelUserSelect: {
                value: '1',
                name: '项目配置-长按选择文本',
                key: 'editorProjectPanelUserSelect'
              },
              editorProjectPanelLayout: {
                value: '1',
                name: '项目配置-页面布局',
                key: 'editorProjectPanelLayout'
              },
              editorProjectPanelLog: {
                value: '1',
                name: '项目配置-日志平台',
                key: 'editorProjectPanelLog'
              },
              editorProjectPanelComLogData: {
                value: '1',
                name: '项目配置-日志公共字段',
                key: 'editorProjectPanelComLogData'
              },
              editorProjectPanelDataBox: {
                value: '1',
                name: '项目配置-配置数据',
                key: 'editorProjectPanelDataBox'
              },
              editorProjectPanelComponentPlat: {
                value: '1',
                name: '项目配置-小程序选择',
                key: 'editorProjectPanelComponentPlat'
              }
            }
          },
          editorPagePanel: {
            value: '1',
            name: '页面配置',
            key: 'editorPagePanel',
            children: {
              editorPagePanelDataBox: {
                value: '1',
                name: '页面配置-配置数据',
                key: 'editorPagePanelDataBox'
              }
            }
          },
          editorWidgetPanel: {
            value: '1',
            name: '组件配置',
            key: 'editorWidgetPanel',
            children: {
              editorWidgetPanelLayout: {
                value: '1',
                name: '组件配置-布局形式',
                key: 'editorWidgetPanelLayout'
              }
            }
          },
          editorAnimationPanel: {
            value: '1',
            name: '动画',
            key: 'editorAnimationPanel'
          },
          editorLayerPanel: {
            value: '1',
            name: '图层',
            key: 'editorLayerPanel'
          },
          editorTriggerPanel: {
            value: '1',
            name: '行为',
            key: 'editorTriggerPanel'
          },
          editorConditionPanel: {
            value: '1',
            name: '显示条件',
            key: 'editorConditionPanel'
          }
        }
      },
      chooseBizUnit: {
        value: '1',
        name: '切换事业部',
        desc: '该字段为最高权限，请勿随意配置，包含显示切换事业部，搜索所有事业部的项目,外部组件等',
        key: 'chooseBizUnit'
      },
      themesCenter: {
        value: '1',
        name: '模板中心',
        des: '是否能够进入模版中心',
        children: {
          managerThemeAll: {
            name: '查看所有未审核的模板',
            desc: '仅控制筛选模版类型中的全部选项',
            key: 'managerThemeAll',
            value: '1'
          },
          themeAppro: { name: '模版审核', value: '1', key: 'themeAppro' },
          deleteTheme: { name: '删除模版', value: '1', key: 'deleteTheme' },
          addTheme: { name: '自定义模版', value: '1', key: 'addTheme' },
          modifyTheme: { name: '编辑模版', value: '1', key: 'modifyTheme' },
          copyTheme: { name: '复制模版', value: '1', key: 'copyTheme' },
          renameTheme: { name: '重命名模版', value: '1', key: 'renameTheme' },
          moreOptionTheme: {
            name: '模版更多操作入口',
            value: '1',
            key: 'moreOptionTheme'
          },
          deleteThemeGroups: {
            name: '删除模版组',
            value: '1',
            key: 'deleteThemeGroups'
          },
          updateThemeGroup: {
            name: '模版组管理',
            value: '1',
            key: 'updateThemeGroup'
          },
          renameThemeGroups: {
            name: '重命名模版组',
            value: '1',
            key: 'renameThemeGroups'
          }
        },
        key: 'themesCenter'
      },
      projectCenter: {
        value: '1',
        name: '我的项目',
        des: '该配置影响用户是否能看到‘我的页面’入口',
        children: {
          managerAllProject: {
            false: 'false',
            name: '是否能够管理本事业部所有的项目',
            key: 'managerAllProject',
            value: '1'
          },
          addProject: {
            value: '1',
            name: '新建项目/文件夹',
            key: 'addProject'
          },
          createRuleProject: {
            value: '1',
            name: '规则项目所有权限（包含创建/编辑等）',
            key: 'createRuleProject'
          },
          lookProject: { value: '1', name: '进入项目编辑', key: 'lookProject' },
          lookProjectLog: {
            value: '1',
            name: '查看项目历史记录',
            key: 'lookProjectLog'
          },
          lookProjectData: {
            value: '1',
            name: '查看项目数据',
            key: 'lookProjectData'
          },
          copyProject: { value: '1', name: '复制项目', key: 'copyProject' },
          deleteProject: {
            value: '1',
            name: '删除项目/文件夹',
            key: 'deleteProject'
          },
          moveProject: {
            value: '1',
            name: '移动项目/文件夹至文件夹',
            key: 'moveProject'
          },
          renameProject: {
            value: '1',
            name: '重命名项目/文件夹',
            key: 'renameProject'
          },
          transProjectToUser: {
            value: '1',
            name: '转移项目/文件夹至其他用户',
            key: 'transProjectToUser'
          },
          inviteUserManagerProject: {
            value: '1',
            name: '邀请其他用户协调管理项目/文件夹',
            key: 'inviteUserManagerProject'
          },
          lookBinProject: {
            value: '1',
            name: '查看回收站项目',
            key: 'lookBinProject'
          },
          restoreBinProject: {
            value: '1',
            name: '还原回收站项目',
            key: 'restoreBinProject'
          },
          saveProject: { value: '1', name: '保存项目', key: 'saveProject' },
          publishProject: {
            value: '1',
            name: '发布项目',
            key: 'publishProject'
          },
          saveProjectToTheme: {
            value: '1',
            name: '将项目保存为模版',
            key: 'saveProjectToTheme'
          }
        },
        key: 'projectCenter'
      },
      users: {
        value: '1',
        name: '管理后台-用户管理',
        children: {
          modifyUserRole: {
            value: '1',
            name: '修改用户角色',
            key: 'modifyUserRole'
          }
        },
        key: 'users'
      },
      userRoles: {
        value: '1',
        name: '管理后台-角色管理',
        children: {
          modifyUserRolePermission: {
            value: '1',
            name: '编辑角色权限',
            key: 'modifyUserRolePermission'
          }
        },
        key: 'userRoles'
      },
      widgets: {
        value: '1',
        name: '管理后台-组件管理',
        children: {
          modifyWidgetTags: {
            value: '1',
            name: '修改组件标签',
            key: 'modifyWidgetTags'
          },
          restoreWidget: { value: '1', name: '还原组件', key: 'restoreWidget' },
          deleteWidget: { value: '1', name: '删除组件', key: 'deleteWidget' }
        },
        key: 'widgets'
      },
      data: {
        value: '1',
        name: '管理后台-数据看板',
        key: 'data',
        children: {
          dataPlatform: {
            value: '1',
            name: '数据看板/平台看板',
            key: 'dataPlatform'
          },
          dataProject: {
            value: '1',
            name: '数据看板/项目看板',
            key: 'dataProject'
          }
        }
      },
      notice: { value: '1', name: '管理后台-公告管理', key: 'notice' },
      couponconfig: { value: '1', name: '领券中心后台', key: 'couponconfig' },
      tags: {
        value: '1',
        name: '组件标签管理',
        desc: '控制组件便签的增删改',
        key: 'tags'
      },
      drawconfig: {
        value: '1',
        name: '抽奖策略管理',
        key: 'drawconfig',
        children: {
          showConfig: {
            key: 'showConfig',
            value: '1',
            name: '抽奖策略管理'
          },
          searchConfig: {
            value: '1',
            name: '抽奖明细查询',
            key: 'searchConfig'
          },
          awardConfig: {
            value: '1',
            name: '奖品列表配置',
            key: 'awardConfig'
          },
          addressConfig: {
            value: '1',
            name: '用户地址配置',
            key: 'addressConfig'
          },
          reserveManage: {
            value: '1',
            name: '库存管理',
            key: 'reserveManage'
          },
          updateAllConfig: {
            value: '1',
            name: '更改所有抽奖配置',
            key: 'updateAllConfig'
          }
        }
      },
      activity: {
        value: '1',
        name: '活动管理',
        key: 'activity',
        children: {
          list: {
            value: '1',
            name: '活动列表',
            key: 'list'
          }
        }
      },
      themeManage: {
        value: '1',
        name: '管理后台-模板管理',
        children: {
          editThemeManage: {
            value: '1',
            name: '编辑模板',
            key: 'editThemeManage'
          }
        },
        key: 'themeManage'
      },
      content: {
        value: '1',
        name: '未来号内容模板后台',
        key: 'content'
      }
    },
    name: '超级管理员',
    des: '拥有全事业部所有权限'
  },
  {
    name: '普通用户',
    default: true,
    permissionRule: {
      editor: {
        value: '1',
        name: '自定义项目',
        key: 'editor',
        children: {
          editorWidget: {
            value: '1',
            name: '组件展示',
            key: 'editorWidget',
            children: {
              editorUIWidgetCommon: {
                value: '1',
                name: 'UI通用组件',
                key: 'editorUIWidgetCommon'
              },
              editorUIWidgetCustom: {
                value: '1',
                name: 'UI业务组件',
                key: 'editorUIWidgetCustom'
              },
              editorTriggerWidgetCommon: {
                value: '1',
                name: '行为通用组件',
                key: 'editorTriggerWidgetCommon'
              },
              editorTriggerWidgetCustom: {
                value: '1',
                name: '行为业务组件',
                key: 'editorTriggerWidgetCustom'
              }
            }
          },
          editorBaseWidget: {
            value: '1',
            name: '顶部基础组件',
            key: 'editorBaseWidget',
            children: {
              editorBaseWidgetText: {
                value: '1',
                name: '顶部基础组件-文本',
                key: 'editorBaseWidgetText'
              },
              editorBaseWidgetImg: {
                value: '1',
                name: '顶部基础组件-图片',
                key: 'editorBaseWidgetImg'
              },
              editorBaseWidgetVideo: {
                value: '1',
                name: '顶部基础组件-视频',
                key: 'editorBaseWidgetVideo'
              },
              editorBaseWidgetButton: {
                value: '1',
                name: '顶部基础组件-按钮',
                key: 'editorBaseWidgetButton'
              },
              editorBaseWidgetHotArea: {
                value: '1',
                name: '顶部基础组件-热区',
                key: 'editorBaseWidgetHotArea'
              },
              editorBaseWidgetContainer: {
                value: '1',
                name: '顶部基础组件-容器',
                key: 'editorBaseWidgetContainer'
              },
              editorBaseWidgetDataContainer: {
                value: '1',
                name: '顶部基础组件-数据模板',
                key: 'editorBaseWidgetDataContainer'
              }
            }
          },

          editorProjectPanel: {
            value: '1',
            name: '项目配置',
            key: 'editorProjectPanel',
            children: {
              editorProjectPanelBackgroundColor: {
                value: '1',
                name: '项目配置-背景颜色',
                key: 'editorProjectPanelBackgroundColor'
              },
              editorProjectPanelBgImage: {
                value: '1',
                name: '项目配置-背景图片',
                key: 'editorProjectPanelBgImage'
              },
              editorProjectPanelStageWidth: {
                value: '1',
                name: '项目配置-舞台宽度',
                key: 'editorProjectPanelStageWidth'
              },
              editorProjectPanelImgLazyLoad: {
                value: '1',
                name: '项目配置-图片懒加载',
                key: 'editorProjectPanelImgLazyLoad'
              },
              editorProjectPanelUseData: {
                value: '1',
                name: '项目配置-使用数据',
                key: 'editorProjectPanelUseData'
              },
              editorProjectPanelShowDisplay: {
                value: '1',
                name: '项目配置-展示显示条件',
                key: 'editorProjectPanelShowDisplay'
              },
              editorProjectPanelUserSelect: {
                value: '1',
                name: '项目配置-长按选择文本',
                key: 'editorProjectPanelUserSelect'
              },
              editorProjectPanelLayout: {
                value: '1',
                name: '项目配置-页面布局',
                key: 'editorProjectPanelLayout'
              },
              editorProjectPanelLog: {
                value: '1',
                name: '项目配置-日志平台',
                key: 'editorProjectPanelLog'
              },
              editorProjectPanelComLogData: {
                value: '1',
                name: '项目配置-日志公共字段',
                key: 'editorProjectPanelComLogData'
              },
              editorProjectPanelDataBox: {
                value: '1',
                name: '项目配置-配置数据',
                key: 'editorProjectPanelDataBox'
              },
              editorProjectPanelComponentPlat: {
                value: '0',
                name: '项目配置-小程序选择',
                key: 'editorProjectPanelComponentPlat'
              }
            }
          },
          editorPagePanel: {
            value: '1',
            name: '页面配置',
            key: 'editorPagePanel',
            children: {
              editorPagePanelDataBox: {
                value: '1',
                name: '页面配置-配置数据',
                key: 'editorPagePanelDataBox'
              }
            }
          },
          editorWidgetPanel: {
            value: '1',
            name: '组件配置',
            key: 'editorWidgetPanel',
            children: {
              editorWidgetPanelLayout: {
                value: '1',
                name: '组件配置-布局形式',
                key: 'editorWidgetPanelLayout'
              }
            }
          },
          editorAnimationPanel: {
            value: '1',
            name: '动画',
            key: 'editorAnimationPanel'
          },
          editorLayerPanel: {
            value: '1',
            name: '图层',
            key: 'editorLayerPanel'
          },
          editorTriggerPanel: {
            value: '1',
            name: '行为',
            key: 'editorTriggerPanel'
          },
          editorConditionPanel: {
            value: '1',
            name: '显示条件',
            key: 'editorConditionPanel'
          }
        }
      },
      chooseBizUnit: {
        value: '0',
        name: '切换事业部',
        desc: '该字段为最高权限，请勿随意配置，包含显示切换事业部，搜索所有事业部的项目,外部组件等',
        key: 'chooseBizUnit'
      },
      themesCenter: {
        value: '1',
        name: '模板中心',
        des: '是否能够进入模板中心',
        children: {
          managerThemeAll: {
            name: '查看所有未审核的模板',
            desc: '仅控制筛选模版类型中的全部选项',
            key: 'managerThemeAll',
            value: '0'
          },
          themeAppro: { name: '模板审核', value: '0', key: 'themeAppro' },
          deleteTheme: { name: '删除模板', value: '0', key: 'deleteTheme' },
          addTheme: { name: '自定义模板', value: '0', key: 'addTheme' },
          modifyTheme: { name: '编辑模板', value: '0', key: 'modifyTheme' },
          copyTheme: { name: '复制模板', value: '0', key: 'copyTheme' },
          renameTheme: { name: '重命名模板', value: '0', key: 'renameTheme' },
          moreOptionTheme: {
            name: '模板更多操作入口',
            value: '0',
            key: 'moreOptionTheme'
          },
          deleteThemeGroups: {
            name: '删除模板组',
            value: '0',
            key: 'deleteThemeGroups'
          },
          updateThemeGroup: {
            name: '模版组管理',
            value: '0',
            key: 'updateThemeGroup'
          },
          renameThemeGroups: {
            name: '重命名模版组',
            value: '0',
            key: 'renameThemeGroups'
          }
        },
        key: 'themesCenter'
      },
      projectCenter: {
        value: '1',
        name: '我的项目',
        des: '该配置影响用户是否能看到‘我的页面’入口',
        children: {
          managerAllProject: {
            false: 'false',
            name: '是否能够管理本事业部所有的项目',
            key: 'managerAllProject',
            value: '0'
          },
          createRuleProject: {
            value: '1',
            name: '规则项目所有权限（包含创建/编辑等）',
            key: 'createRuleProject'
          },
          addProject: {
            value: '1',
            name: '新建项目/文件夹',
            key: 'addProject'
          },
          lookProject: { value: '1', name: '进入项目编辑', key: 'lookProject' },
          lookProjectLog: {
            value: '1',
            name: '查看项目历史记录',
            key: 'lookProjectLog'
          },
          lookProjectData: {
            value: '1',
            name: '查看项目数据',
            key: 'lookProjectData'
          },
          copyProject: { value: '1', name: '复制项目', key: 'copyProject' },
          deleteProject: {
            value: '1',
            name: '删除项目/文件夹',
            key: 'deleteProject'
          },
          moveProject: {
            value: '1',
            name: '移动项目/文件夹至文件夹',
            key: 'moveProject'
          },
          renameProject: {
            value: '1',
            name: '重命名项目/文件夹至文件夹',
            key: 'renameProject'
          },
          transProjectToUser: {
            value: '1',
            name: '转移项目/文件夹至其他用户',
            key: 'transProjectToUser'
          },
          inviteUserManagerProject: {
            value: '1',
            name: '邀请其他用户协调管理项目/文件夹',
            key: 'inviteUserManagerProject'
          },
          lookBinProject: {
            value: '1',
            name: '查看回收站项目',
            key: 'lookBinProject'
          },
          restoreBinProject: {
            value: '1',
            name: '还原回收站项目',
            key: 'restoreBinProject'
          },
          saveProject: { value: '1', name: '保存项目', key: 'saveProject' },
          publishProject: {
            value: '1',
            name: '发布项目',
            key: 'publishProject'
          },
          saveProjectToTheme: {
            value: '1',
            name: '将项目保存为模板',
            key: 'saveProjectToTheme'
          }
        },
        key: 'projectCenter'
      },
      users: {
        value: '0',
        name: '管理后台-用户管理',
        children: {
          modifyUserRole: {
            value: '0',
            name: '修改用户角色',
            key: 'modifyUserRole'
          }
        },
        key: 'users'
      },
      userRoles: {
        value: '0',
        name: '管理后台-角色管理',
        children: {
          modifyUserRolePermission: {
            value: '0',
            name: '编辑角色权限',
            key: 'modifyUserRolePermission'
          }
        },
        key: 'userRoles'
      },
      widgets: {
        value: '0',
        name: '管理后台-组件管理',
        children: {
          modifyWidgetTags: {
            value: '0',
            name: '修改组件标签',
            key: 'modifyWidgetTags'
          },
          restoreWidget: { value: '0', name: '还原组件', key: 'restoreWidget' },
          deleteWidget: { value: '0', name: '删除组件', key: 'deleteWidget' }
        },
        key: 'widgets'
      },
      data: {
        value: '1',
        name: '管理后台-数据看板',
        key: 'data',
        children: {
          dataPlatform: {
            value: '0',
            name: '数据看板/平台看板',
            key: 'dataPlatform'
          },
          dataProject: {
            value: '1',
            name: '数据看板/项目看板',
            key: 'dataProject'
          }
        }
      },
      notice: { value: '0', name: '管理后台-公告管理', key: 'notice' },
      couponconfig: { value: '1', name: '领券中心后台', key: 'couponconfig' },
      tags: {
        value: '0',
        name: '组件标签管理',
        desc: '控制组件便签的增删改',
        key: 'tags'
      },
      drawconfig: {
        value: '1',
        name: '抽奖策略管理',
        key: 'drawconfig',
        children: {
          showConfig: {
            key: 'showConfig',
            value: '1',
            name: '抽奖策略管理'
          },
          searchConfig: {
            value: '1',
            name: '抽奖明细查询',
            key: 'searchConfig'
          },
          awardConfig: {
            value: '1',
            name: '奖品列表配置',
            key: 'awardConfig'
          },
          addressConfig: {
            value: '1',
            name: '用户地址配置',
            key: 'addressConfig'
          },
          reserveManage: {
            value: '1',
            name: '库存管理',
            key: 'reserveManage'
          },
          updateAllConfig: {
            value: '1',
            name: '更改所有抽奖配置',
            key: 'updateAllConfig'
          }
        }
      },
      activity: {
        value: '0',
        name: '活动管理',
        key: 'activity',
        children: {
          list: {
            value: '0',
            name: '活动列表',
            key: 'list'
          }
        }
      },
      themeManage: {
        value: '0',
        name: '管理后台-模板管理',
        children: {
          editThemeManage: {
            value: '0',
            name: '编辑模板',
            key: 'editThemeManage'
          }
        },
        key: 'themeManage'
      },
      content: {
        value: '0',
        name: '未来号内容模板后台',
        key: 'content'
      }
    },
    des: '该角色为默认角色，勿动'
  }
];

async function insetBizUnit() {
  let list = [];
  await instance.userRoles
    .find()
    .toArray()
    .then((res) => {
      list = res;
    });
  if (list.length) {
    console.log('userRoles is already in db');
    instance.userRoles.drop();
  }
  await instance.userRoles.save(bizunitList).then(() => {
    console.log('insert success!');
  });
  process.exit(0);
}
insetBizUnit();
