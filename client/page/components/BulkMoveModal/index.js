import React from 'react';
import { TreeSelect } from 'antd';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import { toastError } from 'components/HEToast';
import HESkyLayer from 'components/HESkyLayer';
import { connectToast } from 'context/feedback';
import { noop } from 'utils/FunctionUtils';
import { getGroupsFolders } from 'apis/ResourceAPI';

import './index.less';

const resourceTypeMap = {
  image: '图片',
  audio: '音频',
  video: '视频',
  file: '文件',
};

class BulkMoveModal extends React.Component {
  static defaultProps = {
    onSubmit: noop,
    onClose: noop,
  };

  constructor(props) {
    super(props);

    this.state = {
      groups: [
        {
          id: 'my',
          pId: null,
          value: 'my',
          title: `我的${resourceTypeMap[props.type] || ''}`,
        },
      ],
      currentGroupId: 'my',
    };
  }

  componentDidMount() {}

  _fetchGroups = async (groupId = '', type) => {
    let groups = [];
    try {
      const result = (await getGroupsFolders(groupId, type)) || [];
      groups = result.map((v) => ({
        id: v._id,
        pId: groupId,
        value: v._id,
        title: v.name,
        isLeaf: !v.isFolder,
      }));
    } catch (err) {
      toastError(err.message);
    }
    return groups;
  };

  onLoadData = async (treeNode) => {
    const { type } = this.props;
    const { id } = treeNode.props;
    const groupsFolders = await this._fetchGroups(id, type);
    let groups = [];
    if (groupsFolders[0]) {
      groups = this.state.groups.concat(groupsFolders);
    } else {
      groups = this.state.groups.map((v) => {
        if (v.id === id) v.isLeaf = true;
        return v;
      });
    }
    this.setState({ groups });
  };

  onChange = (value) => {
    this.setState((prevState) => {
      if (prevState.currentGroupId === value) {
        return null;
      }
      return {
        currentGroupId: value,
      };
    });
  };

  _handleSubmit = (event) => {
    const { onSubmit } = this.props;
    const { currentGroupId, groups } = this.state;
    try {
      // this._validateInputs();
      onSubmit(event, currentGroupId, groups);
    } catch (err) {
      toastError(err.message);
    }
  };

  render() {
    const { onClose } = this.props;
    const { groups, currentGroupId } = this.state;

    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="bulk-move-modal">
          <HEModalHeader title={'资源移动'} onClose={onClose} />
          <HEModalContent className="bulk-move-modal__content">
            {/* <p className='bulk-move-modal__content__desc'>{'请选择移动到的群组或文件夹'}</p> */}
            <TreeSelect
              className="bulk-move-modal__content__tree_select"
              treeDataSimpleMode
              treeData={groups}
              value={currentGroupId}
              placeholder="请选择文件夹"
              dropdownStyle={{
                maxHeight: 400,
                overflow: 'auto',
                zIndex: 20000,
              }}
              onChange={this.onChange}
              loadData={this.onLoadData}
            />
          </HEModalContent>
          <HEModalActions>
            <HEButton onClick={this._handleSubmit}>{'移动'}</HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default connectToast(BulkMoveModal);
