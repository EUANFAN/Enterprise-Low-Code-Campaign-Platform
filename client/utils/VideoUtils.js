const __videoPool = [];

function getVideo() {
  const video = __videoPool.pop();
  return video || document.createElement('video');
}

function releaseVideo(video) {
  __videoPool.push(video);
}

const TIMEOUT = 10000;

export default class VideoUtils {
  /**
   * Get image dimension with URL
   * @param  {string}           url URL of the image
   * @return {Promise<Object>}      Promise that resolves the dimension of the
   *                                image
   */
  static getVideoDimension(url) {
    return new Promise((resolve, reject) => {
      const video = getVideo();
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`Fail to load image: ${url}`));
      }, TIMEOUT);

      const cleanup = () => {
        video.onloadedmetadata = null;
        video.onerror = null;
        video.src = '';
        clearTimeout(timeout);
        releaseVideo(video);
      };

      video.onloadedmetadata = () => {
        const dimension = {
          width: video.videoWidth,
          height: video.videoHeight,
        };
        cleanup();
        resolve(dimension);
      };
      video.onerror = () => {
        cleanup();
        reject(new Error(`Fail to load image: ${url}`));
      };

      video.src = url;
    });
  }
}
