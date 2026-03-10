import React from 'react';
import { observer } from 'mobx-react';
import PageView from '../../page/project/preview/Page';
import './HEProjectPosterImage.less';
import { PAGE_WIDTH, PAGE_HEIGHT } from 'common/constants';
import { getBackgroundImageAttribute, useDataValue } from 'utils/ModelUtils';
/*
    TODO 旧 codebase 里直接把尺寸放到 window 下使用，造成现在无法简单修正问题。
    现在先以全局 375 * 603 为准，
    HEProjectPosterImage 自己进行缩放。
    未来对 window 解耦合后再拿掉
 */

// TODO: REMOVE THIS!!!
god.stageSize = {
  width: PAGE_WIDTH,
  height: PAGE_HEIGHT,
};
@observer
class HEProjectPosterImage extends React.Component {
  static defaultProps = {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    customStore: true,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { projectData, width, height, customStore, project, page } =
      this.props;
    let scaleStyle = {
      width: 375,
      height: 603,
      transform: `scale(${width / god.stageSize.width}, ${
        height / god.stageSize.height
      })`,
    };
    let pageView;
    // customStore=true 个人中心 customStore=false 编辑区域缩略图
    if (customStore) {
      pageView = projectData[0] !== 'undefined' && (
        <img src={projectData[0]} style={{ width: '100%' }}></img>
      );
    } else {
      let backgroundColor = useDataValue(
        project.backgroundColor,
        project.pages[0].variableStore,
        project.pages[0],
        project
      );
      backgroundColor === 'undefined' && (backgroundColor = '#fff');
      scaleStyle['backgroundColor'] = backgroundColor;
      Object.assign(scaleStyle, getBackgroundImageAttribute(project, project));
      pageView = (
        <PageView container={page} widgets={page.widgets} project={project} />
      );
    }
    return (
      <div
        className="he-project-poster-image production-state"
        style={scaleStyle}
      >
        {pageView}
        <div className="he-project-poster-image-masker"></div>
      </div>
    );
  }
}
export default HEProjectPosterImage;
