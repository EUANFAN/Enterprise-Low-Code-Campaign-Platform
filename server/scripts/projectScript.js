/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-08-18 15:46:42
 * @LastEditors: jielang
 * @LastEditTime: 2020-12-15 19:14:22
 */
// 定时记录项目数据脚本
const schedule = require('node-schedule');
const guard = require('when/guard');
const when = require('when');
const { db } = require('../utils/mongo');
const request = require('request');
const Moment = require('moment');
// const { serviceAPI } = require('../utils/3rd');

const serviceAPI = require(`../config/${process.env.NODE_ENV}/3rd`);

const instance = db();

const handleData = (processList, index) => {
  if (index < processList.length) {
    let p = processList[index];
    instance[p.widgets].find().then((lists) => {
      let guardedAsyncOperation = guard(guard.n(5), async (widget) => {
        await p.callback(widget);
      });
      let mapped = when.map(lists, guardedAsyncOperation);
      mapped.then(() => {
        handleData(processList, ++index);
      });
    });
  } else {
    console.log('done');
  }
};

const updateWidgets = (processList) => {
  handleData(processList, 0);
};

const getProjectData = async function (id) {
  let yestoday = Moment().add('days', -1).format('YYYY-MM-DD'); // 1天前;
  let pagePV = `SELECT COUNT(*) FROM increase.basiclog_pv_1001970_all where formatDateTime(timestamp, '%Y-%m-%d')<='${yestoday}' AND projectid='${id}'`;
  let pageUV = `SELECT COUNT(DISTINCT xesid) FROM increase.basiclog_pv_1001970_all where formatDateTime(timestamp, '%Y-%m-%d')<='${yestoday}' AND projectid='${id}' AND xesid != ''`;
  let sharePV = `SELECT COUNT(*) FROM increase.basiclog_interactive_1001970_all where formatDateTime(timestamp, '%Y-%m-%d')<='${yestoday}' AND projectid='${id}' AND action='分享'`;
  let shareUV = `SELECT COUNT(DISTINCT xesid) FROM increase.basiclog_interactive_1001970_all where formatDateTime(timestamp, '%Y-%m-%d')<='${yestoday}' AND projectid='${id}' AND xesid != '' AND action='分享'`;
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
// 每天的凌晨1点0分0秒触发 ：'0 0 1 * * *'
schedule.scheduleJob('0 0 1 * * *', function () {
  updateWidgets([
    {
      widgets: 'projects',
      callback: async (project) => {
        let data = await getProjectData(project._id);
        instance.projects.update(
          { _id: project._id },
          {
            $set: {
              pagepv: Number(data.pagepv),
              pageuv: Number(data.pageuv),
              sharepv: Number(data.sharepv),
              shareuv: Number(data.shareuv),
            },
          }
        );
      },
    },
  ]);
});
