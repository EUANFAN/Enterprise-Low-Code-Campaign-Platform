import React from 'react';

import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import HEInput from 'components/HEInput';
import { toastError, toastSuccess } from 'components/HEToast';
import HESkyLayer from 'components/HESkyLayer';
import { noop } from 'utils/FunctionUtils';
import './index.less';
import { Popover } from 'antd';
import { getUserInfo } from 'apis/UserAPI';
import { getProjects } from 'apis/ProjectAPI';
import { flatten } from 'lodash';
import {
  getProjectPartner,
  addPartnersToProject,
  removePartnerInProject,
} from 'apis/RoleAPI';
import { validateRoleLimit } from 'common/utils';

export default class ProjectCollaborateModal extends React.Component {
  static defaultProps = {
    onClose: noop,
  };

  constructor(props) {
    super(props);
    this.state = {
      projectData: {},
      newPartnerId: '',
      userInfoList: [],
      newPartnerInfoList: [],
      deleteTargetUserId: '',
      removeText: '移除',
      confimInvitePopover: false,
    };
  }

  async renderProjectsUserInfoList() {
    const { projectData } = this.state;
    const { ownerId, _id: projectId } = projectData;
    const result = await getProjectPartner(projectId);
    if (result.stat == 1) {
      const partner = result.partner
        ? result.partner.filter((userId) => userId !== ownerId)
        : [];
      Promise.all(
        [[ownerId], partner].map(async (users) => {
          if (!users.length) return [];
          return this.getUserInfoList(users);
        })
      ).then((res) => {
        this.setState({
          userInfoList: flatten(res),
        });
      });
    }
  }

  async getUserInfoList(userIds) {
    return await getUserInfo(userIds);
  }

  getUserId() {
    const { userId } = god.PageData.userInfo;
    return userId;
  }

  async componentDidMount() {
    const { projectId, roleId } = this.props;
    const result = await getProjects({
      roleId: roleId || 'my',
      search: projectId,
    });

    if (result && result.total == 1) {
      this.setState(
        {
          projectData: result.list[0],
        },
        () => {
          this.renderProjectsUserInfoList();
        }
      );
    }
  }

  async addUndeterminedPartnerToList() {
    const { newPartnerId, userInfoList, newPartnerInfoList } = this.state;
    const newPartnerInfo = await this.getUserInfoList([newPartnerId]);
    if (!newPartnerInfo.length) {
      toastError(
        '用户不存在。请填写目标用户邮箱前缀，且该用户登录过此平台。',
        3000
      );
      return;
    }
    const inCurrentList = userInfoList.find((user) => {
      return user.userId === newPartnerId;
    });
    const inCurrentUndeterminedList = newPartnerInfoList.find((user) => {
      return user.userId === newPartnerId;
    });
    if (inCurrentUndeterminedList) {
      toastError('当前用户已在待添加协同列表');
      return;
    }
    if (inCurrentList) {
      toastError('当前用户已在协同列表');
      return;
    }
    this.setState({
      newPartnerInfoList: newPartnerInfoList.concat(newPartnerInfo),
      newPartnerId: '',
      deleteTargetUserId: '',
    });
  }

  async addProjectCollaborator() {
    const { newPartnerInfoList, projectData } = this.state;
    const { _id: projectId } = projectData;
    if (!Array.isArray(newPartnerInfoList) || !newPartnerInfoList.length) {
      toastError('请输入用户邮箱前缀');
      return;
    }
    const newPartnerIdList = newPartnerInfoList.map((user) => user.userId);
    try {
      const data = await addPartnersToProject(newPartnerIdList, projectId);
      if (data.stat == 1) {
        toastSuccess('邀请成功');
        this.props.onClose();
      } else {
        toastError(data.msg);
      }
    } catch (error) {
      toastError(error.message);
    }
  }

  inputNewPartner(event) {
    const newPartnerId = event.target.value;
    this.setState({
      newPartnerId,
    });
  }

  async removeProjectCollaborator() {
    const { projectData, newPartnerInfoList, deleteTargetUserId } = this.state;
    const { _id: projectId } = projectData;
    const inNewPartnerInfoList = newPartnerInfoList.find((user) => {
      return user.userId === deleteTargetUserId;
    });
    if (inNewPartnerInfoList) {
      this.setState({
        newPartnerInfoList: newPartnerInfoList.filter((user) => {
          return user.userId !== deleteTargetUserId;
        }),
      });
      toastSuccess('移除成功');
      return;
    }
    const result = await removePartnerInProject(deleteTargetUserId, projectId);
    if (result.stat == 1) {
      toastSuccess('移除成功');
      this.renderProjectsUserInfoList();
    }
  }

  getMemberList = (userInfoList) => {
    const { deleteTargetUserId, projectData } = this.state;
    const { ownerId } = projectData;

    const currentUserId = this.getUserId();
    const isOwner = currentUserId == ownerId;
    const content = (isCurrentUser) => (
      <div className="project-collaborate-modal__popover">
        <div className="project-collaborate-modal__popover__title">
          {isCurrentUser
            ? '退出后将无法看到该项目'
            : '移除用户后该用户编辑的项目内容不会改变'}
        </div>

        <div className="project-collaborate-modal__popover__button">
          <HEButton
            outline={true}
            className="project-collaborate-modal__popover__button__cancel"
            onClick={() => {
              this.setState({ deleteTargetUserId: '' });
            }}
          >
            {'取消'}
          </HEButton>
          <HEButton onClick={this.removeProjectCollaborator.bind(this)}>
            {'确定'}
          </HEButton>
        </div>
      </div>
    );
    return (
      <div className="project-collaborate-modal__content-list">
        {userInfoList.map((user) => {
          const departmentArr =
            (user.department && user.department.split('-')) || [];
          const department = [
            departmentArr[1],
            ...departmentArr.splice(-2),
          ].join('-');
          const isCurrentUser = user.userId == currentUserId;
          return (
            <div
              className="project-collaborate-modal__content-list__item"
              key={user.id}
            >
              <div className="project-collaborate-modal__content-list__item__id">
                {user.userId}
              </div>
              <div className="project-collaborate-modal__content-list__item__department">
                {department || '--'}
              </div>
              {
                <div className="project-collaborate-modal__content-list__item__btn">
                  {user.userId !== ownerId
                    ? (validateRoleLimit('inviteUserManagerProject') ||
                        isOwner ||
                        isCurrentUser) && (
                        <Popover
                          visible={deleteTargetUserId == user.userId}
                          placement="topLeft"
                          content={content(isCurrentUser)}
                          trigger="click"
                        >
                          <span
                            onClick={() => {
                              this.setState({
                                deleteTargetUserId: user.userId,
                              });
                            }}
                          >
                            {isCurrentUser ? '退出' : '移除'}
                          </span>
                        </Popover>
                      )
                    : '拥有者'}
                </div>
              }
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    const { onClose } = this.props;
    const {
      userInfoList,
      newPartnerId,
      newPartnerInfoList,
      confimInvitePopover,
    } = this.state;
    const content = (
      <div className="project-collaborate-modal__popover">
        <div className="project-collaborate-modal__popover__title">
          {`您确定要邀请当前列表的${newPartnerInfoList.length}人协同该项目么？`}
        </div>
        <div className="project-collaborate-modal__popover__button">
          <HEButton
            outline={true}
            className="project-collaborate-modal__popover__button__cancel"
            onClick={() => {
              this.setState({ confimInvitePopover: false });
            }}
          >
            {'取消'}
          </HEButton>
          <HEButton onClick={this.addProjectCollaborator.bind(this)}>
            {'确定'}
          </HEButton>
        </div>
      </div>
    );
    return (
      <React.Fragment>
        <HESkyLayer onOverlayClick={onClose}>
          <HEModal className="project-collaborate-modal">
            <HEModalHeader title={'协同列表'} onClose={onClose} />
            <HEModalContent className="project-collaborate-modal__content">
              <div className="project-collaborate-modal__content__header">
                <div className="project-collaborate-modal__content__header__label">
                  请选择协同用户：
                </div>
                <HEInput
                  value={newPartnerId}
                  className="project-collaborate-modal__content__header__input"
                  type="text"
                  placeholder="请输入用户邮箱前缀"
                  onChange={this.inputNewPartner.bind(this)}
                />
                <HEButton
                  className="project-collaborate-modal__content__header__btn"
                  outline={true}
                  sizeType={2}
                  onClick={this.addUndeterminedPartnerToList.bind(this)}
                >
                  {'添加'}
                </HEButton>
              </div>
              <div className="project-collaborate-modal__content__body">
                {Boolean(newPartnerInfoList.length) && (
                  <React.Fragment>
                    <div className="project-collaborate-modal__partner-list">
                      <div className="project-collaborate-modal__partner-num">
                        待邀人数{newPartnerInfoList.length}人
                      </div>
                      {this.getMemberList(newPartnerInfoList)}
                    </div>
                    <div className="project-collaborate-modal__partner-hr"></div>
                  </React.Fragment>
                )}
                <div className="project-collaborate-modal__partner-list">
                  <div className="project-collaborate-modal__partner-num">
                    正在协同人数{userInfoList.length}人
                  </div>
                  {Boolean(userInfoList.length) && (
                    <div>{this.getMemberList(userInfoList)}</div>
                  )}
                </div>
              </div>
            </HEModalContent>
            <HEModalActions>
              <React.Fragment>
                <HEButton
                  className="project-collaborate-modal__content__cancel-btn project-collaborate-modal__content__btn"
                  outline={true}
                  onClick={onClose}
                >
                  {'取消'}
                </HEButton>
                {newPartnerInfoList.length !== 0 ? (
                  <Popover
                    placement="topLeft"
                    content={content}
                    trigger="click"
                    visible={confimInvitePopover}
                  >
                    <HEButton
                      className="project-collaborate-modal__content__btn"
                      onClick={() => {
                        this.setState({ confimInvitePopover: true });
                      }}
                    >
                      {'确认邀请'}
                    </HEButton>
                  </Popover>
                ) : (
                  <HEButton
                    className="project-collaborate-modal__content__btn"
                    disabled={true}
                  >
                    {'确认邀请'}
                  </HEButton>
                )}
              </React.Fragment>
            </HEModalActions>
          </HEModal>
        </HESkyLayer>
      </React.Fragment>
    );
  }
}
