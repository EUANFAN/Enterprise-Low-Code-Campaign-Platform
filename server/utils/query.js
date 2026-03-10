let _ = require('lodash');
let url = require('url');
let qs = require('qs');

function appendQuery(originUrl, query) {
  let urlComponets = url.parse(originUrl, true);
  let newQuery = _.extend(urlComponets.query, query);
  return (
    urlComponets.protocol +
    '//' +
    urlComponets.host +
    urlComponets.pathname +
    '?' +
    qs.stringify(newQuery)
  );
}

module.exports = {
  appendQuery,
};
