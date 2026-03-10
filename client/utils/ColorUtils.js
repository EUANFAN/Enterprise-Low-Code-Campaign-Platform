import hexRgb from 'hex-rgb';

export default class ColorUtil {
  static hexToRgba(hex, alpha) {
    if (hex == null && alpha == null) {
      return;
    }

    const { red, blue, green } = hexRgb(hex);

    return `rgba(${red}, ${green}, ${blue}, ${alpha * 0.01})`;
  }
}
