module.exports = {
  servers: [
    {
      host: 'dds-2zea23f7bab33d142.mongodb.rds.aliyuncs.com',
      port: 3717
    },
    {
      host: 'dds-2zea23f7bab33d141.mongodb.rds.aliyuncs.com',
      port: 3717
    }
  ],
  rs_name: 'mgset-74548797',
  user: 'k9_fe_test',
  password: 'v^7wu5h^kGU84p67',
  db: 'ares_test',
  read_preference: 'secondaryPreferred',
  appIdInfo: {
    // '15': {
    //   name: '运营活动',
    //   id: '5a042c85462025d0609aa110',
    // },
    // '1370': {
    //   name: '运营活动',
    //   id: '5a042c85462025d0609aa110',
    // },
    // '9487': {
    //   name: '消息号',
    //   id: '5bf3b0ad75e3d43da40f91e8',
    // },
  }
}
