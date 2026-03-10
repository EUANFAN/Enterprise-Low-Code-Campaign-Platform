module.exports = {
  urls: {
    login: 'https://sso.saash.vdyoo.com/portal/login/A542672539',
    logout:
      'https://sso.saash.vdyoo.com/sso/logout?path=http://editor-dev.xiwang.com:8066/login',
    checkTicket: 'https://api-service.saash.vdyoo.com/basic/get_ticket',
    getVerify: 'https://sso.saash.vdyoo.com/api/v1/sso/verify',
    userGet:
      'https://api-service.saash.vdyoo.com/cmpts/data/account/v2/user/get', // 获取单条账号信息，部门/头像
    snapshot: 'http://127.0.0.1:8000/snapshot/h5',
    themePreview: 'http://editor-dev.xiwang.com:8066/project/preview'
  },
  params: {
    app_id: 'A542672539',
    app_key: '0l5WjaKTYsQjjNBj',
    version: '1.0',
    admin_app_id: '1001396',
    admin_app_key: '04517fe567628a9542062236ef37d575',
    appro_signkey: '#SDHHS*((&&S^^^S%%%'
  }
};
