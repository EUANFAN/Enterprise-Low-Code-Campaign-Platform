const xss = require('xss');
const pathtoRegexp = require('path-to-regexp');

const ROUTE_WHITE_LIST = {
  '/project/update': true,
};

const WHITELISTED_ROUTE_REGEX = [
  pathtoRegexp('/api/themes/:themeId'), // Update theme data path
  pathtoRegexp('/api/resources/folders/:folderIdOrReservedKey/files'),
  pathtoRegexp('/widget/poster'),
];

function isWhiteListed(path) {
  if (ROUTE_WHITE_LIST[path]) {
    return true;
  }

  return WHITELISTED_ROUTE_REGEX.some((regex) => {
    const result = regex.test(path);
    return result;
  });
}

/**
 * Input sanitizer middleware. This middleware sanitize user inputs in query and
 * body. Since this checks the parsed body, please add this after the body
 * parser like koa-body.
 *
 * @param  {Any}      ctx  Koa context
 * @param  {Function} next Next handler
 */
module.exports = async (ctx, next) => {
  const { body = {}, query = {}, path } = ctx.request;

  if (!isWhiteListed(path)) {
    recursiveReplaceDangerous(body);
    recursiveReplaceDangerous(query);
  }

  await next();
};

function recursiveReplaceDangerous(value) {
  const type = typeof value;

  switch (type) {
    case 'undefined':
    case 'boolean':
    case 'number':
      return value;
    case 'object': {
      if (value === null) {
        return value;
      }

      const keys = Object.keys(value);

      for (let i = 0; i < keys.length; i++) {
        value[keys[i]] = recursiveReplaceDangerous(value[keys[i]]);
      }

      return value;
    }
    case 'string':
      return sanitizeString(value);
    default:
      throw new Error(`Unexpected type: ${type}`);
  }
}

function sanitizeString(str) {
  return xss(str);
}
