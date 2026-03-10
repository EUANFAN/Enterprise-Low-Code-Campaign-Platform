import React from 'react';
import { Tree, Input } from 'antd';
import {
  HEModal,
  HEModalHeader,
  HEModalContent,
  HEModalActions,
} from 'components/HEModal';
import HEButton from 'components/HEButton';
import HESkyLayer from 'components/HESkyLayer';
import { getThemeGroups } from 'apis/ThemeAPI';
import { toastError } from 'components/HEToast';
import './index.less';

// function Row(props) {
//   return (
//     <div className="create-theme-modal__content__row">{props.children}</div>
//   );
// }

// function Label(props) {
//   return (
//     <label className="create-theme-modal__content__row__label">
//       {props.children}
//     </label>
//   );
// }

class ProjectSetTemplateModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      currentApplication: null,
    };
  }

  _handleSubmit = () => {
    const { onSubmit } = this.props;
    const { category, themeGroupId, userDeptId, currentApplication } =
      this.state;
    if (!category || !themeGroupId) {
      toastError('请选择设置的模板组');
      return;
    }
    if (!currentApplication) {
      toastError('请输入模板应用范围');
      return;
    }
    onSubmit(themeGroupId, category, userDeptId, currentApplication);
  };

  _handleTreeSelect = (selectedKeys, e) => {
    let selected = e.selectedNodes[0];
    this.setState({
      category: selected.props.category,
      userDeptId: selected.props.userDeptId,
      themeGroupId: selectedKeys,
    });
  };
  _handleApplicationChange = ({ target: { value } }) => {
    this.setState({ currentApplication: value.trim() });
  };
  async UNSAFE_componentWillMount() {
    const result = await getThemeGroups('all');
    console.log('all', result);
    this.setState({
      treeData: result.themeGroups.map((item) =>
        Object.assign(item, {
          selectable: false,
        })
      ),
    });
  }
  render() {
    const { onClose } = this.props;
    const { treeData, currentApplication } = this.state;
    return (
      <HESkyLayer onOverlayClick={onClose}>
        <HEModal className="project-bulk-move-modal">
          <HEModalHeader title={'设置为模板'} onClose={onClose} />
          <HEModalContent className="project-bulk-move-modal__content">
            <p className="project-bulk-move-modal__content__desc">
              {'请选择设置到哪个模板组下'}
            </p>
            <Tree treeData={treeData} onSelect={this._handleTreeSelect} />
            <p className="project-bulk-move-modal__content__desc">
              {'模板应用范围'}
            </p>
            <Input.TextArea
              placeholder={'请输入模板应用范围'}
              onChange={this._handleApplicationChange}
              value={currentApplication}
              className="create-theme-modal__content__row__input"
              autoSize
              maxLength={160}
            ></Input.TextArea>
          </HEModalContent>
          <HEModalActions>
            <HEButton onClick={this._handleSubmit}>{'确定'}</HEButton>
          </HEModalActions>
        </HEModal>
      </HESkyLayer>
    );
  }
}

export default ProjectSetTemplateModal;
