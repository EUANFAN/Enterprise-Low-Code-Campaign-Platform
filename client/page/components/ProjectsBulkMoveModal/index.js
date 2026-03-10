import React from 'react';
import { Tree } from 'antd';
import keyBy from 'lodash/keyBy';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import HESkyLayer from 'components/HESkyLayer';

import { connectToast } from 'context/feedback';
import { noop } from 'utils/FunctionUtils';
import { getProjects } from 'apis/ProjectAPI';
import { toastError } from 'components/HEToast';
import './index.less';
import { observer } from 'mobx-react';

const { TreeNode } = Tree;
@observer
class ProjectsBulkMoveModal extends React.Component {
  static defaultProps = {
    onSubmit: noop,
    onClose: noop,
    roles: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      currentRole: '',
      currentFolderId: null,
      resourceArray: [
        { _id: 'my', name: '我的' },
        { _id: 'join', name: '协同' },
      ],
    };
  }

  _fetchFolders = async (targetFolderId) => {
    const { currentRole, resourceArray } = this.state;
    // 每次只请求一层的数据
    const { list } = await getProjects({
      roleId: currentRole, // 区分我的和协同
      path: targetFolderId || '',
      pageSize: Number.MAX_SAFE_INTEGER,
      filter: 'folder',
    });

    let tempArray = resourceArray.slice();
    const target = this._getTargetFolderInfoById(
      tempArray,
      targetFolderId || currentRole
    );
    target.folders = list || [];
    this.setState({
      resourceArray: tempArray,
    });
  };

  _getTargetFolderInfoById(items, targetId) {
    let target = null;
    function find(ary) {
      return ary.some((item) => {
        if (item._id === targetId) {
          target = item;
          return true;
        }

        if (toString.call(item.folders) !== '[object Array]') {
          return false;
        }

        return find(item.folders);
      });
    }

    find(items);
    return target;
  }

  _handleSubmit = (event) => {
    const { onSubmit } = this.props;
    const { currentFolderId } = this.state;
    let targetFolderId = currentFolderId;
    if (/^(join)$/.test(currentFolderId)) {
      toastError('请选择具体文件夹');
      return;
    } else if (/^(my)$/.test(currentFolderId)) {
      targetFolderId = null;
    }
    onSubmit(event, targetFolderId);
  };

  _handleTreeSelect = (selectedKeys) => {
    const selectedTreeKey = selectedKeys[0];
    if (/^(my|join)$/.test(selectedTreeKey)) {
      this.setState(
        {
          currentRole: selectedTreeKey,
        },
        () => {
          this._fetchFolders();
        }
      );
    } else {
      this._fetchFolders(selectedTreeKey);
    }
    this.setState({
      currentFolderId: selectedTreeKey,
    });
  };

  _getRoleTree = (roles) => {
    if (toString.call(roles) !== '[object Array]') return;
    return roles.map((role) => {
      let children = null;
      if (role.folders) {
        children = this._getRoleTree(role.folders);
      }
      const title = <p>{role.name}</p>;
      return (
        <TreeNode key={role._id} title={title}>
          {children}
        </TreeNode>
      );
    });
  };

  _getResourceMapFromArray(tempArray = []) {
    const tempObject = {};

    function recursionProcess(items) {
      Object.assign(tempObject, keyBy(items, '_id'));
      items.forEach((item) => {
        if (item.folders && item.folders.length) {
          recursionProcess(item.folders);
        }
      });
    }

    recursionProcess(tempArray);
    return tempObject;
  }

  _getAncestorKeys() {
    const { resourceArray, currentFolderId, currentRole } = this.state;
    const ancestors = [];
    const targetId = currentFolderId || currentRole;
    if (!targetId) return undefined;

    const resourceMap = this._getResourceMapFromArray(resourceArray);
    function process(id) {
      const item = resourceMap[id];
      if (!item) {
        console.error('未找到对应的ID' + ': ', item);
        return;
      }
      ancestors.push(id);
      if (item.isFolder) {
        if (item.parentId) {
          return process(item.parentId);
        } else {
          ancestors.push(currentRole);
        }
      }
    }
    process(targetId);
    return ancestors;
  }

  render() {
    const { onClose } = this.props;

    const { resourceArray } = this.state;

    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="project-bulk-move-modal">
          <HEModalHeader title={'批量移动'} onClose={onClose} />
          <HEModalContent className="project-bulk-move-modal__content">
            <p className="project-bulk-move-modal__content__desc">
              {'请选择移动到的文件夹'}
            </p>
            <Tree
              onSelect={this._handleTreeSelect}
              expandedKeys={this._getAncestorKeys()}
            >
              {this._getRoleTree(resourceArray)}
            </Tree>
          </HEModalContent>
          <HEModalActions>
            <HEButton onClick={this._handleSubmit}>{'移动'}</HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default connectToast(ProjectsBulkMoveModal);
