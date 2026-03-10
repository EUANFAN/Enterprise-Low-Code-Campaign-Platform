import './navbar.less';
import { observer } from 'mobx-react';
import React from 'react';
@observer
class Navbar extends React.Component {
  state = {
    activeIndex: 0,
  };
  handleClick = (index) => {
    this.setState({
      activeIndex: index,
    });
    const item = document.querySelector('.groupControlWrap-' + index);
    item && item.scrollIntoView();
  };
  addEventListenerScoll() {
    for (let index = 0; index < this.props.config.length; index++) {
      const item = document.querySelector('.groupControlWrap-' + index);
      let intersectionObserver = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio <= 0) return;
        // 出现在可视区域
        this.setState({
          activeIndex: index,
        });
        return;
      });
      item && intersectionObserver.observe(item);
    }
  }
  componentDidMount() {
    this.addEventListenerScoll();
  }
  render() {
    const { config } = this.props;
    return (
      <div className="rule-group-navlist-wrapper">
        {config &&
          config.map((item, index) => {
            return (
              <div
                className="rule-group-navlist-item"
                onClick={() => this.handleClick(index)}
                key={item + index}
              >
                <div
                  className={`rule-group-navlist-ball  ${
                    this.state.activeIndex == index ? 'active' : ''
                  }`}
                ></div>
                <div className="rule-group-navlist-text">{item}</div>
                <div className="rule-group-navlist-line"></div>
              </div>
            );
          })}
      </div>
    );
  }
}
export default Navbar;
