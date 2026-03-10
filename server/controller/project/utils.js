const { merge } = require('lodash');
const Clazzes = {
  PROJECT: 'project',
};
const UserSelects = {
  AUTO: 'auto',
  NONE: 'none',
};

const DEFAULT_TITLE = '示例公司';
const DEFAULT_LAYOUT = 'normal';
const DEFAULT_PAGE_WIDTH = 375;
const DEFAULT_PAGE_HEIGHT = 679;
const DEFAULT_USER_SELECT = UserSelects.AUTO;

function createProjectFromPage(options = {}) {
  return merge(
    {
      title: DEFAULT_TITLE,
      layout: DEFAULT_LAYOUT,
      clazz: Clazzes.PROJECT,
      width: DEFAULT_PAGE_WIDTH,
      height: DEFAULT_PAGE_HEIGHT,
      userSelect: DEFAULT_USER_SELECT,
      useData: false,
      dataUrl: '',
      descUrl: '',
      descriptions: [],
      pageState: {},
      usePreloader: false,
      preLoadBackgroundImg: '',
      pages: [],
    },
    options
  );
}
module.exports = {
  createProjectFromPage,
};
