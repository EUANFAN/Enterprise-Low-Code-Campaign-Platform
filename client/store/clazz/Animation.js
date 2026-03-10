import { observable } from 'mobx';
import uid from 'uid';
import history from 'common/record';

class Animation {
  @observable id = uid(10);
  @observable clazz = 'animation';

  @observable name = '动画';

  @observable animationType = 'hash';

  @observable property = '';

  @observable propertyValue = '';

  @observable scene = 'In';

  @observable type = 'fade';

  @observable duration = 1000;

  @observable delay = 0;

  @observable loop = 1;

  constructor(data = {}) {
    Object.assign(this, data);
    this.duration = parseFloat(this.duration);
    this.delay = parseFloat(this.delay);
    this.loop = parseFloat(this.loop);
  }

  /**
   * 修改动画数据
   *
   * @param  {Object} modify 修改动画
   */
  modify(modify) {
    let me = this;

    for (let key of Object.keys(modify)) {
      me[key] = modify[key];
    }
    history.record();
  }
}
export default Animation;
