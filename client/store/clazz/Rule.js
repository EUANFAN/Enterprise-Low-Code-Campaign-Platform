import { observable } from 'mobx'
import history from 'common/record'

class Rule {
  @observable clazz = 'rule'

  @observable type = ''

  @observable data = observable({})

  @observable version = ''

  constructor(initData = {}) {
    if (!initData.data) {
      initData.data = {}
    }

    Object.assign(this, initData)
  }

  modify(_modify, namespace) {
    let me = this
    if (!namespace) {
      for (let key of Object.keys(_modify)) {
        let value = _modify[key]
        me[key] = value
        // 行为类型修改要清理一遍数据
        if (key == 'type') {
          me.data = observable({}) // .clear();
        }
      }
    } else {
      for (let key of Object.keys(_modify)) {
        let value = _modify[key]
        this.data[key] = value
      }
    }
    history.record()
  }
}

export default Rule
