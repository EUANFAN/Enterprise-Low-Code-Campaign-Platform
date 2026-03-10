import { observable } from 'mobx';
import Project from '../clazz/Project';

let data = observable.map({
  project: null,
  page: { index: 0 },
});

let store = {
  setProject(currentProject) {
    data.set('project', new Project(currentProject));
  },
  getProject() {
    return data.get('project');
  },
  setPageData(key, value) {
    const project = data.get('project');
    project.setPageData(key, value);
  },
  getPageDataByKey(key) {
    return data.get('project').getPageDataByKey(key);
  },
};

export default store;
