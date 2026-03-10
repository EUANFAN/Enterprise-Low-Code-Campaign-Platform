let parse = (search) => {
  let arr = search.split(/\?|&/g);
  let obj = {};

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].indexOf('=') >= 0) {
      let segs = arr[i].split('=');
      let key = segs.shift();
      obj[key] = decodeURIComponent(segs.join('='));
    }
  }

  return obj;
};

let stringify = (query) => {
  let list = [];
  for (let pro of Object.keys(query)) {
    let pairs = [encodeURIComponent(pro), encodeURIComponent(query[pro])].join(
      '='
    );
    list.push(pairs);
  }
  return list.join('&');
};

let appendQuery = (url, data) => {
  let q = parse(url.split('?')[1] || '');

  Object.assign(q, data);

  let str = stringify(q);

  return url.split('?')[0] + '?' + str;
};

export default {
  parse,
  appendQuery,
  stringify,
};
