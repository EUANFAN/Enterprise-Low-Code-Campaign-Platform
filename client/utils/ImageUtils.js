const __imgPool = [];

function clearImage(image) {
  image.onload = null;
  image.onerror = null;
  image.src = '';
  __imgPool.push(image);
}

export default class ImageUtils {
  /**
   * Get image dimension with URL
   * @param  {string}           url URL of the image
   * @return {Promise<Object>}      Promise that resolves the dimension of the
   *                                image
   */
  static getImageDimension(url) {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
      };

      img.onload = () => {
        cleanup();
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        cleanup();
        reject(new Error(`Fail to load image: ${url}`));
      };
      img.src = url;
    });
  }

  static preload(url, timeout = 3000) {
    return new Promise((resolve, reject) => {
      let image = __imgPool.pop() || new Image();

      image.onload = () => {
        clearImage(image);
        resolve();
      };
      image.onerror = () => {
        clearImage(image);
        reject(new Error(`Fail to load image: ${url}`));
      };

      setTimeout(() => {
        clearImage(image);
        reject(new Error(`Timeout when loading image: ${url}`));
      }, timeout);

      image.src = url;
    });
  }
}

god.ImageUtils = ImageUtils;
