export default class DownloadUtils {
  static async downloadLink(uri, name) {
    const response = await fetch(uri);
    const blob = await response.blob();
    const url = god.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = name;
    // anchor.download = extension ? `${name}.${extension}` : name;
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  /**
   * 把一个 数组 变成 encode 之后的 csv string
   * BOM（Byte Order Mark），字节顺序标记，出现在文本文件头部，Unicode编码标准中用于标识文件是采用哪种格式的编码。
   * 在字符串头部加上"\ufeff"表示它是utf-8格式编码的
   */
  static createCSVStringfromArray(
    table,
    charset = 'utf-8',
    bomEncode = '\ufeff'
  ) {
    let csvContent = 'data:text/csv;charset=' + charset + ',' + bomEncode;
    csvContent += table.reduce((prev, currArray) => {
      return prev + currArray.join(',') + '\r\n';
    }, '');
    return encodeURI(csvContent);
  }
}
