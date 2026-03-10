#!/usr/bin/env node
const { db } = require('../utils/mongo');
const instance = db();
// const bizunitList = [
//   { name: '网校', enname: 'wx', queryname: ['网校事业部'] },
//   { name: '培优', enname: 'py', queryname: ['培优事业部'] },
//   { name: '智康', enname: 'zk', queryname: ['智康事业部'] },
//   { name: '大学生', enname: 'dxs', queryname: ['大学生教育项目部'] },
//   { name: '未来魔法校', enname: 'xwlmfx', queryname: ['新未来魔法校'] },
//   { name: '新励步', enname: 'xlb', queryname: ['新未来魔法校'] },
//   {
//     name: '集团中台',
//     enname: 'jtzt',
//     queryname: ['集团中台', '技术中台', '内容中台'],
//   },
//   { name: '集团总部', enname: 'jtzb', queryname: ['集团总部'] },
//   { name: '集团前台', enname: 'jtqt', queryname: ['集团前台'] },
// ];
const bizunitList = [{ name: '示例公司', enname: 'example', queryname: ['示例公司'] }];

async function insetBizUnit() {
  let list = [];
  await instance.bizunit
    .find()
    .toArray()
    .then((res) => {
      list = res;
    });
  if (!list.length) {
    await instance.bizunit.save(bizunitList).then(() => {
      console.log('insert success');
    });
  } else {
    console.log('bizunit is already in db');
  }
  process.exit(0);
}
insetBizUnit();
