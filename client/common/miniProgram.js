import { getMiniProgramList } from 'apis/ProjectAPI';
import options from 'slate-edit-list/dist/options';

export function getMiniConfig() {
  return new Promise(async (resolve) => {
    let list = [];
    try {
      const res = await getMiniProgramList();
      // console.log('jsonData', res.data.config);
      const {
        data: { config }
      } = res;

      list = config.wxminiData || [];
    } catch (error) {
      console.log('error-getMiniProgramList', error);
    }
    resolve(list);
  });
}
// 获取小程序项目基础路径，小程序二维码地址
// 常规项目id 是 projectId 规则项目 id 为 themeId
// type区分规则小程序(rule)/常规小程序(common)
// 自定义的规则小程序没有themeId暂时不展示链接，不走此方法
export function getMiniProgramConfig(type, miniProgramId, id, ruleId) {
  if (!id) return '';
  const envMap = {
    dev: 'local',
    test: 'test',
    gray: 'gray'
  };
  return getMiniConfig().then((res) => {
    let obj = null;
    if (res.length > 0) {
      const miniProgramItem = res.find((item) => item.id === miniProgramId);
      const p = `p=${id.slice(0, 8)}`;
      let test = '';
      let prod = ''; // 应该只有常规(common)项目才有后续参数
      let rule = ''; // 规则项目需要加规则id
      if (type === 'common') {
        if (process.env.NODE_ENV !== 'prod') {
          test = `&penv=${envMap[process.env.NODE_ENV]}`;
          prod = test;
        } else {
          test = '&penv=sandbox';
          prod = '&penv=production';
        }
      } else {
        test = '&type=gray';
      }
      if (ruleId) {
        rule = `&ruleId=${ruleId}`;
      }
      const miniProgramUrl = `${miniProgramItem.path}?${p}${rule}`;
      const miniCodeUrl = `${miniProgramItem.codeUrl}&${p}${rule}`;
      obj = {
        miniProgramUrl: `${miniProgramUrl}${prod}`, // 小程序基础路径---正式
        miniProgramUrlTest: `${miniProgramUrl}${test}`,
        miniCodeUrl: `${miniCodeUrl}${prod}`, // 小程序二维码地址---正式
        miniCodeUrlTest: `${miniCodeUrl}${test}`
      };
    }
    return obj;
  });
}
// 获取默认小程序id
export function getDefaultMiniProgramId() {
  const id = sessionStorage.getItem('defaultMiniProgramId');
  if (id) {
    return Promise.resolve(id);
  } else {
    return getMiniConfig().then((res) => {
      if (res.length > 0) {
        sessionStorage.setItem('defaultMiniProgramId', res[0].id);
        return res[0].id;
      } else {
        return 'gh_96393e3ad64c';
      }
    });
  }
}

export async function getMiniConfigOptions() {
  const list = await getMiniConfig();
  const options = list.map(item => {
    return { text: item.name, value: item.id };
  });
  return options;
}
