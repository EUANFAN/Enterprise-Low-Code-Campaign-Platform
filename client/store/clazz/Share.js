import { observable } from 'mobx';
import history from 'common/record';

class Share {
  clazz = 'share';
  @observable shareTitle = '网校就上希望学';
  @observable shareContent = '';
  @observable shareUrl = '';
  @observable shareImgUrl = 'https://m.xiwang.com/resource/zaowushenicon-1655691379031.png';
  @observable shareWidget = '';
  @observable showModal = false;
  @observable modalWidget = '';
  @observable menuItem = [
    'onMenuShareTimeline',
    'onMenuShareAppMessage',
    'onMenuShareQQ',
    'onMenuShareQZone',
  ];
  @observable getUserInfo = false;
  @observable wxMiniId = 'gh_c46843a58e20';
  @observable wxMiniPath = '';
  @observable wxMiniImageUrl = '';

  constructor(data = {}) {
    Object.assign(this, data);
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
export default Share;
