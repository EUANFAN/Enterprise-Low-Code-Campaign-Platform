import React from 'react';
import { Route, withRouter } from 'react-router-dom';
import HENavBarGroup from 'components/HENavBarGroup';
import { ResourceSecondaryPages } from 'common/constants';
import ResourceDrawer from './components/ResourcesDrawer';
import TransitionSwitch from '../components/TransitionSwitch';
import { toastInfo } from 'components/HEToast';

import ResourceList from './ResourceList';

import './main.less';

// const TRANSITION_TIMEOUTS = { exit: 300 };

const PAGE_KEY_LINK_LOOKUP = {
  [ResourceSecondaryPages.OFFICIAL_IMAGE]: 'image',
  [ResourceSecondaryPages.OFFICIAL_AUDIO]: 'audio',
  [ResourceSecondaryPages.OFFICIAL_VIDEO]: 'video',
  [ResourceSecondaryPages.OFFICIAL_FILE]: 'file',
  [ResourceSecondaryPages.MY_IMAGE]: 'my/image',
  [ResourceSecondaryPages.MY_AUDIO]: 'my/audio',
  [ResourceSecondaryPages.MY_VIDEO]: 'my/video',
  [ResourceSecondaryPages.MY_FILE]: 'my/file',
};
const DEFAULT_PAGE = 'image';
const INVALID_PATH = /^\/resources\/?$/;

const ROOT_PATH_REGEX = /^\/resources\/((?:my\/)?(?:image|video|audio|file))/;

const getRootPage = (pathname) => {
  const match = ROOT_PATH_REGEX.exec(pathname);

  if (match) {
    const result = Object.keys(PAGE_KEY_LINK_LOOKUP).find(
      (pageKey) => PAGE_KEY_LINK_LOOKUP[pageKey] === match[1]
    );

    if (result) {
      return result;
    }
  }

  return DEFAULT_PAGE;
};

class Resources extends React.Component {
  componentDidMount() {
    this._redirectIfNeeded();
  }

  componentDidUpdate() {
    this._redirectIfNeeded();
  }

  // NOTE: 之所以不用 <Redirect> 是因为目前加上动效后会有 Warning
  // https://github.com/reactjs/react-transition-group/issues/296#issuecomment-379749322
  _redirectIfNeeded() {
    const { history, location } = this.props;

    if (INVALID_PATH.test(location.pathname)) {
      history.replace('/resources/my/image');
    }
  }

  _handlePageSelect = (key) => {
    const link = PAGE_KEY_LINK_LOOKUP[key];

    if (!link) {
      return;
    }
    // TODO：暂时关闭音频、视频、文件上传入口
    // if (key !== ResourceSecondaryPages.MY_IMAGE) {
    //   toastInfo('功能暂未开放！');
    //   return;
    // }
    const { history } = this.props;
    history.push(`/resources/${link}`);
  };

  render() {
    const { location, userInfo } = this.props;
    const selectedPage = getRootPage(this.props.location.pathname);

    return (
      <div className="h5-resources">
        <HENavBarGroup showDepartmentSelect={false} />
        <div className="h5-resources__content">
          <ResourceDrawer
            selected={selectedPage}
            onSelect={this._handlePageSelect}
          />
          <div className="h5-resources__content__scroller">
            <TransitionSwitch
              classNames="animation__fade"
              timeout={0}
              location={location}
              transitionKey={location.pathname}
            >
              <Route
                path="/resources/(my)?/(image|video|audio|file)/:groupId?"
                render={() => <ResourceList userInfo={userInfo} />}
              />
            </TransitionSwitch>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Resources);
