import './Theme.less';

import React, { Fragment } from 'react';
import { observer } from 'mobx-react';
import { Icon } from 'antd';
import Page from '../../page/project/preview/Page';
import dateformat from 'dateformat';
import store from '../../store/page';
import { Provider } from '../StoreContext';

@observer
class Theme extends React.Component {
  constructor(props) {
    super(props);
  }

  _handleEditClick = (event) => {
    const { onEdit, theme } = this.props;

    onEdit(event, theme._id);
  };

  selectTheme = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let me = this;
    let parent = me.props.parent;
    // 点击时控制台查看主题的id，请勿删除
    parent.selectTheme(me.props.theme);
  };

  deleteTheme = (e) => {
    e.stopPropagation();

    let me = this;
    let parent = me.props.parent;
    parent.deleteTheme(me.props.theme);
  };
  updateTheme = (e) => {
    e.stopPropagation();

    let me = this;
    let parent = me.props.parent;
    parent.updateTheme(me.props.theme);
  };
  exchangeGroup = (e) => {
    e.stopPropagation();

    let me = this;
    let parent = me.props.parent;
    parent.exchangeGroup(me.props.theme);
  };

  render() {
    let { checked, theme, editable } = this.props;
    let style = {
      transform: 'scale(0.5)',
      transformOrigin: '0 0',
      position: 'relative',
    };
    // 防止点击
    let maskStyle = {
      background: checked ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.37)',
    };

    let date = theme.createdAt
      ? dateformat(theme.createdAt, 'yyyy-mm-dd HH:MM:ss')
      : '无创建时间';
    store.setProject({ pages: [this.props.theme] });
    return (
      <div className="theme" onClick={this.selectTheme}>
        <div className="page" style={style}>
          <Provider value={store}>
            <Page
              container={theme.publishedData}
              widgets={theme.publishedData.widgets}
            />
          </Provider>
        </div>
        <div className="theme-mask" style={maskStyle}></div>
        <div className="info">
          <p>{theme.name}</p>
          <p>
            {theme.ownerId} {date}
          </p>
        </div>
        {editable && (
          <Icon
            title={'修改'}
            className="theme-edit"
            type="edit"
            onClick={this._handleEditClick}
          />
        )}
        {theme.ownerId !== 'system' && (
          <Fragment>
            <Icon
              title={'删除'}
              className="theme-delete"
              type="close"
              onClick={this.deleteTheme}
            />
            <Icon
              title={'修改名称'}
              className="theme-update"
              type="edit"
              onClick={this.updateTheme}
            />
            <Icon
              title={'移动到组'}
              className="theme-exchange"
              type="swap"
              onClick={this.exchangeGroup}
            />
          </Fragment>
        )}
        {checked && <Icon className="theme-check" type="check" />}
      </div>
    );
  }
}

module.exports = Theme;
