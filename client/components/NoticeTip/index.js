/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-06-16 14:22:50
 * @LastEditors: jielang
 * @LastEditTime: 2021-06-16 20:36:24
 */
import React from 'react';
import './index.less';
import { getNoticeList } from 'apis/NoticeAPI';
export default class NoticeTip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: Boolean(props.text),
      text: '',
      state: '',
    };
  }
  handleClose = (e) => {
    if (e.target.className === 'notice__tip_sky-layer') {
      this.setState({ show: false, text: '' });
      this.props.onClose && this.props.onClose();
    }
  };
  getTimestamp = (date) => new Date(date).getTime();
  checkDate = async () => {
    let { list = [], now } = await getNoticeList({
      pageSize: 9999,
      page: 1,
    });
    now = this.getTimestamp(now);
    for (let i = 0; i < list.length; i++) {
      const start = this.getTimestamp(list[i].startTime);
      const end = this.getTimestamp(list[i].endTime);
      const sessionKey = `notice_tip_${list[i]._id}_${this.getTimestamp(
        list[i].lastModified
      )}`;
      if (!localStorage.getItem(sessionKey) && now >= start && now <= end) {
        localStorage.setItem(sessionKey, true);
        return this.setState({
          show: true,
          text: list[i].content,
          title: list[i].title,
        });
      }
    }
  };
  componentDidMount() {
    this.checkDate();
  }
  render() {
    return (
      this.state.show && (
        <div className="notice__tip_sky-layer" onClick={this.handleClose}>
          <div className="notice__tip_wrapper">
            <img
              className="notice__tip_bg"
              src="https://editor.xesimg.com/tailor/resource/notice-bg-1619690296395.png"
            ></img>
            <div className="notice__tip_title">
              — {this.props.title || this.state.title} —
            </div>
            <div className="notice__tip_desc">
              <div
                className="notice__tip_desc_content"
                dangerouslySetInnerHTML={{
                  __html: this.props.text || this.state.text || '',
                }}
              ></div>
            </div>
          </div>
        </div>
      )
    );
  }
}
