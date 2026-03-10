/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-12-14 17:16:14
 * @LastEditors: jielang
 * @LastEditTime: 2020-12-22 19:15:52
 */
import React from 'react';
import SimpleInputModal from '../SimpleInputModal';

function CopyThemeModal(props) {
  return (
    <SimpleInputModal
      title={'新建文件夹'}
      labelText={'文件夹名称'}
      placeholder={'请输入文件夹的名称'}
      {...props}
    />
  );
}

export default CopyThemeModal;
