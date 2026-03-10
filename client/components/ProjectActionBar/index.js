import React from 'react';
import { HECardActions } from 'components/HECard';
import HEDropdown from 'components/HEDropdown';
import { HEMenu, HEMenuItem } from 'components/HEMenu';
import { HEHiddenButtonGroup, HEHiddenButton } from 'components/HEHiddenButton';
import { validateRoleLimit } from 'common/utils';
import './index.less';

export default class ProjectActionBar extends React.Component {
  static defaultProps = {
    revisionDataOrList: [],
  };

  _moreElement = React.createRef();

  state = { showMore: false };

  _handleMoreClick = () => {
    this.setState({ showMore: true });
  };

  _handleMenuClose = () => {
    this.setState({ showMore: false });
  };
  render() {
    const {
      isFolder,
      onShowInfo,
      onOpen,
      onCheck,
      onDelete,
      onCheckRevisions,
      onPreview,
      onMove,
      onTransfer,
      onCollaborate,
      onOpenInNewTab,
      onCopy,
      onData,
      onShowFormStatistics,
      hasFormWidget,
      onRestore,
      isCard,
      ruleWidget,
      themeId,
      lastPublished,
    } = this.props;
    const { showMore } = this.state;
    const status =
      location.pathname == '/projects/bin' ? 'out-of-use' : 'in-use';
    return (
      <HECardActions
        className={isCard ? 'project-card__actions' : 'project-table__actions'}
      >
        <HEHiddenButtonGroup className="project-card__actions__button-group">
          {!isFolder && (
            <HEHiddenButton
              icon={isCard ? 'icon-review' : null}
              onClick={onPreview}
            >
              {' '}
              {'预览'}{' '}
            </HEHiddenButton>
          )}
          {!isCard ? (
            <>
              {isFolder ? (
                <HEHiddenButton onClick={onOpen}> {'打开'}</HEHiddenButton>
              ) : (
                validateRoleLimit('lookProject') && (
                  <HEHiddenButton onClick={onCheck}> {'编辑'}</HEHiddenButton>
                )
              )}
              <HEHiddenButton onClick={onShowInfo}>{'项目信息'}</HEHiddenButton>
            </>
          ) : (
            <HEHiddenButton onClick={onShowInfo} icon={'icon-info'}>
              {'信息'}
            </HEHiddenButton>
          )}
          {!isFolder && (!ruleWidget || themeId) && (
            <>
            {/* TODO：暂时关闭数据入口 */}
              {status == 'in-use'
                ? false && validateRoleLimit('lookProjectData') && (
                    <HEHiddenButton
                      onClick={onData}
                      icon={isCard ? 'icon-shuju' : null}
                    >
                      {' '}
                      {'数据'}{' '}
                    </HEHiddenButton>
                  )
                : validateRoleLimit('restoreBinProject') && (
                    <HEHiddenButton
                      onClick={onRestore}
                      icon={isCard ? 'icon-huanyuan' : null}
                    >
                      {' '}
                      {'还原'}{' '}
                    </HEHiddenButton>
                  )}
            </>
          )}
          <HEDropdown
            show={showMore}
            targetElement={this._moreElement.current}
            width={100}
            menuTop={15}
            menu={
              <HEMenu>
                {!isFolder && (
                  <React.Fragment>
                    {validateRoleLimit('lookProjectLog') && (
                      <HEMenuItem onClick={onCheckRevisions}>
                        {'历史'}
                      </HEMenuItem>
                    )}
                    {lastPublished && (
                      <HEMenuItem onClick={onOpenInNewTab}>{'链接'}</HEMenuItem>
                    )}
                    {validateRoleLimit('copyProject') && (
                      <HEMenuItem onClick={onCopy}>{'复制'}</HEMenuItem>
                    )}
                  </React.Fragment>
                )}
                {status == 'in-use'
                  ? validateRoleLimit('deleteProject') && (
                      <HEMenuItem onClick={onDelete}>{'删除'}</HEMenuItem>
                    )
                  : validateRoleLimit('restoreBinProject') && (
                      <HEMenuItem onClick={onRestore}> {'还原'} </HEMenuItem>
                    )}
                {
                  <React.Fragment>
                    {validateRoleLimit('moveProject') && (
                      <HEMenuItem onClick={onMove}>
                        {' '}
                        {'移动到文件夹'}
                      </HEMenuItem>
                    )}
                    {validateRoleLimit('transProjectToUser') && (
                      <HEMenuItem onClick={onTransfer}>
                        {'转移给他人'}
                      </HEMenuItem>
                    )}
                  </React.Fragment>
                }
                {validateRoleLimit('inviteUserManagerProject') && (
                  <HEMenuItem onClick={onCollaborate}>{'邀请协同'}</HEMenuItem>
                )}
                {hasFormWidget && (
                  <HEMenuItem onClick={onShowFormStatistics}>
                    {'收集'}
                  </HEMenuItem>
                )}
              </HEMenu>
            }
            onClose={this._handleMenuClose}
          >
            <HEHiddenButton
              className="more-botton"
              ref={this._moreElement}
              icon={isCard ? 'icon-more' : null}
              onClick={this._handleMoreClick}
            >
              {'更多'}
            </HEHiddenButton>
          </HEDropdown>
        </HEHiddenButtonGroup>
      </HECardActions>
    );
  }
}
