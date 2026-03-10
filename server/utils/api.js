let url = require('url');
let Q = require('q');
let request = require('request');
let _ = require('lodash');

let queryString = require('query-string');

function appendQuery(urlStr, query) {
  let urlObj = url.parse(urlStr);
  let queryStr = urlObj.query;
  let queryObj = queryString.parse(queryStr) || {};

  queryObj = _.extend(queryObj, query);

  if (Object.keys(queryObj).length) {
    urlObj.search = '?' + queryString.stringify(queryObj);
  }
  return url.format(urlObj);
}

function api(req) {
  let def = Q.defer();

  let options = {
    uri: '',
    headers: _.extend(
      {
        'content-type': 'application/json',
      },
      req['headers'] || {}
    ),
    method: req['method'] || 'GET',
    timeout: req['timeout'] || 20 * 1000,
  };

  if (req.postData) {
    options.postData = req.postData;
  }
  if (req.form) {
    options.form = req.form;
  }

  const urlStr = appendQuery(req.url, req.query || {});

  options.uri = urlStr;

  if (options.method.toUpperCase() == 'GET') {
    options.qs = req.data;
  } else {
    if (req.data) {
      if (typeof req.data == 'object') {
        options.body = JSON.stringify(req.data);
      } else {
        options.body = req.data;
      }
    }
  }

  request(options, function (err, res, body) {
    // timeout
    if (err) {
      return def.resolve({
        data: null,
        errno: '5xx',
        msg: err['message'],
      });
    }

    if (res.statusCode > 400) {
      return def.resolve({
        errno: '4xx',
        data: null,
        msg: body,
      });
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      def.resolve({
        data: null,
        errno: 409,
        msg: body,
      });
      return;
    }

    def.resolve(data);
  });

  return def.promise;
}

module.exports = api;
