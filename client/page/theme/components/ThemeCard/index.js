import React from 'react';
import HEProjectPosterImage from 'components/HEProjectPoster/HEProjectPosterImage';
import HEFrame from 'components/HEFrame';
import { HECard, HECardContent, HECardActions } from 'components/HECard';
import { HEMenu, HEMenuItem } from 'components/HEMenu';
import HEDropdown from 'components/HEDropdown';
import classNames from 'classnames';
import './index.less';
import { isPrivate, canShowAudit, AUDITING } from 'common/Audit.js';
import { validateRoleLimit } from 'common/utils';
import HotIcon from '../../../../static/imgs/hot-icon.png';
import CollectIcon from '../../../../static/imgs/collect-icon.png';
import CollectedIcon from '../../../../static/imgs/collected-icon.png';
import PreviewIcon from '../../../../static/imgs/preview-icon.png';
import ApplayIcon from '../../../../static/imgs/applay-icon.png';
import MoreDropdownIcon from '../../../../static/imgs/more-dropdown-icon.png';
import HEIcon from 'components/HEIcon';
import { getThemeDataConfig } from 'apis/ProjectAPI';
const PosterImageThemeSize = {
  WIDTH: 208,
  HEIGHT: 335,
};
export default class ThemeCard extends React.Component {
  state = {
    hover: false,
    showMore: false,
    themeConfig: null
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
    const { onCreateProject } = this.props;
    onCreateProject && onCreateProject();
  };
  async componentDidMount() {
    let themes = await getThemeDataConfig();
    let arr = themes.filter(item => {
      return this.props.id == item.themeId;
    }) || [];
    this.setState({
      themeConfig: arr[0]
    });
  }
  render() {
    const {
      id,
      className: classNameFromProps,
      themePoster,
      loading,
      name,
      auditStatus,
      collected,
      hot,
      type,
      onPreview,
      onCreateProject,
      onCollect,
      onCopy,
      onRename,
      onDelete,
      onEdit,
      onExamine,
      onRemove,
    } = this.props;
    const { hover, showMore, themeConfig } = this.state;
    const className = classNames(['theme-card', classNameFromProps], {
      'theme-card--loading': loading,
    });
    const showAuditButton = () => {
      if (canShowAudit(auditStatus)) {
        return <HEMenuItem onClick={onExamine}>{'提交审核'}</HEMenuItem>;
      }
      return null;
    };
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
            {AUDITING(auditStatus) ? '审核中' : '待审核'}
          </div>
        );
      }
      return null;
    };
    return (
      <div
        className="theme-card-container"
        onMouseEnter={this._handleMouseEnter}
        onMouseLeave={this._handleMouseLeave}
      >
        <HECard className={className} disableFloat={false}>
          <HECardContent
            className="theme-card__content"
            onClick={this._handleCreateProject}
          >
            <HEFrame className="theme-card__content__frame">
              <HEProjectPosterImage
                projectData={[themePoster + '']}
                width={PosterImageThemeSize.WIDTH}
                height={PosterImageThemeSize.HEIGHT}
              />
            </HEFrame>
          </HECardContent>
          <HECardActions className="theme-card__actions">
            <p className="theme-card__actions-title">{name}</p>
            <p className="theme-card__actions-desc">
              <img className="theme-card__actions-hot-icon" src={HotIcon}></img>
              {hot || 0}
            </p>
            {hover && validateRoleLimit('moreOptionTheme') && (
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
                    {validateRoleLimit('removeTheme') && (
                      <HEMenuItem onClick={onRemove}>{'移动'}</HEMenuItem>
                    )}
                    {validateRoleLimit('themeAppro') && showAuditButton()}
                  </HEMenu>
                }
                onClose={this._handleMenuClose}
              ></HEDropdown>
            )}
          </HECardActions>
        </HECard>
        {examineTopRight()}
        {/* hover蒙层 */}
        {hover && (
          <div className="theme-card-mask-wrapper">
            <div className="theme-card-mask-collect">
              {!collected && (
                <img
                  src={CollectIcon}
                  onClick={() => onCollect('collect')}
                ></img>
              )}
              {collected && (
                <img
                  src={CollectedIcon}
                  onClick={() => onCollect('cancel')}
                ></img>
              )}
            </div>
            <div className="theme-card-mask-preview" onClick={onPreview}>
              <img src={PreviewIcon}></img>预览
            </div>
            <div className="theme-card-mask-applay" onClick={onCreateProject}>
              <img src={ApplayIcon}></img>应用
            </div>
            {themeConfig &&
              validateRoleLimit('lookProjectData') && (
                <div
                  className="theme-card-mask-applay"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '56px',
                  }}
                  onClick={() => {
                    if (id) {
                        location.href = `/monster/dashboards/${themeConfig.themeIdRoute}`;
                    }
                  }}
                >
                  <HEIcon
                    type="icon-shuju"
                    style={{ fontSize: '22px' }}
                  ></HEIcon>
                  数据
                </div>
              )}
            {type != 'mycollection' && validateRoleLimit('moreOptionTheme') && (
              <div
                className="theme-card-mask-more"
                ref={this._moreElement}
                onClick={this._handleMoreClick}
              >
                <img src={MoreDropdownIcon}></img>更多
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
