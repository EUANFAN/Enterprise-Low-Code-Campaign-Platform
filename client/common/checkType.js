const checkTypeToName = (type) => {
  switch (type) {
    case 'Boolean':
    case Boolean:
      return '布尔值';
    case 'Number':
    case Number:
      return '数值';
    default:
      return '字符串';
  }
};

const checkTypeToString = (type) => {
  switch (type) {
    case 'Boolean':
    case Boolean:
      return 'Boolean';
    case 'Number':
    case Number:
      return 'Number';
    default:
      return 'String';
  }
};

const checkValueByType = (value, type) => {
  switch (type) {
    case 'Boolean':
    case Boolean:
      return value == 'true' ? true : false;
    case 'Number':
    case Number:
      return isNaN(Number(value)) ? 0 : Number(value);
    default:
      return value;
  }
};

export { checkTypeToName, checkTypeToString, checkValueByType };
