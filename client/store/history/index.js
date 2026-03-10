import { observable, toJS } from 'mobx';
import debounce from 'lodash/debounce';
import jsonpatch from 'fast-json-patch';
import cloneDeep from 'lodash/cloneDeep';
import LocalStorage from 'common/localStorage';
import { compareData } from 'common/comparePageData';
let currentStore = null;
const DEFAULT_STEP = 20;
let historyState = observable({
  cursor: 0,
});
let initDataArray = [];
let patches = [];

let register = (store) => {
  currentStore = store;
  initDataArray.push(toJS(store.getStageStore()));
  patches = [];
};

let recordProject = async () => {
  if (!currentStore) {
    return;
  }

  let index = Math.floor(historyState.cursor / DEFAULT_STEP);
  let lastest = cloneDeep(initDataArray[index]);
  cloneDeep(
    patches.slice(index * DEFAULT_STEP, historyState.cursor + 1)
  ).forEach((patch) => {
    lastest = patch.reduce(function (result, item) {
      let currentResult;
      try {
        currentResult = jsonpatch.applyReducer(result, item);
      } catch (e) {
        currentResult = result;
      }
      return currentResult;
    }, lastest);
  });
  let stageStoreData = toJS(currentStore.getStageStore());
  let diff = filterInValidPatch(jsonpatch.compare(lastest, stageStoreData));
  if (diff.length) {
    patches.push(diff);
    historyState.cursor++;
    if (historyState.cursor % DEFAULT_STEP === 0) {
      initDataArray.push(stageStoreData);
    }
    stageStoreData.project.lastModifyTime = new Date();
    LocalStorage.setItem(
      stageStoreData.project._id,
      JSON.stringify(await compareData(stageStoreData.project, 'project'))
    );
  }
};
let record = debounce(recordProject, 1500);
let filterInValidPatch = (patches) => {
  let whiteList = [
    new RegExp('lastModifyTime'),
    new RegExp('logId'),
    new RegExp('lastPublished'),
    /project\/createdAt\/\d+/,
    /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/isSelected/,
    /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/willUpdate/,
    /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/onUpdated/,
    /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/didUpdate/,
    /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/onRender/,
    /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/onEnter/,
    /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/onNext/,
    /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/willMount/,
    /pages\/\d+\/widgets\/\d+(\/layers\/\d+\/widgets\/\d+)*\/onMount/,
  ];
  let newPatch = patches.filter((patch) => {
    let booleanValue = whiteList.some((item) => {
      return item.test(patch.path);
    });
    return !booleanValue;
  });
  return newPatch;
};

let hasBack = () => {
  if (historyState.cursor > 0) {
    return true;
  }
};

let hasForward = () => {
  if (historyState.cursor < patches.length) {
    return true;
  }
};

let back = () => {
  if (hasBack()) {
    historyState.cursor--;
    useRecord(historyState.cursor, -1);
  }
};

let forward = () => {
  if (hasForward()) {
    historyState.cursor++;
    useRecord(historyState.cursor, 1);
  }
};

let useRecord = (cursor, offset) => {
  let index = Math.floor(cursor / DEFAULT_STEP);
  let need = cloneDeep(initDataArray[index]);
  cloneDeep(patches.slice(index * DEFAULT_STEP, cursor)).forEach((patch) => {
    need = patch.reduce(jsonpatch.applyReducer, need);
  });
  if (!need) return;
  if (need.stages[need.stages.length - 1].type == 'widget') {
    // need.stages.pop()
    useRecord(historyState.cursor + offset, offset);
  } else {
    currentStore.setStageStore(need);
  }
};

export default {
  register,
  record,
  hasBack,
  hasForward,
  back,
  forward,
};
