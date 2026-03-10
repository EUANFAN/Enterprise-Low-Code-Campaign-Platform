/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-12-17 20:25:28
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:01:21
 */
var pmongo = require('@k9/promised-mongo');
let instance;
const db = function () {
  if (!instance) {
    const DBConfig = getDBConfig();
    const servers = DBConfig.servers.map((server) => ({
      host: server.host,
      port: server.port,
    }));
    instance = pmongo(
      {
        server_options: { socketOptions: {} },
        db_options: { read_preference_tags: null, read_preference: DBConfig.read_preference || 'primary' },
        rs_options: { socketOptions: {}, rs_name: DBConfig.rs_name },
        mongos_options: {},
        dbName: DBConfig.db,
        servers: servers,
        auth: DBConfig.user && DBConfig.password ? { user: DBConfig.user, password: DBConfig.password } : null,
      },
      { authMechanism: 'ScramSHA1' }
    );
  }
  return instance;
};

// function getIPAdress() {
//   let interfaces = require('os').networkInterfaces();
//   for (var devName in interfaces) {
//     var iface = interfaces[devName];
//     for (var i = 0; i < iface.length; i++) {
//       let alias = iface[i];
//       if (
//         alias.family === 'IPv4' &&
//         alias.address !== '127.0.0.1' &&
//         !alias.internal
//       ) {
//         return alias.address;
//       }
//     }
//   }
// }

// function getEnv() {
//   let _env = 'dev';
//   let ipAddress = getIPAdress();
//   switch (ipAddress) {
//     case '10.90.73.48':
//       _env = 'test';
//       break;
//     case '10.20.121.204':
//       _env = 'gray';
//       break;
//     case '10.20.121.182':
//     case '10.20.121.206':
//       _env = 'prod';
//       break;
//     default:
//       break;
//   }
//   console.log(_env, ipAddress);
//   return _env;
// }

function close() {
  if (instance) {
    return instance.close();
  }
}

// const env = getEnv();

/**
 * @author
 * @createAt 2020-03-12 23:45:31
 * @description 获取mongo配置，兼容数据脚本
 */
function getDBConfig() {
  let DBConfig = {};
  try {
    DBConfig = global.app.config.get('mongo');
  } catch (error) {
    DBConfig = require(`../config/${process.env.NODE_ENV}/mongo`);
  }
  return DBConfig;
}

module.exports = {
  close,
  pmongo,
  db,
};
