import hexRgb from 'hex-rgb';

export const hexToRgba = (hex, alpha) => {
  if (hex == null && alpha == null) {
    return;
  }

  const { red, blue, green } = hexRgb(hex);

  return `rgba(${red}, ${green}, ${blue}, ${alpha * 0.01})`;
};
