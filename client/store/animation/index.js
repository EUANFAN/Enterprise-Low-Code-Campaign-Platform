import { observable } from 'mobx';

export default observable({
  animation: {
    widgetId: null,
    widgetObj: {
      animationType: 'hash',
      property: '',
      propertyValue: '',
      scene: 'In',
      type: '',
      duration: 1000,
      delay: 0,
      loop: 1,
    },
  },
});
