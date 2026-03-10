import { observable } from 'mobx';
const init = (data) => {
  const initData = observable.map({});
  initData.merge(data);
  return initData;
};
const set = (key, data, allData) => {
  allData.set(key, data);
  return allData;
};
export default {
  init,
  set,
};
