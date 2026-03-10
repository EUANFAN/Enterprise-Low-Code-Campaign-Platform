let loading = false;
let globalRecord = null;
let globalRegister = null;
function record() {
  if (!loading && god.inEditor) {
    import(/* webpackChunkName: "history" */ 'store/history/index.js').then(
      (Module) => {
        loading = true;
        globalRecord = Module.default.record;
        globalRegister = Module.default.register;
        globalRecord();
      }
    );
  } else {
    if (globalRecord) {
      globalRecord();
    }
  }
}
function register(store) {
  if (!loading && god.inEditor) {
    import(/* webpackChunkName: "history" */ 'store/history/index.js').then(
      (Module) => {
        loading = true;
        globalRecord = Module.default.record;
        globalRegister = Module.default.register;
        globalRegister(store);
      }
    );
  } else {
    if (globalRegister) {
      globalRegister(store);
    }
  }
}
export default {
  record,
  register,
};
