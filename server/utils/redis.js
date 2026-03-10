/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-02-07 21:20:43
 * @LastEditors: jielang
 * @LastEditTime: 2020-12-17 20:20:36
 */
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis);

function cache(key, value) {
  const client = getClient();
  client.set(key, value);
  client.quit();
}

function getClient() {
  const app = global.app;
  const redisConfig = app.config.get('redis');
  return redis.createClient(redisConfig.port, redisConfig.host, {
    auth_pass: redisConfig.password,
  });
}

module.exports = {
  cache,
  getClient,
};
