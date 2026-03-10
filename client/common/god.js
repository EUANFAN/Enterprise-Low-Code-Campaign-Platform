import { observable } from 'mobx';
let current;
if (typeof window != 'undefined') {
  current = window;
} else {
  current = global;
  current.PageData = current.PageData || {};
  current.xEditor = current.xEditor || {};
  current.xEditor.store = observable({});
  current.clientSize = current.clientSize || {
    width: 375,
    height: 603,
  };
  current.inEditor = true;
}

current.god = current;
export default current;
