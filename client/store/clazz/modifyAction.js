import ImageUtils from 'utils/ImageUtils';

/**
 * Get modifications from state and key value
 * @param  {Object}          state Current state
 * @param  {string}          key   Key to be changed
 * @param  {any}             value New value
 * @return {Promise<Object>}       Promise that resolves the modifications
 */
export async function modifyAction(state, key, value) {
  switch (key) {
    case 'bgSize':
    case 'height':
    case 'width': {
      if (!state.bgImage) {
        return { [key]: value };
      }
      const dimension = await ImageUtils.getImageDimension(state.bgImage);
      const bgSize = key === 'bgSize' ? value : state.bgSize;
      const pageWidth = key === 'width' ? value : state.width;
      const pageHeight = key === 'height' ? value : state.height;
      const result = { [key]: value };
      switch (bgSize) {
        case 'auto':
          result.bgSizeScale = (dimension.width / pageWidth) * 100;
          break;
        case 'cover': {
          // Fit longer side
          const pageAspectRatio = pageWidth / pageHeight;
          const imageAspectRatio = dimension.width / dimension.height;

          if (pageAspectRatio < imageAspectRatio) {
            result.bgSizeScale =
              (pageHeight / dimension.height / (pageWidth / dimension.width)) *
              100;
          } else {
            result.bgSizeScale = 100;
          }
          break;
        }
        case 'contain': {
          // Fit shorter side
          const pageAspectRatio = pageWidth / pageHeight;
          const imageAspectRatio = dimension.width / dimension.height;

          if (pageAspectRatio > imageAspectRatio) {
            result.bgSizeScale =
              (pageHeight / dimension.height / (pageWidth / dimension.width)) *
              100;
          } else {
            result.bgSizeScale = 100;
          }
          break;
        }
      }

      return result;
    }
    case 'bgSizeScale': {
      return {
        bgSize: 'custom',
        [key]: value,
      };
    }
    default:
      return {
        [key]: value,
      };
  }
}
