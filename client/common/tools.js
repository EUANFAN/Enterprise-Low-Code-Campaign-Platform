import { PAGE_WIDTH } from 'common/constants';

/**
 * 获取内容高度
 *
 * @param  {string} content html字符串
 * @param  {number} width   容器宽度
 * @return {number}         内容
 */
let getContentHeight = function (widget) {
  let content = widget.data.content;

  let width = widget.width || PAGE_WIDTH;
  let padding = widget.padding || '';
  let lineHeight = `${widget.data.lineHeight}px`;
  padding = padding
    .split(' ')
    .map(function (item) {
      return item + 'px';
    })
    .join(' ');

  let div = document.createElement('div');

  let style = [
    'width: ' + width + 'px',
    'padding: ' + padding,
    'visibility: hidden',
    'text-align: justify',
    'line-height: ' + lineHeight,
  ].join(';');
  div.innerHTML =
    '<div style="' + style + '" class="widget-text">' + content + '</div>';
  div.style.overflow = 'hidden';
  document.body.appendChild(div);
  let height = div.offsetHeight || 30;
  document.body.removeChild(div);
  return height;
};

function asyncPool(poolLimit, array, iteratorFn) {
  let i = 0;
  const ret = [];
  const executing = [];
  const enqueue = function () {
    if (i === array.length) {
      return Promise.resolve();
    }
    const item = array[i++];
    const p = Promise.resolve().then(() => iteratorFn(item, array));
    ret.push(p);
    const e = p.then(() => executing.splice(executing.indexOf(e), 1));
    executing.push(e);
    let r = Promise.resolve();
    if (executing.length >= poolLimit) {
      r = Promise.race(executing);
    }
    return r.then(() => enqueue());
  };
  return enqueue().then(() => Promise.all(ret));
}

function getFileType(url) {
  if (/(gif|png|jpg|jpeg|bmp)$/gi.test(url)) {
    return 'image';
  }

  if (/(mp4)$/gi.test(url)) {
    return 'video';
  }

  if (/(mp3)$/gi.test(url)) {
    return 'audio';
  }

  if (/(ttf|otf|woff|woff2|eot|svg)$/gi.test(url)) {
    return 'font';
  }
}

let getPaddingStruct = (padding) => {
  let struct = {};
  let order = ['top', 'right', 'bottom', 'left'];
  padding.split(' ').forEach((item, index) => {
    struct[order[index]] = +item;
  });
  return struct;
};

export default {
  getContentHeight,
  asyncPool,
  getPaddingStruct,
  getFileType,
};
