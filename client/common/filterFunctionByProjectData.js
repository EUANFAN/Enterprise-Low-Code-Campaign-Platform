// 去除一个对象内的function属性
let filterFunctionByProjectData = (projectData) => {
  if (typeof projectData === 'function') {
    return false;
  } else if (Array.isArray(projectData)) {
    projectData = projectData.map((data) => {
      let result = filterFunctionByProjectData(data);
      if (result === true) {
        return data;
      } else {
        return result;
      }
    });
  } else if (projectData instanceof Object) {
    for (let key in projectData) {
      let isFunction = filterFunctionByProjectData(projectData[key]);
      if (!isFunction) delete projectData[key];
    }
  } else {
    return true;
  }
  return projectData;
};
export { filterFunctionByProjectData };
