import history from 'common/record';
import Trigger from './Trigger';
import Animation from './Animation';

class Base {
  // 只有组件用得上
  findAnimation(id) {
    let index = this.animations.findIndex(function (item) {
      return item.id == id;
    });

    let animation = this.animations[index] || null;
    return animation;
  }

  addAnimation(settings, opts) {
    settings || (settings = {});
    opts = Object.assign({}, opts);

    if (!opts.id) {
      delete settings.id;
    }
    let animation = new Animation(settings, null);

    if (this.findAnimation(animation.id)) {
      console.warn('animation existed');
      return;
    }
    this.animations.push(animation);
    history.record();
  }

  removeAnimation(id) {
    let index = this.animations.findIndex(function (a) {
      return a.id == id;
    });

    if (index == -1) {
      return;
    }

    this.animations.splice(index, 1);
    history.record();
  }

  findTrigger(id) {
    let index = this.triggers.findIndex(function (item) {
      return item.id == id;
    });

    let trigger = this.triggers[index] || null;
    return trigger;
  }

  addTrigger(settings, opts) {
    settings || (settings = {});
    opts = Object.assign({}, opts);

    if (!opts.id) {
      delete settings.id;
    }
    const client = god.PageData.client;
    const config = Object.assign({}, settings, { client: client });
    let trigger = new Trigger(config, null);
    if (this.findTrigger(trigger.id)) {
      console.warn('trigger existed');
      return;
    }
    this.triggers.push(trigger);
    history.record();
  }

  removeTrigger(id) {
    let index = this.triggers.findIndex(function (t) {
      return t.id == id;
    });

    if (index == -1) {
      return;
    }

    this.triggers.splice(index, 1);
    history.record();
  }
}
export default Base;
