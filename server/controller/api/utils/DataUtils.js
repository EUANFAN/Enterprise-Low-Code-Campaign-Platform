const { mongo } = global.app.utils;
const db = mongo.db();
const { ObjectId } = mongo.pmongo;
const request = require('request');
const { serviceAPI } = require('../../../utils/3rd');

function isValidObjectId(str) {
  const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
  return checkForHexRegExp.test(str);
}

const getProjectsNew = async (startTime, endTime, searchType) => {
  let newProjects = [];
  if (Number(searchType) > 1) {
    newProjects = await db.projects.aggregateCursor(
      { $match: { deleted: { $ne: true } } },
      { $group: { _id: '$createdAt', count: { $sum: 1 } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              // date: "$_id"
              date: { $add: ['$_id', 8 * 3600000] },
            },
          },
          count: { $sum: '$count' },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: Number(searchType) }
    );
  } else {
    newProjects = await db.projects.aggregateCursor(
      {
        $match: {
          deleted: { $ne: true },
          createdAt: { $gte: startTime, $lt: endTime },
        },
      },
      { $group: { _id: '$createdAt', count: { $sum: 1 } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%H:00',
              date: { $add: ['$_id', 8 * 3600000] },
            },
          },
          count: { $sum: '$count' },
        },
      },
      { $sort: { _id: -1 } }
    );
  }
  return newProjects;
};

// 为什么加16, 是因为new Date 比 iso日期少8小时，
const getProjectsPublish = async (startTime, endTime, searchType) => {
  let newProjects;
  if (Number(searchType) > 1) {
    newProjects = await db.projects.aggregateCursor(
      { $match: { deleted: { $ne: true } } },
      { $group: { _id: '$lastPublished', count: { $sum: 1 } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: { $add: ['$_id', 8 * 3600000] },
            },
          },
          count: { $sum: '$count' },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: Number(searchType) }
    );
  } else {
    newProjects = await db.projects.aggregateCursor(
      {
        $match: {
          deleted: { $ne: true },
          lastPublished: { $gte: startTime, $lt: endTime },
        },
      },
      { $group: { _id: '$lastPublished', count: { $sum: 1 } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%H:00',
              date: { $add: ['$_id', 8 * 3600000] },
            },
          },
          count: { $sum: '$count' },
        },
      },
      { $sort: { _id: -1 } }
    );
  }
  return newProjects;
};

const getProjectsRinking = async (searchLogDay, logType, searchType) => {
  let params, list;
  let filterDate = searchLogDay.split('-').join('');
  let time =
    Number(searchType) > 1
      ? `where toYYYYMMDD(timestamp) >= ${filterDate}  AND projectid != ''`
      : `where toYYYYMMDD(timestamp) = ${searchLogDay}  AND projectid != ''`;
  // 根据时间、项目id以及日志类型筛选
  if (Number(logType)) {
    // uv:1
    params = `SELECT projectid, COUNT(DISTINCT xesid) FROM increase.basiclog_pv_1001970_all ${time} AND xesid != '' GROUP BY projectid ORDER BY COUNT(projectid) DESC LIMIT 100;`;
  } else {
    // pv:0
    params = `
    SELECT * FROM
      (   SELECT projectid, COUNT(*) AS CT FROM increase.basiclog_pv_1001970_all
          ${time} GROUP BY projectid ORDER BY COUNT(*) DESC LIMIT 100
      )
    WHERE CT > 100;`;
  }
  list = await sqlRequest(params);
  if (!list) {
    return [];
  }
  let arr = list.split('\n');
  let idArr = [];
  let projectsCount = {};
  arr.forEach((item) => {
    // 从表中获取的日志数据
    if (item) {
      let temp = item.split('\t');
      if (isValidObjectId(temp[0])) {
        idArr.push({ _id: ObjectId(temp[0]) });
        projectsCount[temp[0]] = Number(temp[1]);
      }
    }
  });
  if (!idArr.length) {
    return [];
  }
  const projects = await db.projects.find({
    $or: idArr,
    deleted: { $ne: true },
  });
  let projectList = projects.map((item) => {
    let id = item._id.toString();
    return {
      id: id,
      name: item.name,
      user: item.ownerId,
      count: projectsCount[id],
    };
  });
  projectList.sort((a, b) => {
    return Number(b.count) - Number(a.count);
  });

  return projectList;
};
const formatData = (dateArray, newData, title) => {
  let dataList = [];
  let count = 0;
  dateArray.forEach((dateItem) => {
    let temp = newData.find((item) => {
      return ~item['_id'].indexOf(dateItem);
    });
    let obj = {};
    if (temp) {
      obj = temp;
    } else {
      obj._id = dateItem;
      obj.count = 0;
    }
    count = count + Number(obj.count);
    obj['title'] = title ? title : '';
    dataList.push(obj);
  });
  return {
    dataList: dataList,
    count: count,
  };
};
const getLogData = async (
  searchLogDay,
  searchType,
  dateArray,
  projectid,
  action
) => {
  let pvParams, uvParams;
  let time = Number(searchType) > 1 ? '%Y-%m-%d' : '%Y-%m-%d %H:00';
  let filterDate = searchLogDay.split('-').join('');
  let condition =
    Number(searchType) > 1
      ? `where toYYYYMMDD(timestamp) >= ${filterDate}`
      : `where toYYYYMMDD(timestamp) >= ${searchLogDay}`;
  if (projectid) {
    if (action) {
      // 单个页面转发的PV和UV
      // SELECT formatDateTime(timestamp,'%Y-%m-%d'), COUNT(DISTINCT xesid) FROM increase.basiclog_pv_1001970_all where formatDateTime(timestamp, '%Y-%m-%d') >= '2020-03-13' AND xesid != '' GROUP BY formatDateTime(timestamp,'%Y-%m-%d') ORDER BY formatDateTime(timestamp,'%Y-%m-%d')
      pvParams = `SELECT formatDateTime(timestamp,'${time}'),COUNT(*) FROM increase.basiclog_interactive_1001970_all ${condition} AND projectid='${projectid}' AND action='分享' GROUP BY formatDateTime(timestamp,'${time}') ORDER BY formatDateTime(timestamp,'${time}')`;
      uvParams = `SELECT formatDateTime(timestamp,'${time}'), COUNT(DISTINCT xesid) FROM increase.basiclog_interactive_1001970_all ${condition} AND projectid='${projectid}' AND xesid != '' AND action='分享' GROUP BY formatDateTime(timestamp,'${time}') ORDER BY formatDateTime(timestamp,'${time}');`;
    } else {
      // 单个页面的PV和UV
      pvParams = `SELECT formatDateTime(timestamp,'${time}'),COUNT(*) FROM increase.basiclog_pv_1001970_all ${condition} AND projectid='${projectid}' GROUP BY formatDateTime(timestamp,'${time}') ORDER BY formatDateTime(timestamp,'${time}')`;
      uvParams = `SELECT formatDateTime(timestamp,'${time}'), COUNT(DISTINCT xesid) FROM increase.basiclog_pv_1001970_all ${condition} AND xesid != '' AND projectid='${projectid}' GROUP BY formatDateTime(timestamp,'${time}') ORDER BY formatDateTime(timestamp,'${time}')`;
    }
  } else {
    // 多个页面的PV和UV
    pvParams = `SELECT formatDateTime(timestamp,'${time}'),COUNT(*) FROM increase.basiclog_pv_1001970_all ${condition} GROUP BY formatDateTime(timestamp,'${time}') ORDER BY formatDateTime(timestamp,'${time}')`;
    uvParams = `SELECT formatDateTime(timestamp,'${time}'), COUNT(DISTINCT xesid) FROM increase.basiclog_pv_1001970_all ${condition} AND xesid != '' GROUP BY formatDateTime(timestamp,'${time}') ORDER BY formatDateTime(timestamp,'${time}')`;
  }
  let pvdata = await sqlRequest(pvParams);
  let sqlPVdata = formatMySqlData(pvdata, 'pv');
  let pv = formatData(dateArray, sqlPVdata.logData, 'pv');
  let uvdata = await sqlRequest(uvParams);
  let sqlUVdata = formatMySqlData(uvdata, 'uv');
  let uv = formatData(dateArray, sqlUVdata.logData, 'uv');
  return {
    dataList: [...pv.dataList, ...uv.dataList],
    pvTotal: pv.count,
    uvTotal: uv.count,
  };
};
// 单个页面的点击日志排行榜
const getPageRinking = async (projectid, searchLogDay, logType, searchType) => {
  let list, params;
  let filterDate = searchLogDay.split('-').join('');
  let time =
    Number(searchType) > 1
      ? `where toYYYYMMDD(timestamp) >= ${filterDate} AND action != 'modulestay'`
      : `where toYYYYMMDD(timestamp) = ${filterDate} AND action != 'modulestay'`;
  // 根据时间、项目id以及日志类型筛选
  if (Number(logType)) {
    // uv:1
    params = `SELECT elementname, action, COUNT(DISTINCT xesid) FROM increase.basiclog_interactive_1001970_all ${time} AND projectid='${projectid}' AND xesid != '' GROUP BY elementid, elementname, action ORDER BY COUNT(elementid) DESC;`;
  } else {
    // pv:0
    params = `SELECT elementname, action,  COUNT(*) FROM increase.basiclog_interactive_1001970_all ${time} AND projectid='${projectid}' GROUP BY elementid, elementname, action ORDER BY COUNT(elementid) DESC;`;
  }
  list = await sqlRequest(params);
  if (!list) {
    return [];
  }
  let arr = list.split('\n');
  let requests = [];
  arr.forEach((item, index) => {
    // 从表中获取的日志数据
    if (item) {
      let temp = item.split('\t');
      let obj = {
        id: index,
        name: `${temp[0]}-${temp[1]}`,
        count: Number(temp[2]),
      };
      requests.push(obj);
    }
  });
  return requests;
};
// 获取单个页面当天的数据
const getTodayLogData = async (today, id) => {
  let filterDate = today.split('-').join('');
  let pagePV = `SELECT COUNT(*) FROM increase.basiclog_pv_1001970_all where toYYYYMMDD(timestamp) = ${filterDate} AND projectid='${id}' GROUP BY formatDateTime(timestamp,'%Y-%m-%d')`;
  let pageUV = `SELECT COUNT(DISTINCT xesid) FROM increase.basiclog_pv_1001970_all where toYYYYMMDD(timestamp) = ${filterDate} AND projectid='${id}' AND xesid != '' GROUP BY formatDateTime(timestamp,'%Y-%m-%d')`;
  let sharePV = `SELECT COUNT(*) FROM increase.basiclog_interactive_1001970_all where toYYYYMMDD(timestamp) = ${filterDate} AND projectid='${id}' AND action='分享' GROUP BY formatDateTime(timestamp,'%Y-%m-%d')`;
  let shareUV = `SELECT COUNT(DISTINCT xesid) FROM increase.basiclog_interactive_1001970_all where toYYYYMMDD(timestamp) = ${filterDate} AND projectid='${id}' AND action='分享' AND xesid != '' GROUP BY formatDateTime(timestamp,'%Y-%m-%d')`;
  let sqlArr = [
    { name: 'pagepv', sql: pagePV },
    { name: 'pageuv', sql: pageUV },
    { name: 'sharepv', sql: sharePV },
    { name: 'shareuv', sql: shareUV },
  ];
  let dataArr = { pagepv: 0, pageuv: 0, sharepv: 0, shareuv: 0 };
  let requests = sqlArr.map((item) => {
    return new Promise((resolve) => {
      request.get(
        {
          url: serviceAPI.dataUrl,
          qs: {
            query: item.sql,
          },
        },
        (err, res, data) => {
          if (data) {
            dataArr[item.name] = data.replace(/^\s+|\s+$/g, '');
          }
          resolve(dataArr);
        }
      );
    });
  });

  let res = await Promise.all(requests);
  if (res.length) {
    return dataArr;
  }
};
const sqlRequest = (params) => {
  return new Promise((resolve) => {
    request.get(
      {
        url: serviceAPI.dataUrl,
        qs: {
          query: params,
        },
      },
      (err, res, data) => {
        resolve(data);
      }
    );
  });
};

const formatMySqlData = (data, title) => {
  let arr = data ? data.split('\n') : [];
  let result = {
    logData: [],
    count: 0,
  };
  arr.forEach((item) => {
    if (item) {
      let temp = item.split('\t');
      let obj = {
        _id: temp[0],
        count: Number(temp[1]),
      };
      obj['title'] = title;
      result.count = result.count + Number(obj.count);
      result.logData.push(obj);
    }
  });
  return result;
};
module.exports = {
  getProjectsNew,
  getProjectsPublish,
  getProjectsRinking,
  formatData,
  getLogData,
  getPageRinking,
  getTodayLogData,
};
