/*
 * @Description:
 * @Author: jielang
 * @Date: 2020-03-27 21:36:26
 * @LastEditors: jielang
 * @LastEditTime: 2020-05-14 17:06:20
 */
module.exports = {
  urls: {
    login: 'https://sso.saash.vdyoo.com/portal/login/A1646798446',
    logout: 'https://sso.saash.vdyoo.com/sso/logout?path=https://editor.xiwang.com/login',
    checkTicket: 'https://api-service.saash.vdyoo.com/basic/get_ticket',
    getVerify: 'https://sso.saash.vdyoo.com/api/v1/sso/verify',
    userGet: 'https://api-service.saash.vdyoo.com/cmpts/data/account/v2/user/get', // 获取单条账号信息，部门/头像
    snapshot: 'https://editor.xiwang.com/services/snapshot/h5',
    themePreview: 'https://editor.xiwang.com/project/preview'
  },
  params: {
    app_id: 'A1646798446',
    app_key: 'M0dKjmB0WzczyW27',
    version: '1.0',
    admin_app_id: '1001396',
    admin_app_key: '04517fe567628a9542062236ef37d575',
    appro_signkey: '#SDHHS*((&&S^^^S%%%'
  }
};
