import { observable } from 'mobx';

let ProjectStore = observable({
  batchWidgetConfigStore: {
    data: null,
    modify: function (modify, namespace) {
      for (let key of Object.keys(modify)) {
        this[namespace][key] = modify[key];
      }
    },
  },
});
export default ProjectStore;
