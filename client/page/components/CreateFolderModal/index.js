import React from 'react';
import SimpleInputModal from '../SimpleInputModal';

function CopyThemeModal(props) {
  return (
    <SimpleInputModal
      {...props}
      title={'新建文件夹'}
      labelText={'文件夹名称'}
      placeholder={'请输入文件夹的名称'}
    />
  );
}

export default CopyThemeModal;
