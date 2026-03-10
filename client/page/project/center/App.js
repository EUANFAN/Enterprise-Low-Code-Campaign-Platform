import 'globals';
import React from 'react';
import HENavBarGroup from 'components/HENavBarGroup';
import { Route, withRouter } from 'react-router-dom';
import ProjectDrawer from './ProjectDrawer';
import TransitionSwitch from '../../components/TransitionSwitch';
import ProjectList from './ProjectList';
import './main.less';
import { getProjects } from 'apis/ProjectAPI';
import QueryString from 'common/queryString';
import ProjectCollaborateModal from 'components/ProjectCollaborateModal';
import { validateRoleLimit } from 'common/utils';

const ROLE_ID_REGEX = /^\/projects\/([a-zA-Z0-9]+)\/?.*$/;
const FOLDER_ID_REGEX = /^\/projects\/my\/([a-zA-Z0-9]+)\/?.*$/;
const INVALID_PATH = /^\/projects\/?$/;

class Projects extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roles: [],
      list: [],
      folerList: [],
      roleId: 'my',
      folderId: '',
      showTypeCard: true,
      department: '',
      showCollaborateModal: false,
      targetProjectId: '',
    };
  }

  UNSAFE_componentWillMount() {
    let showTypeCard = god.localStorage.getItem('showTypeCard');
    this._redirectIfNeeded();
    let { department = '' } = QueryString.parse(location.search);
    const roleId = this._getRoleIdFromUrl();
    const folderId = this._getFolderIdFromUrl();
    const { userInfo } = this.props;
    if (!department) {
      if (validateRoleLimit('managerAllProject')) {
        department = userInfo.userDeptId;
      }
      if (validateRoleLimit('chooseBizUnit')) {
        department = '';
      }
    }
    this.setState({
      roleId: roleId,
      folderId: folderId,
      department: department,
      showTypeCard: showTypeCard && showTypeCard == 'table' ? false : true,
    });
    // 获取文件夹
    this._getFolderByRole(roleId);
  }

  componentDidUpdate() {
    this._redirectIfNeeded();
  }

  _redirectIfNeeded() {
    const { history, location } = this.props;
    if (INVALID_PATH.test(location.pathname)) {
      history.replace('/projects/my');
    }
  }
  // 右侧导航事件
  _handleRoleSelect = (itemId, department, folderId) => {
    const { history } = this.props;
    if (!department) {
      department = this.state.department;
    }
    if (department == 'all') department = '';
    let url = `/projects/${itemId}`;
    if (department) {
      url = `/projects/${itemId}?department=${department}`;
      if (folderId) {
        url = `/projects/my/${folderId}?department=${department}`;
      }
    } else {
      if (folderId) {
        url = `/projects/my/${folderId}`;
      }
    }
    history.push(url);
    this.setState({
      roleId: itemId,
      folderId: folderId,
      department: department,
    });
    // 获取自己所有的文件夹
    this._getFolderByRole();
  };

  _getRoleIdFromUrl() {
    const { location } = this.props;
    const match = ROLE_ID_REGEX.exec(location.pathname);
    return match ? match[1] : '';
  }

  _getFolderIdFromUrl() {
    const { location } = this.props;
    const match = FOLDER_ID_REGEX.exec(location.pathname);
    return match ? match[1] : '';
  }

  async _getFolderByRole() {
    // const roleId = this._getRoleIdFromUrl();
    // 每次只请求一层的数据
    const { list } = await getProjects({
      roleId: 'my',
      pageSize: Number.MAX_SAFE_INTEGER,
      filter: 'folder',
      department: this.state.department,
    });
    this.setState({
      folerList: list,
    });
  }

  _handleShowTypeChange() {
    god.localStorage.setItem(
      'showTypeCard',
      this.state.showTypeCard ? 'table' : 'list'
    );
    this.setState({ showTypeCard: !this.state.showTypeCard });
  }
  _handleCollaborateClose = () => {
    this.setState({
      showCollaborateModal: false,
    });
  };
  _handleCollaborate = (event, id) => {
    this.setState({
      targetProjectId: id,
      showCollaborateModal: true,
    });
  };
  render() {
    const { userInfo } = this.props;
    const {
      roles,
      list,
      folerList,
      roleId,
      folderId,
      department,
      showTypeCard,
      showCollaborateModal,
      targetProjectId,
    } = this.state;

    return (
    // 我的项目页
      <div className='projects'>
        {/* 顶部导航条*/}
        <HENavBarGroup showDepartmentSelect={true} onSelect={(departmentId) => this._handleRoleSelect('all', departmentId)} />
        <div className='projects__content'>
          {/* 左侧导航*/}
          <ProjectDrawer
            list={list}
            folerList={folerList}
            roles={roles}
            department={department}
            selectedId={roleId}
            folderId={folderId}
            onSelect={this._handleRoleSelect}
            userInfo={userInfo}
            collaborate={this._handleCollaborate.bind(this)}
            showTypeCard={showTypeCard}
          />
          {/* 中心展示区*/}
          <div className='projects__content__scroller'>
            <TransitionSwitch
              classNames="animation__fade"
              transitionKey={roleId}
              timeout={0}
            >
              <Route
                path="/projects/:roleId/:folderId*"
                render={() => (
                  <ProjectList
                    showTypeCard={showTypeCard}
                    _handleShowTypeChange={this._handleShowTypeChange.bind(
                      this
                    )}
                    {...userInfo}
                    showCollaborateModal={showCollaborateModal}
                    collaborate={this._handleCollaborate.bind(this)}
                    rolesList={roles}
                  />
                )}
              />
            </TransitionSwitch>
          </div>
          {showCollaborateModal && (
            <ProjectCollaborateModal
              projectId={targetProjectId}
              roleId={roleId}
              onClose={this._handleCollaborateClose}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(Projects);
