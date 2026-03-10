let convert = function (items) {
  let result = {};
  if (!items) {
    return {};
  }
  items.forEach((item) => {
    if (item.children) {
      result[item.key] = convert(item.children);
    } else {
      result[item.key] = item.example;
    }
  });
  return result;
};

function getExampleData(project) {
  return convert(project.descriptions);
}
module.exports = {
  getExampleData,
};
