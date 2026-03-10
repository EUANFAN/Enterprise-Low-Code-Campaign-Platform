import React from 'react';
import { HEDrawer, HEDrawerSectionItem } from 'components/HEDrawer';
import FolderActionBar from './folderActionBar';
import HEIcon from 'components/HEIcon';
import QueryString from 'common/queryString';
import CreateFolderModal from 'components/CreateFolderModal';
import { renameProject } from 'apis/ProjectAPI';
import confirm from 'components/HEConfirm/confirm';
import { toastSuccess, toastError } from 'components/HEToast';
import { validateRoleLimit } from 'common/utils';
import { deleteProjects } from 'apis/ProjectAPI';

const TOAST_TIMEOUT = 3000;

class ProjectDrawer extends React.PureComponent {
  _allProject = React.createRef();

  state = {
    list: [],
    keyword: '',
    roles: [],
    departmentName: '',
    departmentList: god.PageData.deptList,
    renameFolder: false,
    activeFolderId: null,
  };

  _getDepartmentName(department) {
    const { departmentList } = this.state;
    let departmentName = '';
    departmentList.forEach((item) => {
      const { _id, name } = item;
      if (_id == department) {
        departmentName = `${name}的项目`;
      }
    });
    return departmentName ? departmentName : '所有事业部的项目';
  }

  _getDepartmentFromUrl() {
    let { department = '' } = QueryString.parse(location.search);
    return department;
  }
  // 选择群组
  _handleRoleSeleted(roleKeyOrId) {
    this.props.onSelect(roleKeyOrId);
  }
  // 选择文件夹
  _handleFolderSeleted(folder) {
    let department = this._getDepartmentFromUrl();
    this.props.onSelect(null, department, folder._id);
  }

  _handShowRenameFolderDialog(folderId) {
    this.setState({
      renameFolder: !this.state.renameFolder,
      activeFolderId: folderId,
    });
  }

  async _handRenameFolderSubmit(event, folderName) {
    try {
      await renameProject(this.state.activeFolderId, folderName, 'projects');
      toastSuccess('修改成功', TOAST_TIMEOUT);
      this._allProject.current._handleClick();
    } catch (err) {
      return toastError(err.message, TOAST_TIMEOUT);
    }
    this.setState({
      activeFolderId: null,
      renameFolder: false,
    });
  }

  _handleDeleteFolder = async (folderId) => {
    let { roleId } = this.props;
    try {
      await confirm('确定删除吗？', '确认');
    } catch (err) {
      /* 用户取消 */ return;
    }
    try {
      await deleteProjects(roleId, [], [folderId], {});
      toastSuccess('删除成功', TOAST_TIMEOUT);
      this._allProject.current._handleClick();
    } catch (err) {
      toastError(err.message, TOAST_TIMEOUT);
    }
  };

  render() {
    const { selectedId, roleId, folerList, folderId, department } = this.props;
    return (
      <HEDrawer className="projects__content__drawer">
        {validateRoleLimit('managerAllProject') && (
          <HEDrawerSectionItem
            className="folder-section-item"
            itemKey="all"
            onSelect={this._handleRoleSeleted.bind(this)}
            selected={selectedId === 'all' && !folderId}
          >
            {
              <HEIcon
                className="icon icon-card"
                type="icon-24gl-drawer"
              ></HEIcon>
            }
            {/* TODO：修改文案：默认展示「所有项目」 */}
            {'所有项目' || this._getDepartmentName(department)}
          </HEDrawerSectionItem>
        )}
        <HEDrawerSectionItem
          className="folder-section-item"
          itemKey="my"
          onSelect={this._handleRoleSeleted.bind(this)}
          selected={selectedId === 'my' && !folderId}
          ref={this._allProject}
        >
          {<HEIcon className="icon icon-card" type="icon-24gl-drawer"></HEIcon>}
          {'全部项目'}
        </HEDrawerSectionItem>
        <HEDrawerSectionItem
          itemKey="join"
          className="folder-section-item"
          onSelect={this._handleRoleSeleted.bind(this)}
          selected={selectedId === 'join'}
        >
          {<HEIcon className="icon icon-card" type="icon-24gl-drawer"></HEIcon>}
          {'协同项目'}
        </HEDrawerSectionItem>
        {validateRoleLimit('createRuleProject') && (
          <HEDrawerSectionItem
            itemKey="rule"
            className="folder-section-item"
            onSelect={this._handleRoleSeleted.bind(this)}
            selected={selectedId === 'rule'}
          >
            {
              <HEIcon
                className="icon icon-card"
                type="icon-24gl-drawer"
              ></HEIcon>
            }
            {'规则项目'}
          </HEDrawerSectionItem>
        )}
        <hr className="hr-item"></hr>
        <div className="folders">
          {folerList.map((folder) => (
            <HEDrawerSectionItem
              className="folder-section-item"
              itemKey={folder._id}
              key={folder._id}
              onSelect={this._handleFolderSeleted.bind(this, folder)}
              selected={folderId === folder._id}
            >
              {<HEIcon className="icon icon-card" type="icon-folder1"></HEIcon>}
              {folder.name}
              {
                <FolderActionBar
                  _handShowRenameFolderDialog={() => {
                    this._handShowRenameFolderDialog(folder._id);
                  }}
                  _handleDeleteFolder={() => {
                    this._handleDeleteFolder(folder._id);
                  }}
                  _handleCollaborate={this.props.collaborate.bind(
                    this,
                    null,
                    folder._id
                  )}
                  roleId={roleId}
                  folderId={folder._id}
                ></FolderActionBar>
              }
            </HEDrawerSectionItem>
          ))}
        </div>
        <hr className="hr-item"></hr>
        {validateRoleLimit('lookBinProject') && (
          <HEDrawerSectionItem
            itemKey="bin"
            className="folder-section-item"
            onSelect={this._handleRoleSeleted.bind(this)}
            selected={selectedId === 'bin' && !folderId}
          >
            {<HEIcon className="icon icon-card" type="icon-lajitong"></HEIcon>}
            {'回收站'}
          </HEDrawerSectionItem>
        )}
        {this.state.renameFolder && (
          <CreateFolderModal
            onClose={this._handShowRenameFolderDialog.bind(this)}
            onSubmit={this._handRenameFolderSubmit.bind(this)}
            title={'重命名文件夹'}
          ></CreateFolderModal>
        )}
      </HEDrawer>
    );
  }
}
export default ProjectDrawer;
