function isObjectContain(obj, data) {
  obj || (obj = {});
  data || (data = {});

  for (var pro in data) {
    if (obj[pro] !== data[pro]) {
      return false;
    }
  }

  return true;
}

function fitler(arr, opts) {
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    if (isObjectContain(item, opts)) {
      return item;
    }
  }

  return null;
}

function findIndex(arr, opts) {
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    if (isObjectContain(item, opts)) {
      return i;
    }
  }

  return -1;
}

module.exports = {
  filter: fitler,
  findIndex: findIndex,
};
