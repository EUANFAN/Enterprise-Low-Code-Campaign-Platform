import { getPageIndexById, xEditorStore } from 'common/utils';
import qs from 'query-string';
const config = {
  name: '跳至页面',
  type: 'ScrollToPage',
  data: {
    isParams: false,
    keepHistory: true,
  },
  config: {
    pageNum: {
      type: 'PageSelect',
      text: '跳转页面',
      value: '',
    },
    keepHistory: {
      type: 'Radio',
      text: '是否保存历史记录',
      options: [
        {
          text: '保存',
          value: true,
        },
        {
          text: '不保存',
          value: false,
        },
      ],
    },
    isParams: {
      type: 'Radio',
      text: '是否携带参数',
      options: [
        {
          text: '不携带',
          value: false,
        },
        {
          text: '携带',
          value: true,
        },
      ],
    },
    params: {
      type: 'MultipleSelect',
      text: '页内变量参数',
      msg: '来源页内变量',
      options: function (trigger, element, project) {
        if (project.useData && project.variableStore.PAGE_VARIABLE) {
          let pageVariable = project.variableStore.PAGE_VARIABLE;
          return Object.keys(pageVariable).map((variable) => {
            return {
              text: variable,
              value: variable,
            };
          });
        }
        return [];
      },
      editable: true,
      when(trigger) {
        return trigger.data.isParams;
      },
    },
  },

  run(ctx, next) {
    const { trigger } = ctx;
    xEditorStore.currentPageId = trigger.data.pageNum;
    const currentPageIndex = getPageIndexById(xEditorStore.currentPageId);
    // 当前页面索引大于上一个页面，说明是push，否则是pop
    xEditorStore.action =
      currentPageIndex > xEditorStore.lastPageIndex ? 'PUSH' : 'POP';
    let params = {};
    if (
      trigger.data.isParams &&
      trigger.data.params &&
      trigger.data.params.length
    ) {
      trigger.data.params.forEach((para) => {
        let res = ctx.getPageDataByKey(para);
        if (res) {
          params[para] = res;
        }
      });
    }
    let action = 'push';
    if (!this.data.keepHistory) {
      action = 'replace';
    }
    setTimeout(() => {
      if (xEditorStore['history']) {
        xEditorStore.history[action]({
          pathname: `/${trigger.data.pageNum}`,
          search: qs.stringify(params),
        });
      } else {
        import('common/history').then((result) => {
          xEditorStore['history'] = result.default;
          xEditorStore.history[action]({
            pathname: `/${trigger.data.pageNum}`,
            search: qs.stringify(params),
          });
        });
        // require.ensure([], (require) => {
        //   xEditorStore['history'] = require('common/history').default;
        //   xEditorStore.history[action]({
        //     pathname: `/${trigger.data.pageNum}`,
        //     search: qs.stringify(params)
        //   });
        // });
      }
    }, 0);
    next();
  },
};

export default config;
