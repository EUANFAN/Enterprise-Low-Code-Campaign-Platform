export const noop = () => null;

export function delayPromise(time = 1000) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
