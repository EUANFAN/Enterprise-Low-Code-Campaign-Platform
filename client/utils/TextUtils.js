export default class TextUtils {
  static escape(text, options) {
    let result = text;

    if (options.quote) {
      result = result.replace('\'', '\\\'').replace('"', '\\"'); // eslint-disable-line indent
    }

    return result;
  }
}
