/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-12-17 20:25:28
 * @LastEditors: jielang
 * @LastEditTime: 2021-01-06 18:07:08
 */
const { FileTypes } = require('../../../constants');
const IMAGE_TYPE_REGEX = /^image/;
const AUDIO_TYPE_REGEX = /^audio/;
const VIDEO_TYPE_REGEX = /^video/;
const FILE_TYPE_REGEX =
  /csv|json|pdf|msword|(vnd.openxmlformats-officedocument.spreadsheetml.sheet)/;

function getFileType(mimeType) {
  if (IMAGE_TYPE_REGEX.test(mimeType)) {
    return FileTypes.IMAGE;
  }
  if (FILE_TYPE_REGEX.test(mimeType)) {
    return FileTypes.FILE;
  }
  if (AUDIO_TYPE_REGEX.test(mimeType)) {
    return FileTypes.AUDIO;
  }
  if (VIDEO_TYPE_REGEX.test(mimeType)) {
    return FileTypes.VIDEO;
  }

  return FileTypes.OTHERS;
}
module.exports = { getFileType };
