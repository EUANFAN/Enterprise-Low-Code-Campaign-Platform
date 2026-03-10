/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-12-17 17:12:00
 * @LastEditors: jielang
 * @LastEditTime: 2020-12-22 20:55:35
 */
import React from 'react';
import HEDropdown from 'components/HEDropdown';
import { HEMenu, HEMenuItem } from 'components/HEMenu';
import { HEHiddenButton } from 'components/HEHiddenButton';
import { validateRoleLimit } from 'common/utils';
export default class folderActionBar extends React.Component {
  _moreElement = React.createRef();

  state = { showMore: false };

  _handleMoreClick = () => {
    this.setState({ showMore: true });
  };

  _handleMenuClose = () => {
    this.setState({ showMore: false });
  };

  render() {
    const { showMore } = this.state;
    const {
      _handShowRenameFolderDialog,
      _handleDeleteFolder,
      _handleCollaborate,
    } = this.props;
    return (
      <HEDropdown
        show={showMore}
        targetElement={this._moreElement.current}
        width={100}
        menuTop={15}
        menu={
          <HEMenu>
            <React.Fragment>
              {validateRoleLimit('deleteProject') && (
                <HEMenuItem onClick={_handleDeleteFolder}>{'删除'}</HEMenuItem>
              )}
              {validateRoleLimit('renameProject') && (
                <HEMenuItem onClick={_handShowRenameFolderDialog}>
                  {'重命名'}
                </HEMenuItem>
              )}
              {validateRoleLimit('inviteUserManagerProject') && (
                <HEMenuItem onClick={_handleCollaborate}>
                  {'邀请协同'}
                </HEMenuItem>
              )}
            </React.Fragment>
          </HEMenu>
        }
        onClose={this._handleMenuClose}
      >
        <HEHiddenButton
          className="operate-button"
          ref={this._moreElement}
          onClick={this._handleMoreClick}
        >
          {'...'}
        </HEHiddenButton>
      </HEDropdown>
    );
  }
}
