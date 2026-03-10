import React from 'react';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions
} from 'components/HEModal';

import HEButton from 'components/HEButton';
import HEInput from 'components/HEInput';
import HESkyLayer from 'components/HESkyLayer';
import { toastError } from 'components/HEToast';
import HEProjectTag from 'components/HEProjectTag';

import { connectToast } from 'context/feedback';
import { noop } from 'utils/FunctionUtils';
import { getProjects } from 'apis/ProjectAPI';
import { DatePicker } from 'antd';
import Moment from 'moment';
import './index.less';

function Row(props) {
  return (
    <div className="create-project-modal__content__row">{props.children}</div>
  );
}

function Label(props) {
  return (
    <label className="create-project-modal__content__row__label">
      {props.children}
    </label>
  );
}

class CreateProjectModal extends React.Component {
  static defaultProps = {
    onClickAway: noop
  };

  state = {
    currentFolderId: '',
    currentRoleId: 'my',
    currentName: '',
    currentPageCount: 1,
    folders: null,
    currentLayoutType: 'normal',
    runingStartTime: Date.now(),
    runingEndTime: Moment('2099-01-01 08:00:00'),
    endOpen: false,
    tags: []
  };

  componentDidMount() {
    this._updateFolders();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentRoleId !== this.state.currentRoleId) {
      this._updateFolders();
    }
  }

  _updateFolders = async () => {
    const { currentRoleId } = this.state;
    let list;

    try {
      const result = await getProjects({
        roleId: currentRoleId,
        pageSize: Number.MAX_SAFE_INTEGER,
        filter: 'folder'
      });

      list = result.list;
    } catch (err) {
      toastError(err.message);
      return;
    }

    const folders = list.map((group) => ({
      key: group.name + '（' + '子文件夹' + '）',
      value: group._id
    }));

    this.setState({
      folders: [{ key: '群组根目录', value: '' }, ...folders]
    });
  };

  _handleGroupSelect = (event, groupKey) => {
    this.setState({ currentFolderId: groupKey });
  };

  _handleRoleSelect = (event, roleKey) => {
    this.setState((prevState) => {
      if (prevState.currentRoleId === roleKey) {
        return null;
      }

      return {
        currentRoleId: roleKey,
        folders: null,
        currentFolderId: null
      };
    });
  };

  _handleNameChange = (event) => {
    const newTarget = event.target.value;
    this.setState({ currentName: newTarget });
  };

  _handlePageCountChange = (event) => {
    const newTarget = event.target.value;
    this.setState({ currentPageCount: parseInt(newTarget, 10) });
  };

  _handleSubmit = (event) => {
    const {
      currentRoleId: roleId,
      currentFolderId: folderId,
      currentName: name,
      currentPageCount: pageCount,
      currentLayoutType: layoutType,
      runingStartTime,
      runingEndTime,
      tags
    } = this.state;
    const { componentPlat } = this.props;
    this.props.onSubmit(event, {
      name,
      pageCount,
      layoutType,
      roleId,
      folderId,
      runingStartTime,
      runingEndTime,
      componentPlat,
      tags
    });
  };

  _handleLayoutTypeSelect = (event, selectValue) => {
    this.setState({ currentLayoutType: selectValue });
  };

  disabledStartDate = (runingStartTime) => {
    const { runingEndTime } = this.state;
    if (!runingStartTime || !runingEndTime) {
      return false;
    }
    const now = new Date().getTime();
    return (
      runingStartTime.valueOf() > runingEndTime.valueOf() ||
      runingStartTime.valueOf() < now
    );
  };

  disabledEndDate = (runingEndTime) => {
    const { runingStartTime } = this.state;
    if (!runingEndTime || !runingStartTime) {
      return false;
    }
    const now = new Date().getTime();
    return (
      runingEndTime.valueOf() <= runingStartTime.valueOf() ||
      runingEndTime.valueOf() < now
    );
  };
  onStartChange = (value) => {
    this.setState({ runingStartTime: value });
  };

  onEndChange = (value) => {
    this.setState({ runingEndTime: value });
  };
  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  };

  _handleTagsChange(selectValue) {
    this.setState({ tags: selectValue });
  }

  render() {
    const { onClose } = this.props;
    const { currentName, runingStartTime, runingEndTime, endOpen, tags } =
      this.state;

    return (
      <HESkyLayer onOverlayClick={onClose} className="create-project-skylayer">
        <HEModal className="create-project-modal">
          <HEModalHeader title={'创建模板项目'} onClose={onClose} />
          <HEModalContent className="create-project-modal__content">
            <Row>
              <Label>{'项目名称'}：</Label>
              <HEInput
                value={currentName}
                onChange={this._handleNameChange}
                className="create-project-modal__content__row__input"
                type="text"
                maximumLetters={20}
                placeholder={'请输入本项目的名称，方便查找'}
              />
            </Row>
            <Row>
              <Label>{'上线时间'}：</Label>
              <DatePicker
                showTime
                disabledDate={this.disabledStartDate}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={'选择上线时间'}
                onChange={this.onStartChange}
                onOpenChange={this.handleStartOpenChange}
                value={Moment(runingStartTime)}
              />
            </Row>
            <Row>
              <Label>{'下线时间'}：</Label>
              <DatePicker
                showTime
                disabledDate={this.disabledEndDate}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={'选择下线时间'}
                onChange={this.onEndChange}
                open={endOpen}
                onOpenChange={this.handleEndOpenChange}
                value={Moment(runingEndTime)}
              />
            </Row>
            <Row>
              <Label>{'项目用途'}：</Label>
              <HEProjectTag
                value={tags}
                onSelect={this._handleTagsChange.bind(this)}
              />
            </Row>
          </HEModalContent>
          <HEModalActions>
            <HEButton onClick={this._handleSubmit}>{'确定'}</HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default connectToast(CreateProjectModal);
