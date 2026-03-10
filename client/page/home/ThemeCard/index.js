import React from 'react';
import HEProjectPosterImage from 'components/HEProjectPoster/HEProjectPosterImage';
import HEFrame from 'components/HEFrame';
import HELoadingString from 'components/HELoadingString';
import { HECard, HECardContent, HECardActions } from 'components/HECard';
import { HEHiddenButtonGroup, HEHiddenButton } from 'components/HEHiddenButton';
import { HEMenu, HEMenuItem } from 'components/HEMenu';
import HEDropdown from 'components/HEDropdown';
import HEFileCollection from 'components/HEFileCollection';
import classNames from 'classnames';
import './index.less';
import { isPrivate, canShowAudit, AUDITING } from 'common/Audit.js';
import { validateRoleLimit } from 'common/utils';

const PosterImageThemeSize = {
  WIDTH: 208,
  HEIGHT: 335,
};

const PosterImageFolderSize = {
  WIDTH: 375,
  HEIGHT: 603,
};

export default class ThemeCard extends React.Component {
  state = {
    hover: false,
    showMore: false,
  };
  _moreElement = React.createRef();
  _handleMouseEnter = () => {
    this.setState({ hover: true });
  };

  _handleMouseLeave = () => {
    this.setState({ hover: false });
  };
  _handleMoreClick = () => {
    this.setState({ showMore: true });
  };
  _handleMenuClose = () => {
    this.setState({ showMore: false });
  };
  _handleCreateProject = () => {
    const { isTheme, onCreateProject, onOpen } = this.props;
    if (isTheme) {
      onCreateProject();
    } else {
      onOpen();
    }
  };
  render() {
    const {
      className: classNameFromProps,
      themePoster,
      loading,
      name,
      onPreview,
      onCreateProject,
      onCopy,
      onRename,
      onDelete,
      auditStatus,
      onOpen,
      onEdit,
      isPopular,
      isTheme,
      onExamine,
    } = this.props;
    const { hover, showMore } = this.state;
    const className = classNames(['theme-card', classNameFromProps], {
      'theme-card--loading': loading,
    });
    const showAuditButton = () => {
      if (canShowAudit(auditStatus)) {
        return <HEMenuItem onClick={onExamine}>{'提交审核'}</HEMenuItem>;
      }
      return null;
    };
    const themeAction = (
      <HEHiddenButtonGroup className="theme-card__actions__button-group">
        <HEHiddenButton icon={'icon-review'} onClick={onPreview}>
          {' '}
          {'预览'}
        </HEHiddenButton>
        <HEHiddenButton icon={'icon-yingyong'} onClick={onCreateProject}>
          {'应用模板'}
        </HEHiddenButton>
        {!isPopular && validateRoleLimit('moreOptionTheme') && (
          <HEDropdown
            show={showMore}
            targetElement={this._moreElement.current}
            width={100}
            menuTop={15}
            menu={
              <HEMenu>
                {validateRoleLimit('modifyTheme') && (
                  <HEMenuItem onClick={onEdit}>{'编辑'}</HEMenuItem>
                )}
                {validateRoleLimit('copyTheme') && (
                  <HEMenuItem onClick={onCopy}>{'复制'}</HEMenuItem>
                )}
                {validateRoleLimit('renameTheme') && (
                  <HEMenuItem onClick={onRename}>{'重命名'}</HEMenuItem>
                )}
                {validateRoleLimit('deleteTheme') && (
                  <HEMenuItem onClick={onDelete}>{'删除'}</HEMenuItem>
                )}
                {validateRoleLimit('themeAppro') && showAuditButton()}
              </HEMenu>
            }
            onClose={this._handleMenuClose}
          >
            <HEHiddenButton
              ref={this._moreElement}
              icon={'icon-more'}
              onClick={this._handleMoreClick}
            >
              {'更多'}
            </HEHiddenButton>
          </HEDropdown>
        )}
      </HEHiddenButtonGroup>
    );
    const groupAction = (
      <HEHiddenButtonGroup className="theme-card__actions__button-group">
        {validateRoleLimit('renameThemeGroups') && (
          <HEHiddenButton icon={'icon-bianji'} onClick={onRename}>
            {' '}
            {'重命名'}
          </HEHiddenButton>
        )}
        {validateRoleLimit('deleteThemeGroups') && (
          <HEHiddenButton icon={'icon-shanchu'} onClick={onDelete}>
            {'删除'}
          </HEHiddenButton>
        )}
        <HEHiddenButton icon={'icon-dakai'} onClick={onOpen}>
          {'打开'}
        </HEHiddenButton>
      </HEHiddenButtonGroup>
    );
    const examineTopRight = () => {
      const themeRightStyle = {
        lineHeight: '45px',
      };
      if (isPrivate(auditStatus)) {
        return (
          <div
            className="theme-card__theme-right"
            style={AUDITING(auditStatus) ? themeRightStyle : null}
          >
            {AUDITING(auditStatus) ? '审核中' : '仅自己可见'}
          </div>
        );
      }
      return null;
    };
    return (
      <div className="theme-card-container">
        <HECard
          className={className}
          onMouseEnter={this._handleMouseEnter}
          onMouseLeave={this._handleMouseLeave}
          disableFloat={false}
        >
          <HECardContent
            className="theme-card__content"
            onClick={this._handleCreateProject}
          >
            <HEFrame className="theme-card__content__frame">
              {!isTheme && (
                <HEFileCollection>
                  {[
                    <HEProjectPosterImage
                      key="HEProjectPosterImage-1"
                      projectData={[themePoster + '']}
                      width={PosterImageFolderSize.WIDTH}
                      height={PosterImageFolderSize.HEIGHT}
                    />,
                  ]}
                </HEFileCollection>
              )}
              {isTheme && (
                <HEProjectPosterImage
                  projectData={[themePoster + '']}
                  width={PosterImageThemeSize.WIDTH}
                  height={PosterImageThemeSize.HEIGHT}
                />
              )}
            </HEFrame>
          </HECardContent>

          <HECardActions className="theme-card__actions">
            {hover && !loading ? (
              isTheme ? (
                themeAction
              ) : (
                groupAction
              )
            ) : loading ? (
              <HELoadingString />
            ) : (
              name
            )}
          </HECardActions>
        </HECard>
        {examineTopRight()}
      </div>
    );
  }
}
