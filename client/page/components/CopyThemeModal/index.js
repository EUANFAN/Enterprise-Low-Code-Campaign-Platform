import React from 'react';
import SimpleInputModal from '../SimpleInputModal';

function CopyThemeModal(props) {
  return (
    <SimpleInputModal
      {...props}
      title={'复制模板'}
      labelText={'模板名称'}
      placeholder={'请输入模板名称'}
    />
  );
}

export default CopyThemeModal;
