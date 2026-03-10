import React from 'react';
import classNames from 'classnames';

import HEProjectPosterImage from './HEProjectPosterImage';
import HELoadingString from 'components/HELoadingString';
import HEFrame from 'components/HEFrame';
import { noop } from 'utils/FunctionUtils';
import './index.less';

function themeDataToProjectData(theme) {
  return { pages: [theme] };
}

export default class HEProjectPoster extends React.Component {
  static defaultProps = {
    className: '',
    onProjectClick: noop,
  };
  _handleClick = (event) => {
    const { projectId, onClick } = this.props;
    onClick(event, projectId);
  };

  render() {
    const {
      className: classNameFromProp,
      title,
      projectData,
      themeData,
      loading,
      width,
      height,
      showPoster,
    } = this.props;
    const className = classNames(['he-project-poster', classNameFromProp], {
      'he-project-poster--loading': loading,
    });
    const project = showPoster
      ? [themeData]
      : projectData || themeDataToProjectData(themeData);
    return (
      <div className={className} onClick={this._handleClick}>
        <HEFrame className="he-project-poster__poster">
          {!loading && (themeData || projectData) && (
            <HEProjectPosterImage
              projectData={project}
              width={width}
              height={height}
            />
          )}
        </HEFrame>
        <div className="he-project-poster__title">
          {loading ? <HELoadingString /> : <p>{title}</p>}
        </div>
      </div>
    );
  }
}
