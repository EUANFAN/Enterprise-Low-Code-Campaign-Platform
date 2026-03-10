import { observable } from 'mobx';
import history from 'common/record';

import uid from 'uid';
class Trigger {
  @observable id = uid(10);

  @observable clazz = 'trigger';

  @observable type = '';

  @observable event = '';

  @observable showCount = false;

  @observable count = 1;

  @observable client = [];

  @observable platform = ['iOS', 'android', 'other'];

  @observable data = observable({});

  @observable version = '';

  constructor(initData = {}) {
    if (!initData.data) {
      initData.data = {};
    }
    Object.assign(this, initData);
  }

  modify(_modify, namespace) {
    let me = this;
    if (!namespace) {
      for (let key of Object.keys(_modify)) {
        let value = _modify[key];
        me[key] = value;
        // 行为类型修改要清理一遍数据
        if (key == 'type') {
          me.data = observable({}); // .clear();
        }
      }
    } else {
      for (let key of Object.keys(_modify)) {
        let value = _modify[key];
        this.data = { ...this.data, [key]: value };
      }
    }
    history.record();
  }
}
export default Trigger;
