// 创建/编辑项目时
const { db } = require('../utils/mongo');
const instance = db();
const tagList = [
  {
    name: '测试'
  },
  {
    name: '其他'
  }
];

async function insetTags() {
  let list = [];
  await instance.projectTags
    .find()
    .toArray()
    .then((res) => {
      list = res;
    });
  if (!list.length) {
    await instance.projectTags.save(tagList).then(() => {
      console.log('insert success !');
    });
  } else {
    console.log('projectTags is already in db !');
  }
  process.exit(0);
}
insetTags();
