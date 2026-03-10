function timeStampToData(str) {
  const DEFAULT_TIMES = 1000;
  return Date.parse(new Date(str)) / DEFAULT_TIMES;
}

export default timeStampToData;
