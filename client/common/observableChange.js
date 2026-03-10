import { toJS, values, isObservable } from 'mobx';
let needObservableChange = (data) => {
  for (let key in data) {
    if (data[key]) {
      if (data[key].slice && Array.isArray(data[key].slice())) {
        return data[key].some((item) => {
          return needObservableChange(item);
        });
      } else if (data[key].values) {
        return (
          Object.keys(values(data[key])).length !=
          Object.keys(toJS(data[key])).length
        );
      }
    }
  }
  if (isObservable(data)) {
    return Object.keys(values(data)).length != Object.keys(data).length;
  }
  return false;
};
export default needObservableChange;
