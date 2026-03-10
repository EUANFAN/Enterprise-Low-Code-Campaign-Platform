function getChildren(component) {
  return component.pages || component.widgets || component.layers || [];
}

/**
 * 遍历所有的 Node，并对 Node 执行给定函数
 * @param  {Object}   component Page, layer 或 widget
 * @param  {Function} fn        要使用的函数
 */
function forEachNode(component, fn, depth) {
  const remainingDepth = depth - 1;
  let children = getChildren(component);

  children.forEach((child) => {
    fn(child);
    if (remainingDepth > 0) {
      forEachNode(child, fn, remainingDepth);
    }
  });
}

/**
 * 遍历所有的 Node，检查是否有符合条件
 * @param  {Object}   component Page, layer 或 widget
 * @param  {Function} fn        要使用的函数
 */
function someNode(component, fn) {
  let children = getChildren(component);

  return children.some((child) => {
    const result = fn(child);
    if (result) {
      return true;
    }
    return someNode(child, fn);
  });
}

function reduceNode(component, fn, initialState, depth) {
  const children = getChildren(component);

  return children.reduce((prev, current) => {
    return _reduceCurrentNode(prev, current, fn, depth - 1);
  }, initialState);
}

function _reduceCurrentNode(prev, component, fn, depth) {
  let resultSoFar = fn(prev, component);
  if (depth > 0) {
    resultSoFar = getChildren(component).reduce((prev, current) => {
      return _reduceCurrentNode(prev, current, fn, depth - 1);
    }, resultSoFar);
  }
  return resultSoFar;
}

module.exports = { forEachNode, someNode, reduceNode };
