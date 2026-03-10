const request = require('koa2-request')
const getMinProgramList = async function () {
  const reqUrl =
    'https://booster.xiwang.com/h5EditStation/ConfigCollection/GetConfig'
  const confInfo = await request(reqUrl, {
    formData: { ruleId: '613f27bf3e9498e17be29d0d' },
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })

  let miniProgramList = {}

  try {
    miniProgramList = JSON.parse(confInfo.body).data.config.wxminiData
  } catch (e) {
    console.error('不存在wxminiData字段')
  }
  return miniProgramList
}

module.exports = getMinProgramList
