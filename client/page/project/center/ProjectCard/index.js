import React from 'react';
import classNames from 'classnames';
import { Popover } from 'antd';
import { HECard, HECardContent, HECardActions } from 'components/HECard';
import ProjectActionBar from 'components/ProjectActionBar';
import HEFileCollection from 'components/HEFileCollection';
import HELoadingString from 'components/HELoadingString';
import HEFrame from 'components/HEFrame';
import Collaborate from 'components/icons/Collaborate';
import { PROJECT_STATUS } from 'common/constants';
import HEProjectPosterImage from 'components/HEProjectPoster/HEProjectPosterImage';
import './index.less';

const PosterImageProjectSize = {
  WIDTH: 208,
  HEIGHT: 335,
};

const PosterImageFolderSize = {
  WIDTH: 180,
  HEIGHT: 290,
};

export default class ProjectCard extends React.Component {
  static defaultProps = {
    revisionDataOrList: [],
  };

  _moreElement = React.createRef();

  state = { hover: false, showMore: false, loadedScript: false };

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

  _renderFolderOrProject = (key, projectData, imageSize) => {
    return (
      <HEFrame key={key} className="he-project-poster__poster">
        <HEProjectPosterImage
          projectData={projectData}
          width={imageSize.WIDTH}
          height={imageSize.HEIGHT}
        />
      </HEFrame>
    );
  };

  render() {
    const {
      className: classNameFromProps,
      title,
      showTool,
      id,
      isFolder,
      loading,
      onOpen,
      revisionDataOrList,
      partners,
      ownerId,
      projectStatus,
      ruleWidget,
    } = this.props;

    const { hover } = this.state;
    let collaborators = [];
    if (partners) {
      collaborators = partners.filter((partnerId) => partnerId !== ownerId);
    }
    const className = classNames(['project-card', classNameFromProps], {
      'project-card--loading': loading,
    });

    // 此处判断是因为文件夹
    const projectStatusStyle = {
      backgroundColor:
        projectStatus && PROJECT_STATUS[projectStatus].backgroundColor,
    };

    return (
      <React.Fragment>
        <HECard
          className={className}
          onMouseEnter={this._handleMouseEnter}
          onMouseLeave={this._handleMouseLeave}
          disableFloat={isFolder}
        >
          {/* 项目状态 */}
          {!isFolder ? (
            <div
              className="project-card__review__status"
              style={projectStatusStyle}
            >
              {PROJECT_STATUS[projectStatus].text}
            </div>
          ) : (
            ''
          )}
          <HECardContent className="project-card__content" onClick={onOpen}>
            {loading ? (
              <HEFrame className="project-card__content__frame" />
            ) : isFolder ? (
              <HEFileCollection className="project-card__content__frame">
                {revisionDataOrList.map((project, index) =>
                  this._renderFolderOrProject(
                    index,
                    project,
                    PosterImageFolderSize
                  )
                )}
              </HEFileCollection>
            ) : (
              <HEFrame className="project-card__content__frame">
                {this._renderFolderOrProject(
                  undefined,
                  revisionDataOrList,
                  PosterImageProjectSize
                )}
              </HEFrame>
            )}
          </HECardContent>
          {Boolean(collaborators.length) && (
            <div
              className="project-card__content__partner"
              onClick={(event) => this.props.onCollaborate(event, id)}
            >
              <div className="project-card__content__partner__num">
                <Collaborate className="project-card__content__partner__icon" />
                {collaborators.length + 1}
              </div>
            </div>
          )}
          {showTool ? (
            <HECardActions className="project-card__actions">
              {ruleWidget && (
                <Popover
                  content={'该项目为规则项目'}
                  placement="bottom"
                  style={{ fontSize: '12px' }}
                >
                  <p className="project-card__review__status__type">
                    <span>R</span>
                  </p>
                </Popover>
              )}
              {hover && !loading ? (
                <ProjectActionBar
                  isCard={true}
                  {...this.props}
                ></ProjectActionBar>
              ) : loading ? (
                <HELoadingString length={128} />
              ) : (
                title
              )}
            </HECardActions>
          ) : null}
        </HECard>
        {isFolder && <div className="project-card__shadow"></div>}
      </React.Fragment>
    );
  }
}
