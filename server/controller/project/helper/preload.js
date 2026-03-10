let getResources = (component, resources = new Array()) => {
  let children;
  if (component && component.pages) {
    children = component.pages;
  } else if (component.widgets) {
    children = component.widgets;
  } else if (component.layers) {
    children = component.layers;
  }

  if (children && children.length > 0) {
    children.forEach((child) => {
      if (child.type == 'Image' && child.data.url) {
        resources.push(child.data.url);
      }
      getResources(child, resources);
    });
  }
  return resources;
};

module.exports = getResources;
