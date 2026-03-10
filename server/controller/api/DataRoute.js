const checkLogin = require('./checkLogin');
const DAY_HOURS = require('../../constants');

const {
  getProjectsPublish,
  getProjectsNew,
  getTodayLogData,
  formatData,
  getLogData,
  getProjectsRinking,
  getPageRinking,
} = require('./utils/DataUtils');
const Router = require('koa-router');
const Moment = require('moment');

const { mongo } = global.app.utils;
const db = mongo.db();
const { ObjectId } = mongo.pmongo;
const router = new Router({ prefix: '/data' });

// Check login in all handlers in this route
router.use(checkLogin);
// 修复react-refresh 热更新 报错
// global.$RefreshReg$ = () => {};
// global.$RefreshSig$ = () => () => {};
// ------
function GetDateArr(searchType) {
  let myDate = new Date(); // 获取今天日期
  myDate.setDate(myDate.getDate() - Number(searchType - 1));
  let dateArray = [];
  let dateTemp;
  let flag = 1;
  for (let i = 0; i < Number(searchType); i++) {
    dateTemp =
      myDate.getFullYear() +
      '-' +
      (myDate.getMonth() + 1) +
      '-' +
      myDate.getDate();
    dateArray.push(Moment(new Date(dateTemp)).format('YYYY-MM-DD'));
    myDate.setDate(myDate.getDate() + flag);
  }
  return dateArray;
}
// 管理员获取所有的项目数据
router.get('/adminData', async (ctx) => {
  const {
    query: { id },
  } = ctx;
  if (id) {
    const project = await db.projects.findOne({ _id: ObjectId(id) });
    const today = Moment(new Date()).format('YYYY-MM-DD');
    let dataArr = await getTodayLogData(today, id); // 查出当天的日志
    let arr = [
      {
        name: '累计曝光人次（PV)',
        count: Number(project.pagepv) + Number(dataArr.pagepv),
      },
      {
        name: '累计曝光人数（UV)',
        count: Number(project.pageuv) + Number(dataArr.pageuv),
      },
      {
        name: '累计转发人次（PV)',
        count: Number(project.sharepv) + Number(dataArr.sharepv),
      },
      {
        name: '累计转发人数（UV)',
        count: Number(project.shareuv) + Number(dataArr.shareuv),
      },
    ];
    return ctx.data(arr);
  }
  let startTime = new Date(new Date(new Date().toLocaleDateString()).getTime());
  let endTime = new Date(
    new Date(new Date().toLocaleDateString()).getTime() +
      24 * 60 * 60 * 1000 -
      1
  );
  const publishCount = await db.projects
    .find({
      deleted: { $ne: true },
      lastPublished: { $exists: true },
    })
    .count();
  const projectCount = await db.projects
    .find({ deleted: { $ne: true } })
    .count();
  const todayProjects = await db.projects
    .find({
      deleted: { $ne: true },
      createdAt: { $gte: startTime, $lt: endTime },
    })
    .count();
  const todayPubProjects = await db.projects
    .find({
      deleted: { $ne: true },
      lastPublished: { $gte: startTime, $lt: endTime },
    })
    .count();
  let arr = [
    {
      name: '项目总数',
      count: projectCount,
    },
    {
      name: '已发布项目总数',
      count: publishCount,
    },
    {
      name: '今日新增项目数',
      count: todayProjects,
    },
    {
      name: '今日发布项目数',
      count: todayPubProjects,
    },
  ];
  ctx.data(arr);
});

// 获取新增项目数据
router.get('/getProjectData', async (ctx) => {
  const {
    query: { searchType, logType, id },
  } = ctx;
  // 每一天的项目数
  let startTime, endTime, searchLogDay;
  if (searchType == 7 || searchType == 15 || searchType == 30) {
    // 7天/15天/30天
    searchLogDay = Moment()
      .add(-(Number(searchType) - 1), 'days')
      .format('YYYY-MM-DD');
  } else {
    if (searchType == 1) {
      // 今天
      startTime = new Date(new Date(new Date().toLocaleDateString()).getTime());
      endTime = new Date(
        new Date(new Date().toLocaleDateString()).getTime() +
          24 * 60 * 60 * 1000 -
          1
      );
      searchLogDay = Moment(new Date()).format('YYYY-MM-DD');
    }

    if (searchType == 0) {
      // 昨天
      startTime = new Date(
        new Date(new Date().toLocaleDateString()).getTime() -
          24 * 60 * 60 * 1000
      );
      endTime = new Date(
        new Date(new Date().toLocaleDateString()).getTime() - 1
      );
      searchLogDay = Moment().add(-1, 'days').format('YYYY-MM-DD'); // 1天前
    }
  }
  let dateArray = searchType > 1 ? GetDateArr(searchType) : DAY_HOURS; // 获取日期列表
  if (id) {
    // 单个项目的数据
    let pageLog = {},
      shareLog = {},
      tableData = {};
    const project = await db.projects.findOne({ _id: ObjectId(id) });
    pageLog = await getLogData(searchLogDay, searchType, dateArray, id);
    shareLog = await getLogData(
      searchLogDay,
      searchType,
      dateArray,
      id,
      'share'
    );
    tableData = await getPageRinking(id, searchLogDay, logType, searchType);
    ctx.data({
      title: project.name,
      pageLog: pageLog,
      shareLog: shareLog,
      tableData: tableData,
    });
  } else {
    // 所有页面的数据
    let newAddData = {},
      publishedData = {},
      logData = {},
      tableData = {};
    let newData = await getProjectsNew(startTime, endTime, searchType);
    newAddData = formatData(dateArray, newData);
    let publishData = await getProjectsPublish(startTime, endTime, searchType);
    publishedData = formatData(dateArray, publishData);
    logData = await getLogData(searchLogDay, searchType, dateArray);
    tableData = await getProjectsRinking(searchLogDay, logType, searchType);

    ctx.data({
      newAddData: newAddData,
      publishedData: publishedData,
      logData: logData,
      tableData: tableData,
    });
  }
});
module.exports = router;
