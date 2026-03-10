import React, { Component } from 'react';
import classNames from 'classnames';
import './index.less';

export default class EditorLeftContainer extends Component {
  state = { collapsed: true }
  handleTabClick = (title) => {
    this.props.onChange(title);
    this.setState({ collapsed: true });
  }
  toggleCollapsed = () => {
    this.setState({ collapsed: false });
  }
  render() {
    const { children, currentTab, tabConfig } = this.props;
    return (
      <div className="editorLeftContainer_container">
        <div className="tab">
          {
            tabConfig.map((item) => (
              item.show && <div className={classNames('tab-card', item.title === currentTab ? 'actived' : '')} key={item.title} onClick={this.handleTabClick.bind(this, item.title)} >
                {React.cloneElement(item.icon)}
                <p>{item.title}</p>
              </div>
            ))
          }
        </div>
        <div className={classNames('context', this.state.collapsed ? '' : 'context_active')}>{children}</div>
        {
          this.state.collapsed && <div
            className='collapsed'
            onClick={this.toggleCollapsed.bind(this)}
          >
          </div>
        }
      </div>
    );
  }
}
