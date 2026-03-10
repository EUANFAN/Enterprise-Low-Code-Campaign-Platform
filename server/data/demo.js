const { db } = require('../utils/mongo');

const instance = db();

/**
 * @name: updateWidgets
 * @param [{widget, callbback}]
 * @return: null
 */

// 函数updateWidgets接受一个数组，数组中每个元素为一个对象，包含
// {
// widgets: '' // 表名，
// callback: 回掉函数， 默认参数widget为当前表中单个元素
// }
const handleData = (processList, index) => {
  if (index < processList.length) {
    let p = processList[index];
    let query = {};
    if (p.widgets === 'logs') {
      // 只清洗近一个月日志数据
      query = { createdAt: { $gte: new Date('2021-04-01') } };
    }
    instance[p.widgets]
      .find(query)
      .then((lists) => {
        return Promise.all(
          lists.map((widget) => {
            return new Promise(async (res) => {
              await p.callback(widget);
              instance[p.widgets]
                .update({ _id: widget._id }, widget)
                .then(() => {
                  res(1);
                });
            });
          })
        );
      })
      .then(() => {
        handleData(processList, ++index);
      })
      .catch((err) => {
        console.error(err); // eslint-disable-line no-console
        process.exit(1);
      });
  } else {
    console.log('done');
    instance.close();
    process.exit(0);
  }
};

const updateWidgets = (processList) => {
  handleData(processList, 0);
};

// updateWidgets('users', (widget) => {
//   widget.components = {}
//   console.log(widget)
// })

// 执行 export NODE_ENV={env} && node ./*.js

module.exports = updateWidgets;
