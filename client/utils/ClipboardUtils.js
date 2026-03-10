let __textArea;

function getTextArea() {
  if (!__textArea) {
    __textArea = document.createElement('textarea');
    __textArea.style.position = 'fixed';
    __textArea.style.left = '100vw';
    __textArea.style.top = 0;
  }
  return __textArea;
}

export default class ClipboardUtils {
  /**
   * 复制给定文字至粘贴板上
   * @param  {string}  text 欲粘贴的文字
   * @return {Promise}      Promise，会在粘贴结束后回传值。若粘贴失败，可能执行并非用
   *                        户触发。
   */
  static async copyTextToClipboard(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    }

    // Fallback
    const textArea = getTextArea();
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand('copy');

    document.body.removeChild(textArea);

    if (!success) {
      throw new Error('复制至剪贴簿失败');
    }
    return success;
  }
}
