/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:03:19
 */
/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-05-24 10:52:40
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:03:19
 */
import React from 'react';
import HEIconButton from 'components/HEIconButton';
import Save from 'components/icons/Save';
import { toastError, toastLoading, toastSuccess } from 'components/HEToast';
import LocalStorage from 'common/localStorage';
import history from 'store/history';
import Hotkeys from 'react-hot-keys';
import { updateProject } from 'apis/ProjectAPI';
import { context } from 'common/utils';
import { validateRoleLimit } from 'common/utils';
import AuditStatusManage from 'components/AuditStatusManage';
@AuditStatusManage
export default class SaveBtn extends React.Component {
  state = {
    saving: false,
  };
  // 是否是模板编辑状态
  get isUpdateAuditStatus() {
    // 2 审核成功  0 未审核
    return PageData.isTheme && PageData.project.auditStatus === 2;
  }
  get themeId() {
    return PageData.project.themeId || PageData.project._id;
  }
  auditStatusManageFinish() {
    PageData.project.auditStatus = 0;
  }
  _handleSave = async (event) => {
    event.preventDefault();
    this.props.handleTempleteAudit.call(this);
    const { store, config } = this.props;
    const project = store.getProject();
    if (!project.editable) {
      toastError('您无权限保存');
      return;
    }
    const { saving } = this.state;
    if (saving) {
      return;
    }
    this.setState({ saving: true });
    toastLoading('正在保存...');
    try {
      // 保存前回调
      if (config && typeof config['beforeSave'] === 'function') {
        await config.beforeSave(context());
      }
      if (config && config['screenshot']) {
        project['screenshot'] = config['screenshot'];
      }
      if (config && typeof config['save'] === 'function') {
        await config.save(context());
      } else {
        await updateProject(project._id, project);
      }
      history.record();
      LocalStorage.removeItem(project._id);

      // 保存后回调
      if (config && typeof config['afterSave'] === 'function') {
        await config.afterSave(context());
      }
      toastSuccess('保存成功');
    } catch (err) {
      toastError(err.message || '保存失败');
      return;
    } finally {
      this.setState({ saving: false });
    }
  };
  render() {
    const { saving } = this.state;
    if (!validateRoleLimit('saveProject')) {
      return null;
    }
    return (
      <React.Fragment>
        <HEIconButton
          className="editor-navbar__actions__icon-button"
          iconElement={<Save />}
          disabled={saving}
          titleElement={'保存'}
          onClick={this._handleSave}
        />
        <Hotkeys
          keyName="control+s,command+s"
          onKeyDown={(key, event) => this._handleSave(event)}
        />
      </React.Fragment>
    );
  }
}
