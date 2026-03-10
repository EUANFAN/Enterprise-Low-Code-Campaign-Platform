import { sendClickLog } from '@k9/x-com';

let _scriptLoaded_ = {};
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

  if (_scriptLoaded_[url] == 200) {
    execCallback(url, [null, 'cached']);
    return;
  }
  if (_scriptLoaded_[url] == 400) {
    execCallback(url, ['error']);
    return;
  }
  if (_scriptLoaded_[url] == 500) {
    execCallback(url, ['timeout']);
    return;
  }

  if (_scriptLoaded_[url] == 100) {
    return;
  }

  _scriptLoaded_[url] = 100;

  let timeOut = false;
  let timer = 0;
  let script = creatScript(url);
  let retryNode = creatScript(url + '?' + new Date().getTime());

  // 首次加载js成功
  script.onload = function () {
    if (!this.readyState || /^(loaded|complete)$/.test(this.readyState)) {
      if (!timeOut) {
        clearTimeout(timer);
        execCallback(url, [null, 'ok']);
      }
      _scriptLoaded_[url] = 200;
      script.onload = script.onreadystatechange = null;
    }
  };
  // 首次加载错误
  script.onerror = function () {
    if (!timeOut) {
      sendLog('error', url, 'component_load_error');
      clearTimeout(timer);
      let el = document.getElementById(script.id);
      if (el) {
        document.getElementsByTagName('head')[0].removeChild(el);
      }
      document.getElementsByTagName('head')[0].appendChild(retryNode);
      timeOutAgain();
    }
    script.onerror = null;
  };
  // 第二次加载js成功
  retryNode.onload = function () {
    if (!this.readyState || /^(loaded|complete)$/.test(this.readyState)) {
      if (!timeOut) {
        sendLog('ok', url, 'component_retry_success');
        clearTimeout(timer);
        execCallback(url, [null, 'ok']);
      }
      _scriptLoaded_[url] = 200;
      retryNode.onload = script.onreadystatechange = null;
    }
  };
  // 第二次报错
  retryNode.onerror = function () {
    if (!timeOut) {
      clearTimeout(timer);
      _scriptLoaded_[url] = 400;
      sendLog('error', url, 'component_retry_fail');
      execCallback(url, ['error']);
    }
    retryNode.onerror = null;
  };

  // 首次超时
  timer = setTimeout(function () {
    timeOut = true;
    sendLog(Error('timeout'), url, 'component_load_error');
    let el = document.getElementById(script.id);
    if (el) {
      document.getElementsByTagName('head')[0].removeChild(el);
    }
    document.getElementsByTagName('head')[0].appendChild(retryNode);
    script.onload = script.onreadystatechange = null;
    timeOutAgain();
  }, 10 * 1000);

  // 二次超时
  let timeOutAgain = function () {
    timeOut = false;
    timer = setTimeout(function () {
      timeOut = true;
      sendLog(Error('timeout'), url, 'component_retry_fail');
      execCallback(url, [Error('timeout')]);
    }, 10 * 1000);
  };

  document.getElementsByTagName('head')[0].appendChild(script);
  return 0;
}

function creatScript(url) {
  let script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.src = url;
  script.id = url.split('/').slice(-3, -1).join('');
  return script;
}
function sendLog(err, url, event) {
  sendClickLog({
    err: err,
    url: url,
    clickid: event,
  });
}

let loadScript = function (url) {
  return new Promise(function (resolve) {
    load(url, function (err, status) {
      resolve({
        err: err,
        status: status,
      });
    });
  });
};

export default loadScript;
