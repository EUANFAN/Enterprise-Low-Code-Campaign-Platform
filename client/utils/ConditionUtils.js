export default function (expression) {
  try {
    const fn = new Function(`return ${expression}`);
    return fn();
  } catch (e) {
    return true;
  }
}
