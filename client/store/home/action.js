import { action } from 'mobx';
import { Modal } from 'antd';
import 'globals';
import data from './data';
import { getHomeSecondaryPages } from 'apis/HomeAPI';
import {
  getThemeHotList as getThemeHotListApi,
  postCollect as postCollectApi,
  getThemesByThemeGroup,
  deleteTheme,
  submitAudit,
  createThemeInGroup,
  createThemeCategory,
  updateCategory,
  deleteCategory,
  createThemeGroup as createThemeGroupApi,
  deleteThemeGroup as deleteThemeGroupApi,
  updateThemeGroup as updateThemeGroupApi,
  updateAuditStatus,
  updateTheme
} from 'apis/ThemeAPI';
import {
  copyProject,
  renameProject,
  createProject as createProjectApi
} from 'apis/ProjectAPI';
import { toastSuccess, toastInfo, toastError } from 'components/HEToast';
import {
  AUDITSTATUSMESSAGE,
  AUDITBUTTONCONTENT,
  ADUIT_FAIL
} from '@/common/Audit.js';
import QueryString from 'qs';
import {
  createRule,
  ruleBindThme,
  createRuleByTheme,
  setConfigData,
  getRuleData as getRuleDataApi
} from 'apis/RuleAPI';
import { createProject as createProjectModal } from 'components/HEModal';
import { delayPromise } from 'utils/FunctionUtils';
import BUSINESS_LIST from 'common/businessList';
const PAGE_SIZE = 10;
const TOAST_TIMEOUT = 3000;
const {
  userInfo: { userDeptId: myUserDeptId }
} = god.PageData;
// 降序
const compareDesc = (prop) => {
  return function (obj1, obj2) {
    var val1 = obj1[prop] || 0;
    var val2 = obj2[prop] || 0;
    if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
      val1 = Number(val1);
      val2 = Number(val2);
    }
    if (val1 < val2) {
      return 1;
    } else if (val1 > val2) {
      return -1;
    } else {
      return 0;
    }
  };
};
const handleDepartmentSelect = (department) => {
  data.selectDepartmentId = department == 'all' ? '' : department;
  data.drawerData = formatCategoryData();
};

const setThemeTypeAndThemeGroup = ({ themeType = '', themeGroup = '' }) => {
  data.themeType = themeType;
  data.themeGroup = themeGroup;
};
const getRuleDataRequest = new Promise(async (resolve) => {
  if (data.config.bannerList.length > 0 || data.config.recommendList.length > 0)
    return;
  const ruleIdMap = {
    dev: '60ed6531998f5cb9378b7841',
    test: '60ed6531998f5cb9378b7841',
    gray: '60f008f66040591156999cdf',
    prod: '60f007e16e7eedbd42491b3f'
  };
  const res = await getRuleDataApi(
    'prod',
    ruleIdMap[god.PageData.env] || '60f007e16e7eedbd42491b3f'
  );
  resolve(res);
});
// 获取规则数据
const getRuleData = async () => {
  try {
    const res = await getRuleDataRequest;
    if (res.code == 0 && res.data.config) {
      data.config.bannerList = res.data.config.bannerList || [];
      data.config.recommendList = res.data.config.recommendList || [];
    } else {
      res.msg && toastError(res.msg, TOAST_TIMEOUT);
    }
  } catch (err) {
    return toastError(err.message, TOAST_TIMEOUT);
  }
};
// 获取模板分类列表
const getCategoryList = async () => {
  try {
    data.category = [];
    data.drawerData = [];
    const { category = [] } = await getHomeSecondaryPages();
    data.category = category;
    data.drawerData = formatCategoryData();
  } catch (err) {
    return toastError(err.message, TOAST_TIMEOUT);
  }
};
// 格式化数据
const formatCategoryData = () => {
  const { category, selectDepartmentId } = data;
  let list;
  // 如果选中所有部门
  if (selectDepartmentId == '') {
    list = category.reduceRight((pre, next) => {
      return pre.concat(next.themeGroupList);
    }, []);
  } else {
    const currentData = category.find((v) => v._id == selectDepartmentId);
    list = currentData ? currentData.themeGroupList : [];
  }
  list.forEach((themeType, index) => {
    list[index].groups = (themeType.groups || [])
      .slice()
      .sort(compareDesc('weight'));
  });
  return list;
};
// 获取模板热度列表
const getThemeHotListRequest = getThemeHotListApi();
// 增加模板热度字段
const addThemeHotField = async (themeList = []) => {
  // 增加热度字段并按热度排序
  try {
    if (data.themeHotList.length <= 0) {
      data.themeHotList = (await getThemeHotListRequest) || [];
    }
    themeList.forEach((item) => {
      item.hot =
        (data.themeHotList.find((i) => i._id == item._id) || {}).count || 0;
    });
    themeList.sort(compareDesc('hot'));
  } catch (err) {
    return toastError(err.message, TOAST_TIMEOUT);
  }
  return themeList;
};
// 获取模板列表
const getThemeList = async ({
  themeGroupId = '',
  currentPage = 1,
  search = '',
  auditStatus = ''
}) => {
  try {
    const { list = [] } = await getThemesByThemeGroup(
      themeGroupId,
      currentPage,
      PAGE_SIZE,
      false,
      search,
      1,
      auditStatus
    );
    await addThemeHotField(list);
    return list;
  } catch (err) {
    return toastError(err.message, TOAST_TIMEOUT);
  }
};
const getSearchThemeList = async ({ search = '' }) => {
  try {
    const { themeGroupId = '', currentPage, auditStatus = '' } = data.search;
    if (data.search.loading) return;
    if (data.search.currentPage > data.search.total) return;
    data.search.loading = true;
    const { list = [], total } = await getThemesByThemeGroup(
      themeGroupId,
      currentPage,
      20,
      false,
      search,
      1,
      auditStatus
    );
    await addThemeHotField(list);
    data.search.list = [...data.search.list, ...list];
    data.search.total = total;
    currentPage <= total &&
      (data.search.currentPage = data.search.currentPage + 1);
  } catch (err) {
    return toastError(err.message, TOAST_TIMEOUT);
  }
  data.search.loading = false;
};
const resetSearchThemeList = () => {
  data.search = {
    currentPage: 1,
    total: 1,
    list: []
  };
};

const setThemeListMap = (key, value) => {
  data.themeListMap[key] = value;
};
// 收藏/取消收藏模板 'collect'、'cancel'
const postCollect = async (dataTarget, action = 'collect', theme = {}) => {
  try {
    await postCollectApi({ themeId: theme._id, action });
    if (action == 'collect') {
      toastSuccess('收藏成功！');
      !data.themeListMap['mycollection'] &&
        (data.themeListMap['mycollection'] = []);
      data.themeListMap['mycollection'].unshift({ ...theme, collected: true });
      const findIndex = dataTarget.findIndex((i) => i._id == theme._id);
      findIndex > -1 && (dataTarget[findIndex].collected = true);
    } else {
      toastSuccess('取消收藏成功！');
      const findIndex = (data.themeListMap['mycollection'] || []).findIndex(
        (i) => i._id == theme._id
      );
      findIndex > -1 && data.themeListMap['mycollection'].splice(findIndex, 1);
      data.listData.sectionArray.forEach((section) => {
        if (section._id == 'mycollection') {
          const sectionItemfindIndex = (section.list || []).findIndex(
            (i) => i._id == theme._id
          );
          sectionItemfindIndex > -1 &&
            section.list.splice(sectionItemfindIndex, 1);
        }
      });
      const dataTargetFindIndex = dataTarget.findIndex(
        (i) => i._id == theme._id
      );
      dataTargetFindIndex > -1 &&
        (dataTarget[dataTargetFindIndex].collected = false);
      // 点击我的收藏列表的取消收藏时需要同步取消 以下所有模板组下对应模板的收藏状态
      Object.keys(data.themeListMap).forEach((key) => {
        const themeFindIndex = (data.themeListMap[key] || []).findIndex(
          (i) => i._id == theme._id
        );
        themeFindIndex > -1 &&
          (data.themeListMap[key][themeFindIndex].collected = false);
      });
    }
  } catch (err) {
    return toastError(err.message, TOAST_TIMEOUT);
  }
};
// 编辑模板
const editThemeInfo = (itemId, ruleId) => {
  let url = ruleId ? `/customRule/${ruleId}` : `/editor/theme/${itemId}`;
  return (god.location.href = url);
};
// 重命名模板
const renameThemeInfo = (
  dataTarget,
  {
    _id,
    name,
    lastModified,
    createdAt,
    creator,
    ownerId,
    onClose = () => {},
    onSubmit = () => {}
  }
) => {
  data.renameThemeInfoModal = {
    name,
    lastModified,
    createdAt,
    creator: creator || ownerId,
    onClose: () => {
      onClose && onClose();
      data.renameThemeInfoModal = {};
    },
    onSubmit: async (value) => {
      try {
        toastInfo('正在保存');
        await renameProject(_id, value, 'theme');
        toastSuccess('保存成功', TOAST_TIMEOUT);
        const findIndex = dataTarget.findIndex((i) => i._id == _id);
        findIndex > -1 && (dataTarget[findIndex].name = value);
      } catch (err) {
        return toastError(err.message, TOAST_TIMEOUT);
      }
      onSubmit && onSubmit();
      data.renameThemeInfoModal = {};
    }
  };
};
// 复制模板
const copyThemeInfo = (
  dataTarget,
  { themeId, onClose = () => {}, onSubmit = () => {} }
) => {
  data.copyThemeInfoModal = {
    themeId,
    name,
    onClose: () => {
      onClose && onClose();
      data.copyThemeInfoModal = {};
    },
    onSubmit: async (name) => {
      try {
        const params = QueryString.stringify({
          id: themeId,
          name,
          type: 'theme'
        });
        toastInfo('复制中');
        const item = await copyProject(params);
        dataTarget.unshift(item);
        toastSuccess('复制成功', TOAST_TIMEOUT);
      } catch (err) {
        return toastError(err.message, TOAST_TIMEOUT);
      }
      onSubmit && onSubmit();
      data.copyThemeInfoModal = {};
    }
  };
};

// 删除模板
const deleteThemeInfo = async (dataTarget, { themeId }) => {
  Modal.confirm({
    content: '删除后将无法找回，确定删除？',
    okText: '确认删除',
    onOk: async () => {
      try {
        toastInfo('正在删除');
        await deleteTheme(themeId);
        toastSuccess('删除成功', TOAST_TIMEOUT);
        const findIndex = dataTarget.findIndex((i) => i._id == themeId);
        findIndex > -1 && dataTarget.splice(findIndex, 1);
      } catch (err) {
        return toastError(err.message, TOAST_TIMEOUT);
      }
    }
  });
};
// 审核模板
const examineThemeInfo = (
  dataTarget,
  {
    _id,
    auditStatus,
    name,
    lastModified,
    createdAt,
    creator,
    ownerId,
    origin,
    ruleId,
    approvedCount = null,
    onClose = () => {},
    onSubmit = () => {}
  }
) => {
  if (approvedCount < 1 || approvedCount == null || ADUIT_FAIL(auditStatus)) {
    // 第一次审核
    data.examineThemeInfoModal = {
      auditStatus,
      auditButtonContent: AUDITBUTTONCONTENT[auditStatus],
      name,
      statusInfo: AUDITSTATUSMESSAGE[auditStatus],
      lastModified,
      createdAt,
      creator: creator || ownerId,
      onClose: () => {
        onClose && onClose();
        data.examineThemeInfoModal = {};
      },
      onSubmit: async (message) => {
        try {
          toastInfo('正在提交');
          let params = {
            info: message,
            key: origin,
            ruleId
          };
          await submitAudit(_id, params);
          toastSuccess('提交成功', TOAST_TIMEOUT);
          const findIndex = dataTarget.findIndex((i) => i._id == _id);
          findIndex > -1 && (dataTarget[findIndex].auditStatus = 1);
        } catch (err) {
          return toastError(err.message, TOAST_TIMEOUT);
        }
        onSubmit && onSubmit();
        data.examineThemeInfoModal = {};
      }
    };
  } else {
    try {
      Modal.confirm({
        content: `确认提交审核「${name}」模板吗?`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          // 直接审核成功
          const { message, code } = await updateAuditStatus(_id, {
            auditStatus: 2
          });
          if (code === 0) {
            const findIndex = dataTarget.findIndex((i) => i._id == _id);
            findIndex > -1 && (dataTarget[findIndex].auditStatus = 2);
          }
          toastSuccess(message);
        }
      });
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
  }
};
// 创建模板
const createThemeInfo = ({
  showCreateThemeType = true,
  themeType = '',
  themeGroupId = '',
  onClose = () => {},
  onSubmit = () => {}
}) => {
  data.createThemeModal = {
    show: true,
    showCreateThemeType,
    themeType,
    themeGroupId,
    onClose: () => {
      onClose && onClose();
      data.createThemeModal = {};
    },
    onSubmit: async ({
      name,
      layoutType,
      selectedThemeType,
      selectedThemeGroup,
      application,
      componentPlat,
      selectedRule,
      remoteUrl,
      selectedBusiness,
      miniProgramId
    }) => {
      try {
        let theme;
        toastInfo('创建模板中');
        let ruleId = null;
        // 创建 rule 对象， rule 在对象之前创建是因为要有绑定关系，方便二次编辑
        if (selectedRule) {
          const { rule } = await createRule({
            name,
            ruleWidget: selectedRule,
            remoteUrl,
            origin: selectedThemeType,
            isThemeRule: true,
            business: selectedBusiness
          });
          ruleId = rule._id;
        }
        const result = await createThemeInGroup({
          name,
          layout: layoutType,
          groupId: data.createThemeModal.showCreateThemeType
            ? selectedThemeGroup
            : data.themeGroup,
          themeType: data.createThemeModal.showCreateThemeType
            ? selectedThemeType
            : data.themeType,
          application,
          componentPlat,
          ruleId,
          miniProgramId
        });

        toastSuccess('创建成功', TOAST_TIMEOUT);
        theme = result.project;

        if (selectedRule) {
          // 如果从模板创建的rule，需要和模板进行绑定
          await ruleBindThme({
            ruleId: ruleId,
            themeId: theme._id
          });
        }
        let url = selectedRule
          ? `/customRule/${ruleId}`
          : `/editor/theme/${theme._id}`;
        god.location.href = url;
      } catch (err) {
        return toastError(err.message, TOAST_TIMEOUT);
      }
      onSubmit && onSubmit();
      data.createThemeModal = {};
    }
  };
};
// 创建模板
const removeTheme = (
  dataTarget,
  {
    themeId = '',
    themeType = '',
    themeGroupId = '',
    onClose = () => {},
    onSubmit = () => {}
  }
) => {
  data.removeThemeModal = {
    show: true,
    themeType,
    themeGroupId,
    onClose: () => {
      onClose && onClose();
      data.removeThemeModal = {};
    },
    onSubmit: async ({
      selectedThemeType: themeType,
      selectedThemeGroup: themeGroupId
    }) => {
      try {
        await updateTheme(themeId, { themeType, themeGroupId });
        toastSuccess('移动成功');
        const findIndex = dataTarget.findIndex((i) => i._id == themeId);
        findIndex > -1 &&
          data.themeListMap[themeType] &&
          data.themeListMap[themeType].push(dataTarget[findIndex]);
        findIndex > -1 && dataTarget.splice(findIndex, 1);
        getCategoryList();
      } catch (err) {
        return toastError(err.message, TOAST_TIMEOUT);
      }
      onSubmit && onSubmit();
      data.removeThemeModal = {};
    }
  };
};
// 创建模板类型
const createThemeType = ({
  currentTempleteData,
  onClose = () => {},
  onSubmit = () => {}
}) => {
  data.createThemeTypeModal = {
    show: true,
    currentTempleteData,
    onClose: () => {
      onClose && onClose();
      data.createThemeTypeModal = {};
    },
    onSubmit: async ({ name, key, reviewerIds, isCreateTheme, _id }) => {
      if (!name) {
        toastError('请填写模版名称');
        return;
      }
      if (!key) {
        toastError('请填写模版key值，该值唯一，且无法修改');
        return;
      }
      if (reviewerIds.length == 0) {
        toastError('请填写审核人员，至少一个');
        return;
      }
      try {
        if (isCreateTheme) {
          // 新增主题类型
          await createThemeCategory(
            name,
            key,
            reviewerIds,
            data.selectDepartmentId || myUserDeptId
          );
          toastSuccess('新增类别成功');
          await getCategoryList();
        } else {
          // 修改主题类型
          await updateCategory(_id, {
            name,
            key,
            reviewerIds,
            userDeptId: data.selectDepartmentId || myUserDeptId
          });
          toastSuccess('更新类别成功');
          await getCategoryList();
        }
      } catch (err) {
        return toastError(err.message, TOAST_TIMEOUT);
      }
      onSubmit && onSubmit();
      data.createThemeTypeModal = {};
    }
  };
};
// 删除模板类型
const deleteThemeType = async ({ category }) => {
  Modal.confirm({
    content: '删除后将无法找回，确定删除？',
    okText: '确认删除',
    onOk: async () => {
      try {
        toastInfo('正在删除');
        await deleteCategory(category);
        toastSuccess('删除成功', TOAST_TIMEOUT);
        await getCategoryList();
      } catch (err) {
        return toastError(err.message, TOAST_TIMEOUT);
      }
    }
  });
};
// 创建模板组
const createThemeGroup = ({
  key,
  userDeptId,
  onClose = () => {},
  onSubmit = () => {}
}) => {
  data.createThemeGroupModal = {
    show: true,
    onClose: () => {
      onClose && onClose();
      data.createThemeGroupModal = {};
    },
    onSubmit: async (name) => {
      if (!name) {
        toastError('请填写模版组名称');
        return;
      }
      try {
        toastInfo('创建分组中');
        await createThemeGroupApi(name, key, userDeptId);
        toastSuccess('创建成功', TOAST_TIMEOUT);
        await getCategoryList();
      } catch (err) {
        return toastError(err.message, TOAST_TIMEOUT);
      }
      onSubmit && onSubmit();
      data.createThemeGroupModal = {};
    }
  };
};
// 删除模板组
const deleteThemeGroup = async ({ group }) => {
  Modal.confirm({
    content: '删除后将无法找回，确定删除？',
    okText: '确认删除',
    onOk: async () => {
      try {
        toastInfo('正在删除');
        await deleteThemeGroupApi(group);
        toastSuccess('删除成功', TOAST_TIMEOUT);
        await getCategoryList();
      } catch (err) {
        return toastError(err.message, TOAST_TIMEOUT);
      }
    }
  });
};
// 预览模板
const previewTheme = ({
  themeInfo = {},
  onClose = () => {},
  onSubmit = () => {}
}) => {
  data.previewThemeModal = {
    show: true,
    themeInfo,
    onClose: () => {
      onClose && onClose();
      data.previewThemeModal = {};
    },
    onSubmit: async () => {
      createThemeProject({ theme: themeInfo });
      onSubmit && onSubmit();
    }
  };
};
// 创建模板项目
const createThemeProject = ({
  theme = {},
  onClose = () => {},
  onSubmit = () => {}
}) => {
  const { revisionData } = theme;
  data.createThemeProjectModal = {
    componentPlat: revisionData.componentPlat,
    miniProgramId: revisionData.miniProgramId,
    show: true,
    onClose: () => {
      onClose && onClose();
      data.createThemeProjectModal = {};
    },
    onSubmit: async (
      e,
      {
        name,
        pageCount,
        layoutType,
        roleId,
        folderId,
        runingStartTime,
        runingEndTime,
        componentPlat = revisionData.componentPlat,
        miniProgramId = revisionData.miniProgramId,
        tags
      }
    ) => {
      console.log('componentPlat', componentPlat, miniProgramId, theme, tags);
      if (!name) return toastError('请输入项目名称！');
      if (!tags.length) return toastError('请选择项目用途！');
      if (!runingStartTime || !runingEndTime)
        return toastError('请输入项目时间！');
      if (runingStartTime.valueOf() > runingEndTime.valueOf())
        return toastError('开始时间不能小于结束时间！');
      let projectId,
        type = 'project',
        origin;
      toastSuccess('创建项目中' + `: ${name}`);
      let result, ruleId;
      try {
        if (theme.ruleId) {
          const rule = await createRuleByTheme({
            themeRuleId: theme.ruleId,
            themeId: theme._id,
            name,
            tags
          });
          ruleId = rule._id;
          // 此处给新建的规则项目在草稿箱保存一下规则模版的数据，防止一进入页面时没有数据
          await setConfigData({
            activityName: rule.name,
            member: rule.ownerId,
            sGroupId: 0,
            ruleId: rule._id,
            config: JSON.stringify(rule.revisionData),
            publicConfig: null,
            type: 'gray',
            business: rule.business || 'clientView'
          });
        } else {
          result = await createProjectApi({
            roleId,
            path: folderId,
            name,
            pageCount,
            themeId: theme._id,
            layoutType,
            type,
            runingTime: JSON.stringify({ runingStartTime, runingEndTime }),
            componentPlat,
            miniProgramId,
            tags
          });
          projectId = result.projectId;
          origin = result.origin;
        }
      } catch (err) {
        toastError(err.message);
        return;
      }
      toastSuccess('创建成功，即将跳转');

      // 延迟只是为了使用者体验，没有其他含义
      await delayPromise();
      console.log('BUSINESS_LIST[origin]', BUSINESS_LIST[origin]);
      if (ruleId) {
        god.location.href = `/customRule/${ruleId}`;
      } else {
        god.location.href = BUSINESS_LIST[origin]
          ? `/rule/${projectId}`
          : `/editor/${projectId}`;
      }
      onSubmit && onSubmit();
      data.createThemeProjectModal = {};
      data.previewThemeModal = {};
    }
  };
};
// 创建空白项目
const createProject = () => {
  createProjectModal(
    {},
    (projectId, isRule) => {
      toastSuccess('创建成功，即将跳转');
      setTimeout(() => {
        god.location.href = isRule
          ? `/customRule/${projectId}`
          : `/editor/${projectId}`;
      }, 1000);
    },
    (err) => {
      toastError(err.message);
    }
  );
};
// 更新模板组
const editThemeGroup = ({
  _id,
  name,
  weight,
  themeCount,
  lastModified,
  createdAt,
  creator,
  onClose = () => {},
  onSubmit = () => {}
}) => {
  data.editThemeGroupModal = {
    name,
    weight,
    themeCount,
    lastModified,
    createdAt,
    creator,
    onClose: () => {
      onClose && onClose();
      data.editThemeGroupModal = {};
    },
    onSubmit: async (newName, newWeight) => {
      try {
        toastInfo('正在保存');
        await updateThemeGroupApi(_id, { name: newName, weight: newWeight });
        toastSuccess('保存成功', TOAST_TIMEOUT);
        await getCategoryList();
        // 更新右侧内容区对应模板下模板组显示
      } catch (err) {
        return toastError(err.message, TOAST_TIMEOUT);
      }
      onSubmit && onSubmit();
      data.editThemeGroupModal = {};
    }
  };
};
const handleSelectDrawerNav = (value) => {
  data.selectDrawerNav = value;
};
const resetThemeTypeData = () => {
  data.listData.themeTypeData = {};
};
// 获取二级列表页模板列表
const setThemeTypeData = async (themeType) => {
  data.drawerData.length <= 0 && (await getCategoryList());
  const themeTypeData = data.drawerData.find((item) => item.key == themeType);
  data.listData.themeTypeData = themeTypeData;
};
const setListDataSearchParams = ({
  themeGroupId = '',
  currentPage = 1,
  search = '',
  auditStatus = ''
}) => {
  data.listData.themeGroupId = themeGroupId;
  data.listData.themeGroupIdCurrentIndex = 0;
  data.listData.currentPage = currentPage;
  data.listData.search = search;
  data.listData.auditStatus = auditStatus;
  data.listData.sectionArray = [];
  data.listData.total = 1;
};
const getListData = async ({ minRowNum = 0 }) => {
  try {
    const themeGroupIdArray = data.listData.themeGroupId.split(',');
    if (
      themeGroupIdArray.length > 0 &&
      data.listData.themeGroupIdCurrentIndex < themeGroupIdArray.length
    ) {
      if (data.listData.currentPage > data.listData.total) {
        data.listData.themeGroupIdCurrentIndex =
          data.listData.themeGroupIdCurrentIndex + 1;
        data.listData.currentPage = 1;
        data.listData.total = 1;
      }
    }
    const { currentPage, search, auditStatus } = data.listData;
    const groupId = themeGroupIdArray[data.listData.themeGroupIdCurrentIndex];
    if (!groupId) return;
    if (data.listData.loading) return;
    if (data.listData.currentPage > data.listData.total) return;
    data.listData.loading = true;
    const { list = [], total } = await getThemesByThemeGroup(
      groupId,
      currentPage,
      20,
      false,
      search,
      1,
      auditStatus
    );
    await addThemeHotField(list);
    const findItem = data.listData.sectionArray.find(
      (item) => item._id == groupId
    );
    if (findItem) {
      findItem.list = [...findItem.list, ...list];
    } else {
      data.listData.sectionArray.push({
        _id: groupId,
        list: [...list]
      });
    }
    data.listData.total = total;
    currentPage <= total &&
      (data.listData.currentPage = data.listData.currentPage + 1);
    data.listData.loading = false;
    // 全部tag下首次加载列表需要自动填充满容器高度才可以触发容器的scroll事件
    if (minRowNum && data.listData.currentPage > data.listData.total) {
      let rowNum = 0;
      data.listData.sectionArray.forEach((section) => {
        rowNum = rowNum + Math.ceil(section.list.length / 5);
      });
      if (rowNum <= minRowNum) {
        await getListData({ minRowNum });
      }
    }
  } catch (err) {
    data.listData.loading = false;
    return toastError(err.message, TOAST_TIMEOUT);
  }
};

let actions = {
  getRuleData,
  postCollect,
  setThemeTypeAndThemeGroup,
  handleDepartmentSelect,
  getCategoryList,
  getThemeList,
  setThemeListMap,
  getSearchThemeList,
  resetSearchThemeList,
  editThemeInfo,
  renameThemeInfo,
  copyThemeInfo,
  deleteThemeInfo,
  examineThemeInfo,
  createThemeInfo,
  removeTheme,
  createThemeType,
  handleSelectDrawerNav,
  deleteThemeType,
  createThemeGroup,
  deleteThemeGroup,
  previewTheme,
  createThemeProject,
  createProject,
  editThemeGroup,
  resetThemeTypeData,
  setThemeTypeData,
  getListData,
  setListDataSearchParams
};
const createActions = (actions) => {
  return Object.entries(actions).reduce((memo, item) => {
    memo[item[0]] = action(item[1]);
    return memo;
  }, {});
};

export default createActions(actions);
