const IS_MAIN_REGEX = /main\.js$/;
const readdir = require('fs-readdir-recursive');

const WHITE_MAP = [
  'ruleManage/main.js',
  'customRule/main.js',
  'data/main.js',
  'editor/edit/main.js',
  'error/main.js',
  'log/main.js',
  'project/center/main.js',
  'project/publish/main.js',
  'resources/main.js',
  'rule/main.js',
  'users/main.js',
  'widgets/main.js',
  'rulePreview/main.js',
  'audit/main.js',
  'theme/main.js',
];

const SPECIAL_ENTRY = [
  'project/preview/main.js'
];


let getEntry = (type = 'all') => {
  let TEMP_ARR = [];
  if(type == 'all') { // 所有入口
    TEMP_ARR = TEMP_ARR.concat(SPECIAL_ENTRY, WHITE_MAP);
  } else if(type == 'other') { // 除preview的入口
    TEMP_ARR = [...WHITE_MAP];
  } else if(type == 'special') {
    TEMP_ARR = [...SPECIAL_ENTRY];
  }
  const files = readdir(process.cwd() + '/client/page/');
  const pages = files
    .filter((file) => IS_MAIN_REGEX.test(file))
    .filter((file) => TEMP_ARR.includes(file))
    .map((file) => file.replace(/\.js$/, ''));

  let entry = {};
  pages.forEach((page) => {
    entry[page] = `./client/page/${page}.js`;
  });
  return {
    entry,
    pages
  };
};

module.exports = {
  WHITE_MAP,
  SPECIAL_ENTRY,
  getEntry
};
