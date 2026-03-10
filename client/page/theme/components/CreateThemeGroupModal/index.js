import React from 'react';
import SimpleInputModal from '../SimpleInputModal';

export default function CreateThemeGroupModal(props) {
  return (
    <SimpleInputModal
      {...props}
      title={'创建新模板组'}
      labelText={'模板组名称'}
      placeholder={'请输入模板组名称'}
    />
  );
}
