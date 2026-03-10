import React from 'react';
import HEIconButton from 'components/HEIconButton';
import Template from 'components/icons/Template';
import ProjectSetTemplateModal from 'components/ProjectSetTemplateModal';
import { toastError, toastSuccess } from 'components/HEToast';
import { createThemeInGroup } from 'apis/ThemeAPI';
import { validateRoleLimit } from 'common/utils';
export default class SetTemplate extends React.Component {
  state = {
    showTemplateModal: false,
  };

  _handleSetTemplate(stat) {
    this.setState({
      showTemplateModal: stat,
    });
  }

  _handleProjectToTemplate = async (
    groupId,
    category,
    userDeptId,
    application
  ) => {
    const { store } = this.props;
    const project = store.getProject();
    const name = god.PageData.project.name;
    try {
      await createThemeInGroup({
        name,
        layout: project.layout,
        groupId,
        themeType: category,
        pageData: project,
        userDeptId,
        application,
      });
      toastSuccess('创建成功', 1500);
    } catch (err) {
      return toastError(err.message, 1500);
    }
    setTimeout(() => {
      this.setState({
        showTemplateModal: false,
      });
      god.location.href = `/theme/list/${category}?tag=${groupId}`;
    }, 1500);
  };

  render() {
    const { showTemplateModal } = this.state;
    if (!validateRoleLimit('saveProjectToTheme')) {
      return null;
    }
    return (
      <React.Fragment>
        <HEIconButton
          className="editor-navbar__actions__icon-button"
          iconElement={<Template />}
          titleElement={'设为模板'}
          onClick={this._handleSetTemplate.bind(this, true)}
        />
        {showTemplateModal && (
          <ProjectSetTemplateModal
            onSubmit={this._handleProjectToTemplate.bind(this)}
            onClose={this._handleSetTemplate.bind(this, false)}
          />
        )}
      </React.Fragment>
    );
  }
}
