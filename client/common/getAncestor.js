/**
 * 获取祖先元素
 *
 * @param  {DOM NODE}    node      节点
 * @param  {string}      className 类名
 * @return {DOM NODE}              祖先节点
 */
export default (node, className) => {
  let current;
  while (node) {
    if (
      node.className &&
      node.className.indexOf && // For svg path might not be a string
      node.className.indexOf(className) > -1
    ) {
      current = node;
      break;
    }
    node = node.parentNode;
  }

  return current;
};
