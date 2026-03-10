/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-12-07 15:23:04
 * @LastEditors: jielang
 * @LastEditTime: 2021-04-15 17:11:19
 */
const app = global.app;
const config = app.config;
const sso = config.get('sso');
const request = require('request');
let urls = sso.urls;
const { DEFAULT_POSTER } = require('../constants');
module.exports = function (url, projectId, isTheme) {
  const { mongo } = app.utils;
  const db = mongo.db(app.utils);
  request.get(
    {
      url: urls.snapshot,
      qs: {
        url,
      },
    },
    async (error, res, data) => {
      try {
        data = data && JSON.parse(data);
        let poster = DEFAULT_POSTER;
        if (data && data.data && data.data.errno == 0) {
          poster = data.data.data.file_url_https;
        }
        if (!isTheme) {
          db.projects.update({ _id: projectId }, { $set: { poster } });
        } else {
          db.themes.update({ _id: projectId }, { $set: { poster } });
          let theme = await db.themes.findOne({ _id: projectId });

          if (theme && theme.themeGroupId) {
            db.themeGroups.update(
              { _id: theme.themeGroupId },
              { $set: { poster } }
            );
          }
        }
      } catch (try_error) {
        console.log(try_error);
      }
    }
  );
};
