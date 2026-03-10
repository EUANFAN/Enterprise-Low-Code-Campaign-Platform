import { observable } from 'mobx';
import { setDataToProjectVariableStore } from 'common/handlePageDataByVariable';

class Rule {
  @observable clazz = 'buildtoolRule';

  @observable type = '';

  @observable data = observable({});

  @observable version = '';

  constructor(initData = {}, project) {
    if (!initData.data) {
      initData.data = {};
    }
    Object.assign(this, initData);
    this.projectClazz = project;
    const isBuildtool = god.location.href.indexOf('buildtool') >= 0;
    if (god.inEditor && isBuildtool) {
      const page = this.projectClazz.getSelectedPage() || this.projectClazz;
      setDataToProjectVariableStore(page, { config: this.data });
    }
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
    const isBuildtool = god.location.href.indexOf('buildtool') >= 0;
    if (god.inEditor && isBuildtool) {
      const page = this.projectClazz.getSelectedPage() || this.projectClazz;
      setDataToProjectVariableStore(page, { config: this.data });
    }
  }
}
export default Rule;
