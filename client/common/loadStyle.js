let _linkLoaded_ = {};
let _urlCallback_ = {};
function execCallback(url, args) {
  let cbs = _urlCallback_[url];
  while (cbs.length > 0) {
    let cb = cbs.shift();
    if (cb) {
      cb.apply(null, args);
    }
  }
}

function ensureProtocol(url) {
  return url.replace(/^http(s)?:/, location.protocol);
}

function load(url, callback) {
  url = ensureProtocol(url);

  if (!_urlCallback_[url]) {
    _urlCallback_[url] = [];
  }
  _urlCallback_[url].push(callback);

  if (_linkLoaded_[url] == 200) {
    execCallback(url, [null, 'cached']);
    return;
  }
  if (_linkLoaded_[url] == 400) {
    execCallback(url, ['error']);
    return;
  }
  if (_linkLoaded_[url] == 500) {
    execCallback(url, ['timeout']);
    return;
  }

  if (_linkLoaded_[url] == 100) {
    return;
  }

  _linkLoaded_[url] = 100;

  let timeOut = false;
  let timer = 0;
  let link = creatLink(url);
  let retryNode = creatLink(url + '?' + new Date().getTime());

  // 首次加载js成功
  link.onload = function () {
    if (!this.readyState || /^(loaded|complete)$/.test(this.readyState)) {
      if (!timeOut) {
        clearTimeout(timer);
        execCallback(url, [null, 'ok']);
      }
      _linkLoaded_[url] = 200;
      link.onload = link.onreadystatechange = null;
    }
  };
  // 首次加载错误
  link.onerror = function () {
    if (!timeOut) {
      clearTimeout(timer);
      let el = document.getElementById(link.id);
      if (el) {
        document.getElementsByTagName('head')[0].removeChild(el);
      }
      document.getElementsByTagName('head')[0].appendChild(retryNode);
      timeOutAgain();
    }
    link.onerror = null;
  };
  // 第二次加载js成功
  retryNode.onload = function () {
    if (!this.readyState || /^(loaded|complete)$/.test(this.readyState)) {
      if (!timeOut) {
        clearTimeout(timer);
        execCallback(url, [null, 'ok']);
      }
      _linkLoaded_[url] = 200;
      retryNode.onload = link.onreadystatechange = null;
    }
  };
  // 第二次报错
  retryNode.onerror = function () {
    if (!timeOut) {
      clearTimeout(timer);
      _linkLoaded_[url] = 400;
      execCallback(url, ['error']);
    }
    retryNode.onerror = null;
  };

  // 首次超时
  timer = setTimeout(function () {
    timeOut = true;
    let el = document.getElementById(link.id);
    if (el) {
      document.getElementsByTagName('head')[0].removeChild(el);
    }
    document.getElementsByTagName('head')[0].appendChild(retryNode);
    link.onload = link.onreadystatechange = null;
    timeOutAgain();
  }, 10 * 1000);

  // 二次超时
  let timeOutAgain = function () {
    timeOut = false;
    timer = setTimeout(function () {
      timeOut = true;
      execCallback(url, [Error('timeout')]);
    }, 10 * 1000);
  };

  document.getElementsByTagName('head')[0].appendChild(link);
  return 0;
}

function creatLink(url) {
  let link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.href = url;
  link.id = url.split('/').slice(-3, -1).join('');
  return link;
}

let loadStyle = function (url) {
  return new Promise(function (resolve) {
    load(url, function (err, status) {
      resolve({
        err: err,
        status: status,
      });
    });
  });
};

export default loadStyle;
