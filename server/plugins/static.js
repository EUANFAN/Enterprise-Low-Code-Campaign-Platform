const path = require('path');
const koaStatic = require('koa-static');

let defaultRoot = path.resolve(__dirname, '../../client/');
module.exports = koaStatic(defaultRoot);
