function throttle(fn, delay = 500) {
  let valid = true;
  return function () {
    if (!valid) {
      return false;
    }
    valid = false;
    fn();
    setTimeout(() => {
      fn();
      valid = true;
    }, delay);
  };
}
const useScroll = (element, cb, delay) => {
  let direction = '';
  let scrollTop = element.scrollTop;
  const scroll = throttle(() => {
    direction = element.scrollTop > scrollTop ? 'up' : 'down';
    if (element.scrollHeight - element.scrollTop - element.clientHeight < 100) {
      // 距离视窗还用50的时候，开始触发；
      return (
        cb &&
        cb({
          isBottomed: true,
          direction,
          scrollTop: element.scrollTop,
        })
      );
    }
    cb({
      direction,
      scrollTop: element.scrollTop,
    });
  }, delay);
  element.addEventListener('scroll', scroll);
  return () => {
    element.removeEventListener('scroll', scroll);
  };
};

export default useScroll;
