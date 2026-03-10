#!/usr/bin/env node
const { db } = require('../utils/mongo');
const instance = db();
const tagList = [
  {
    name: '图文',
    type: 'common',
    component: 'widget'
  },
  {
    name: '表单',
    type: 'common',
    component: 'widget'
  },
  {
    name: '音视频',
    type: 'common',
    component: 'widget'
  },
  {
    name: 'Tab导航',
    type: 'common',
    component: 'widget'
  },
  {
    name: '其他',
    type: 'common',
    component: 'widget'
  },
  {
    name: '头图',
    type: 'custom',
    component: 'widget'
  },
  {
    name: '按钮',
    type: 'custom',
    component: 'widget'
  },
  {
    name: '年级选择',
    type: 'custom',
    component: 'widget'
  },
  {
    name: '登录',
    type: 'custom',
    component: 'widget'
  },
  {
    name: '其他',
    type: 'custom',
    component: 'widget'
  },
  {
    name: '登录',
    type: 'common',
    component: 'action'
  },
  {
    name: '支付',
    type: 'common',
    component: 'action'
  },
  {
    name: '调试',
    type: 'common',
    component: 'action'
  },
  {
    name: '分享',
    type: 'common',
    component: 'action'
  },
  {
    name: '客户端操作',
    type: 'common',
    component: 'action'
  },
  {
    name: '其他',
    type: 'common',
    component: 'action'
  }
];

async function insetBizUnit() {
  let list = [];
  await instance.tags
    .find()
    .toArray()
    .then((res) => {
      list = res;
    });
  if (!list.length) {
    await instance.tags.save(tagList).then(() => {
      console.log('insert success');
    });
  } else {
    console.log('tagList is already in db');
  }
  process.exit(0);
}
insetBizUnit();
