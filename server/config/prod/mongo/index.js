module.exports = {
  servers: [
    {
      host: 'dds-2ze8524d6978f4541.mongodb.rds.aliyuncs.com',
      port: 3717
    },
    {
      host: 'dds-2ze8524d6978f4542.mongodb.rds.aliyuncs.com',
      port: 3717
    }
  ],
  rs_name: 'mgset-60092000',
  user: 'k9_fe',
  password: 'iaPn*3iFxXQHSyGF',
  db: 'ares',
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
};
