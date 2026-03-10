/*
 * @Description:
 * @Author: jielang
 * @Date: 2021-08-16 18:52:22
 * @LastEditors: jielang
 * @LastEditTime: 2021-08-16 20:03:05
 */
import React from 'react';
import { DEFAULT_LIST_INDENT } from './constants';

export default function List(props) {
  const { attributes, node, children } = props;
  const nodeData = node.data;
  const indent = nodeData.get('indent');

  return (
    <div
      {...attributes}
      style={{ paddingLeft: indent != null ? indent : DEFAULT_LIST_INDENT }}
    >
      {children}
    </div>
  );
}
