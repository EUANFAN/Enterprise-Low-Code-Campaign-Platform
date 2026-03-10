import React from 'react';
import HEDropdown from 'components/HEDropdown';
import { HEMenu, HEMenuItem } from 'components/HEMenu';
import { HEHiddenButtonGroup, HEHiddenButton } from 'components/HEHiddenButton';
import './index.less';
import { validateRoleLimit } from 'common/utils';
import ThemetypeIcon from '../../static/imgs/themetype.png';
import ThemetypeSelectedIcon from '../../static/imgs/themetype-selected.png';
export default class HEThemeActionBar extends React.Component {
  _moreElement = React.createRef();
  _createElement = React.createRef();
  state = { showMore: false, showCreate: false, hover: false };

  _handleMoreClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ showMore: true });
  };

  _handleMenuClose = () => {
    this.setState({ showMore: false, showCreate: false, hover: false });
  };

  _handleCreateClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ showCreate: true });
  };

  _handleSubmitClick = (event, action) => {
    event.preventDefault();
    event.stopPropagation();
    action && action();
    this.setState({ showMore: false, showCreate: false });
  };
  _handleMouseEnter = () => {
    this.setState({ hover: true });
  };

  _handleMouseLeave = () => {
    const { showMore, showCreate } = this.state;
    if (showMore || showCreate) return;
    this.setState({ hover: false });
  };
  render() {
    const {
      name,
      onCreate,
      onDelete,
      onSelect,
      isGroup,
      isSelectedThemeType,
      onAudit,
      onEdit,
    } = this.props;
    const { showMore, showCreate, hover } = this.state;
    return (
      <div
        className="he-drawer-section__container__bar"
        onClick={onSelect}
        onMouseEnter={this._handleMouseEnter}
        onMouseLeave={this._handleMouseLeave}
      >
        <span className="he-drawer-section__container__bar__title">
          {!isGroup && !isSelectedThemeType && (
            <img className={'he-drawer-menu-icon'} src={ThemetypeIcon}></img>
          )}
          {!isGroup && isSelectedThemeType && (
            <img
              className={'he-drawer-menu-icon'}
              src={ThemetypeSelectedIcon}
            ></img>
          )}
          <span className="he-drawer-section__popular-item__name" title={name}>
            {name}
          </span>
        </span>
        <div
          className="he-drawer-section__container__bar__handle"
          style={{ display: hover ? 'flex' : 'none' }}
        >
          <HEHiddenButtonGroup>
            <HEDropdown
              show={showMore}
              targetElement={this._moreElement.current}
              width={100}
              menuTop={15}
              menu={
                <HEMenu>
                  <HEMenuItem
                    onClick={(event) =>
                      this._handleSubmitClick(event, onDelete)
                    }
                  >
                    {'删除'}
                  </HEMenuItem>
                  {isGroup && validateRoleLimit('renameThemeGroups') && (
                    <HEMenuItem
                      onClick={(event) =>
                        this._handleSubmitClick(event, onEdit)
                      }
                    >
                      编辑
                    </HEMenuItem>
                  )}
                  {!isGroup && (
                    <HEMenuItem
                      onClick={(event) =>
                        this._handleSubmitClick(event, onAudit)
                      }
                    >
                      {'模板类别设置'}
                    </HEMenuItem>
                  )}
                </HEMenu>
              }
              onClose={this._handleMenuClose}
            >
              {validateRoleLimit('updateThemeGroup') && (
                <HEHiddenButton
                  className="he-drawer-section__container__bar__handle__btn"
                  ref={this._moreElement}
                  icon={'icon-gengduo'}
                  onClick={this._handleMoreClick}
                ></HEHiddenButton>
              )}
            </HEDropdown>
            {validateRoleLimit('updateThemeGroup') && onCreate && (
              <HEDropdown
                show={showCreate}
                targetElement={this._createElement.current}
                width={100}
                menuTop={15}
                menu={
                  <HEMenu>
                    <HEMenuItem
                      onClick={(event) =>
                        this._handleSubmitClick(event, onCreate)
                      }
                    >
                      {'新建模板组'}
                    </HEMenuItem>
                  </HEMenu>
                }
                onClose={this._handleMenuClose}
              >
                <HEHiddenButton
                  className="he-drawer-section__container__bar__handle__btn"
                  ref={this._createElement}
                  icon={'icon-tianjia2'}
                  onClick={this._handleCreateClick}
                ></HEHiddenButton>
              </HEDropdown>
            )}
          </HEHiddenButtonGroup>
        </div>
      </div>
    );
  }
}
