import reqwest from 'reqwest';
const fetch = (options) => {
  let defaultOptions = {
    url: '',
    method: 'get',
    crossOrigin: true,
    withCredentials: true,
    data: {},
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    type: options.type || 'json',
  };
  let opts = Object.assign({}, defaultOptions, options);
  opts.url = opts.url.replace(/^https?:\/\//, '//');
  return reqwest(opts).then(function (result) {
    if (result.errno == -1) {
      alert('您已退出，请重新登录');
      location.href = result.data.redirect;
    }
    return result;
  });
};

const get = (url, data) =>
  fetch({
    url,
    method: 'get',
    data,
  });

const post = (url, data) =>
  fetch({
    url,
    method: 'post',
    data,
  });

const jsonp = (url, callback, success) =>
  reqwest({
    url: url,
    type: 'jsonp',
    jsonpCallback: callback,
    success,
  });

export default {
  fetch,
  get,
  post,
  jsonp,
};
