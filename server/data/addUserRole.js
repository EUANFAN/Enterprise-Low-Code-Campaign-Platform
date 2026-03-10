const updateWidgets = require('./demo.js');

updateWidgets([
  {
    widgets: 'users',
    callback: (user) => {
      if (
        user['userId'] == 'w_caoyong' ||
        user['userId'] == 'w_jiangqian' ||
        user['userId'] == 'w_shenchao' ||
        user['userId'] == 'w_lvqingke' ||
        user['userId'] == 'w_guoliang'
      ) {
        user['role'] = '超级管理员';
      } else {
        user['role'] = '普通用户';
      }
    }
  }
]);
