const path = require('path')
const XOss = require('@k9/x-oss')
const fs = require('fs')
const os = require('os')

function uploadFile(fileName, filePath, options) {
  let COMMON_CONFIG = global.app.config.get('upload')
  let uploadTo = options.uploadTo

  let baseUrl = ''
  if (uploadTo !== '/') {
    baseUrl = `/${options.uploadTo}`
  }
  const url = `${COMMON_CONFIG.baseOrigin}${baseUrl}`
  return new Promise((resolve) => {
    new XOss(
      Object.assign(
        COMMON_CONFIG,
        {
          limit: 100,
          success() {
            let data = null

            if (options.uploadTo == '/') {
              data = {
                file_url: `http://${url}/${fileName}`,
                file_url_https: `https://${url}/${fileName}`
              }
            } else {
              data = {
                file_url: `https://${url}/${fileName}`,
                file_url_https: `https://${url}/${fileName}`
              }
            }
            resolve({
              errno: 0,
              data: data
            })
          }
        },
        options,
        { uploadTo: baseUrl }
      )
    ).uploadFile(filePath)
  })
}

const getCategory = function (fileName) {
  let category = ''
  let app = global.app

  if (app.env == 'dev') {
    category = '_local_'
  }

  // if (app.env == 'dev') {
  //   category = '_local_';
  // } else if (app.env == 'test') {
  //   category = '_test_';
  // } else if (app.env == 'gray') {
  //   category = '_gray_';
  // }
  if (fileName) {
    let dir = path.dirname(fileName)
    if (dir != '.') {
      category += '/' + dir
    }
  }
  return category
}

/**
 * 上传资源文件
 *
 * @param  {string} fileName 文件名称
 * @param  {string} filepath 文件地址
 * @return {Promise}         promise
 */

const uploadFileByPath = async function (fileName, filepath, options = {}) {
  let res =
    /\.json|\.pdf$|\.doc$|\.docx$|\.xls$|\.xlsx$|\.txt$|\.jpg$|\.csv$|\.jpeg$|\.gif$|\.svg$|\.png$|\.mp3$|\.mp4$|\.m3u8$/i.test(
      fileName
    )
  if (res) {
    const result = await uploadFile(
      fileName,
      filepath,
      Object.assign(
        {
          uploadTo: getCategory(fileName)
        },
        options
      )
    )
    return result
  }
}

/**
 * 上传html文件
 *
 * @param  {string} fileName 文件名称
 * @param  {string} filepath 文件地址
 * @return {Promise}         promise
 */

const uploadFileContent = async function (fileName, content, env, isPreview) {
  let tmpFilePath = os.tmpdir() + '/' + fileName
  fs.writeFileSync(tmpFilePath, content)
  let category = getCategory(fileName)
  let uploadTo = ''

  if (isPreview) {
    // 小程序上传json文件，规则项目上传规则json文件
    uploadTo = category ? `preview/${category}` : 'preview'
  } else {
    if (!category) {
      // 线上测试发布 & 线上正式发布
      uploadTo = env == 'online_test' ? '_online_test_' : '/'
    } else {
      // 其他环境发布
      uploadTo = (env == 'online_test' ? '_online_test_/' : '') + category
    }
  }
  console.log('uploadTo', uploadTo)
  const result = await uploadFile(fileName, tmpFilePath, {
    uploadTo: uploadTo
  })
  return result
}

const getUploadToken = async function () {
  let COMMON_CONFIG = global.app.config.get('upload')
  const uploadStorage = new XOss(COMMON_CONFIG)
  const result = await uploadStorage.getUploadToken()
  return { ...result.Credentials, bucket: COMMON_CONFIG.bucket }
}

module.exports = {
  uploadFile: uploadFile,
  uploadFileByPath,
  uploadFileContent,
  getCategory,
  getUploadToken
}
