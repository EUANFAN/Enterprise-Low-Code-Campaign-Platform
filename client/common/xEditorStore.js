const xEditorStore = god.xEditor.store;

function getEditorStore(key) {
  let value = null;
  Object.keys(xEditorStore).every((temp) => {
    if (temp == key) {
      value = xEditorStore[key];
      return false;
    }
    return true;
  });
  return value;
}
function initEditorStore(name) {
  xEditorStore[name] = {};
}

function setEditorStore(name, key, value) {
  let obj = xEditorStore[name];
  obj[key] = value;
}

export default {
  initEditorStore,
  getEditorStore,
  setEditorStore,
};
