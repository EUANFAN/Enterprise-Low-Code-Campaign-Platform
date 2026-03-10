import React from 'react';
import HEIconButton from 'components/HEIconButton';
import { Tooltip } from 'antd';
import Preview from 'components/icons/Preview';
import { toastError, toastLoading, toastSuccess } from 'components/HEToast';
import ProjectPreviewModal from 'components/HEProjectPreview';
import LocalStorage from 'common/localStorage';
import history from 'store/history';
import { updateProject } from 'apis/ProjectAPI';
import Hotkeys from 'react-hot-keys';

export default class PreviewBtn extends React.Component {
  state = {
    previewing: false,
    commandDown: false,
    previewCompleted: false,
    url: '',
  };

  _saveProjectOrTheme = async () => {
    const { store } = this.props;
    const project = store.getProject();
    const targetId = project._id;
    await updateProject(targetId, project);
    history.record();
    LocalStorage.removeItem(targetId);
  };

  _handlePreview = async () => {
    const { previewing, commandDown } = this.state;
    if (previewing) {
      return;
    }
    try {
      toastLoading('正在准备预览...');
      await this._saveProjectOrTheme();
      toastSuccess('准备完成');
    } catch (err) {
      toastError('预览失败');
      this.setState({ previewing: false });
      return;
    }
    if (commandDown) {
      const { url } = this.state;
      // 此处延迟为了用户体验而已
      setTimeout(() => {
        god.open(url);
      }, 1000);
    } else {
      this.setState({ previewing: true });
      this.setState(() => ({ previewCompleted: true }));
    }
  };

  _handlePreviewClose = () => {
    if (!this.state.previewing) {
      return;
    }
    this.setState(() => ({
      previewing: false,
      previewCompleted: false,
    }));
  };
  // Command键或者Control是否被按下
  _handleCommandStatus = (event, status) => {
    if (event.key === 'Meta' || event.key === 'Control') {
      this.setState(() => ({
        commandDown: status,
      }));
    }
  };
  componentDidMount() {
    const { store } = this.props;
    const project = store.getProject();
    const isTheme = project.editorType === 'theme';
    let url = `${location.origin}/project/preview?id=${project._id}&isTheme=${isTheme}`;
    if (project.ruleId) {
      // 规则模板
      url = `${url}&ruleId=${project.ruleId}&type=gray`;
    }
    this.setState({
      url: url,
    });
  }

  render() {
    const { previewing, previewCompleted } = this.state;
    const { store } = this.props;
    const project = store.getProject();
    const { url } = this.state;
    return (
      <React.Fragment>
        <Tooltip
          placement={'bottom'}
          title={'按住command，点击预览另开tab页查看预览效果'}
        >
          <HEIconButton
            className="editor-navbar__actions__icon-button"
            iconElement={<Preview />}
            titleElement={'预览'}
            disabled={previewing}
            onClick={this._handlePreview}
          />
        </Tooltip>
        <Hotkeys
          keyName="*"
          onKeyUp={(key, event) => this._handleCommandStatus(event, false)}
          onKeyDown={(key, event) => this._handleCommandStatus(event, true)}
        />
        {previewCompleted && (
          <ProjectPreviewModal
            id={project._id}
            url={url}
            project={project}
            onClose={this._handlePreviewClose}
          />
        )}
      </React.Fragment>
    );
  }
}
