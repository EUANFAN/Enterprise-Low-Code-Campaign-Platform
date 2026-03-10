let request = require('request');
module.exports.post = async function (ctx) {
  let body = ctx.request.body;
  let method = body.method.toUpperCase();
  let dataUrl = body.dataUrl;
  let params = body.params;

  let dataResult = await new Promise((resolve) => {
    let options = {
      url: dataUrl,
      method: method,
    };

    let jsonPKey = 'jsonp_' + new Date().getTime();

    // GET || JSONP
    if (method == 'GET' || method == 'JSONP') {
      options.method = 'GET';
      options.qs = params || {};
      if (method == 'JSONP') {
        options.qs.callback = jsonPKey;
      }
    }
    // POST
    else {
      options.method = 'POST';
      options.form = params;
    }
    request(options, (error, body, res) => {
      if (res) {
        let data;
        try {
          if (method == 'JSONP') {
            data = new Function(`
                function ${jsonPKey} (res) {
                  return res;
                }
                return ${res};
              `)();
          } else {
            data = new Function('return ' + res)();
          }
        } catch (e) {
          resolve({});
          return;
        }
        if (data.code == 0) {
          resolve(data);
        } else {
          resolve({});
        }
      } else {
        resolve({});
      }
    });
  });
  ctx.data(dataResult);
};

module.exports.post.auth = true;
