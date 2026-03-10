/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-05-25 01:31:26
 * @LastEditors: jielang
 * @LastEditTime: 2020-12-17 20:17:52
 */
const app = global.app
const CachemanRedis = require('cacheman-redis')
const redisConfig = app.config.get('redis')
const cache = new CachemanRedis({
  port: redisConfig.port,
  host: redisConfig.host,
  auth_pass: redisConfig.password,
  no_ready_check: true,
  database: redisConfig.database // 四库
})

module.exports = {
  set: function (key, value, ttl = 60) {
    return new Promise((resolve) => {
      cache.set(key, value, ttl, function (error, value) {
        if (error) {
          throw error
        }
        resolve(value)
      })
    })
  },
  get: async function (key) {
    return new Promise((resolve) => {
      cache.get(key, function (error, value) {
        if (error) {
          throw error
        }
        resolve(value)
      })
    })
  },
  del: async function (key) {
    return new Promise((resolve) => {
      cache.del(key, function (error) {
        if (error) {
          throw error
        }
        resolve(1)
      })
    })
  }
}
