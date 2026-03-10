function isHttpUrl(str) {
  return /^\/\//.test(str) || /^http/.test(str);
}

export default {
  name: '跳转链接',
  type: 'Redirect',
  data: {
    url: '',
    parameter: false,
    redirectType: 'default'
  },

  config: {
    url: {
      msg: '支持 http|mailto',
      text: 'URL',
      type: 'NormalText',
      useData: true
    },
    parameter: {
      text: '参数透传',
      type: 'Radio',
      msg: '将当前页面的参数透传给跳转URL中',
      value: false,
      options: [
        {
          text: '不透传参数',
          value: false
        },
        {
          text: '透传页面参数',
          value: true
        }
      ]
    },
    redirectType: {
      text: '跳转方式',
      type: 'Select',
      value: 'default',
      msg: '常规情况下选择默认即可',
      options: [
        {
          text: '默认',
          value: 'default'
        },
        {
          text: '保留历史记录',
          value: 'keepHistory'
        },
        {
          text: '不保留历史记录',
          value: 'noKeepHistory'
        }
      ]
    }
  },
  run(ctx, next) {
    let data = ctx.trigger.data;
    const { useDataValue, variableMap, project, page } = ctx;
    let url = useDataValue(data.url, variableMap, page, project) || '';
    let redirectType = data.redirectType;
    url = url.trim();
    if (!url) {
      next();
      return;
    }

    if (/^\/\//.test(url)) {
      url = location.protocol + url;
    }

    // 如果是邮件，直接打开
    if (/^mailto:/.test(url)) {
      god.location.href = url;
      return;
    }

    // 如果需要透传 而且 是http请求 就在后边加上参数
    if (isHttpUrl(url)) {
      if (data.parameter) {
        let query = ctx.getQuery();
        url +=
          (url.indexOf('?') > -1 ? '&' : '?') +
          location.search.replace('?', '');
        if (query) {
          Object.keys(query).forEach((key) => {
            url += (url.indexOf('?') > -1 ? '&' : '?') + `${key}=${query[key]}`;
          });
        }
      }
    }

    if (!redirectType || redirectType == 'default') {
      god.location.href = url;
    } else if (redirectType == 'keepHistory') {
      god.location.href = url;
    } else if (redirectType == 'noKeepHistory') {
      god.location.replace(url);
    }

    next();
  }
};
