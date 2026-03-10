let componentList = [];

/**
 * 用于计算[上线的project]中使用了多少组件的方法
 *
 * @param  {Object} project project 单条数据
 * @return {Object}         组件使用次数统计
 *
 * { type: 'Check1v1Token', timesUsedOnline: 3 },
 * { type: 'FreezeScroll', timesUsedOnline: 6 },
 * { type: 'TextAreaForm1v1', timesUsedOnline: 1 },
 */
function getCompTimesUsedOnline(project) {
  componentList = [];
  if (!project.lastPublished) return;
  getUsedCompTimes(project.revisionData);
  return componentList;
}

/**
 * 用于计算[project]中使用了多少组件的方法
 *
 * @param  {Object} revisionData project.revisionData 单条数据
 * @return {Object}         组件使用次数统计
 *
 * { type: 'Check1v1Token', timesUsedOnline: 3 },
 * { type: 'FreezeScroll', timesUsedOnline: 6 },
 * { type: 'TextAreaForm1v1', timesUsedOnline: 1 },
 */
function getUsedCompTimes(revisionData) {
  componentList = [];
  const { pages } = revisionData || {};

  // 对最外层行为组件的处理
  if (revisionData) {
    handleTriggerPushComponentList(revisionData);
  }

  // 对 widgets UI组件的处理
  if (pages) {
    dfsWidgets(pages);
  }
  deleteUndefinedAndEmpty();
  return componentList;
}

/**
 * 用于计算两个project中使用的组件数量差异，以project1为基准输出结果
 *
 * @param  {Object} revisionData1 project.revisionData 单条数据
 * @param  {Object} revisionData2 project.revisionData 单条数据
 * @return {Object}         组件使用次数差异统计
 *
 * { type: 'Check1v1Token', timesUsedOnline: 3 },
 * { type: 'FreezeScroll', timesUsedOnline: -1 },
 * { type: 'TextAreaForm1v1', timesUsedOnline: 1 },
 */
function getDiffCompTimes(revisionData1, revisionData2) {
  const diff = [];
  const comp1 = getUsedCompTimes(revisionData1);
  const comp2 = getUsedCompTimes(revisionData2);
  comp1.forEach((item) => {
    const item2 = comp2.find((i) => i.type === item.type);
    // 1 2 都有 2-1
    if (item2) {
      diff.push({
        type: item.type,
        timesUsedOnline: item2.timesUsedOnline - item.timesUsedOnline,
      });
    } else {
      // 1有2没有 -1
      diff.push({
        type: item.type,
        timesUsedOnline: -item.timesUsedOnline,
      });
    }
  });
  comp2.forEach((item2) => {
    const item = comp1.some((i) => i.type === item2.type);
    if (!item) {
      diff.push(item2);
    }
  });
  return diff;
}

function findCompfromComponentList(type) {
  return componentList.find((item) => item.type === type);
}

// 处理componentList的计数逻辑
function handleComponentListByType(type) {
  const compTemp = findCompfromComponentList(type);
  if (compTemp) {
    compTemp.timesUsedOnline++;
  } else {
    componentList.push({
      type,
      timesUsedOnline: 1,
    });
  }
}

// 处理trigger添加到componentList的逻辑
function handleTriggerPushComponentList(temp) {
  if (temp.triggers && temp.triggers.length > 0) {
    temp.triggers.forEach((i) => {
      handleComponentListByType(i.type);
    });
  }
}

// dfs widgets中的组件使用数据
function dfsWidgets(temp) {
  if (temp && temp.length > 0) {
    temp.forEach((item) => {
      const { widgets } = item;
      if (widgets && widgets.length > 0) {
        widgets.forEach((i) => {
          handleComponentListByType(i.type);

          // 处理widgets中trigger的数据
          handleTriggerPushComponentList(i);

          // 再dfs一次 layers
          dfsWidgets(i.layers);
        });
      }
    });
  }
}

// 删除componentList中的type === undefined || type === ''项
function deleteUndefinedAndEmpty() {
  const index = componentList.findIndex(
    (i) => i.type === undefined || i.type === ''
  );
  if (index > -1) {
    componentList.splice(index, 1);
  }
}

module.exports = {
  getCompTimesUsedOnline,
  getDiffCompTimes,
  getUsedCompTimes,
};
