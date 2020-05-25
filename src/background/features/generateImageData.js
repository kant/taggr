/**
 * Generate a ImageData structure from a imagePath. Prepocess using Canvas to algorithm input: 224px
 *
 * @param {HTMLImageElement} img
 * @returns {Promise<ImageData>} loaded image
 */
const generateImageData = async (img, dataHeight = null) => {
  if (dataHeight) {
    // calculate new ratios for image size, based on MAX_HEIGHT
    if (img.height > dataHeight) {
      img.width *= dataHeight / img.height;
      img.height = dataHeight;
    }
  }

  // console.time("transformInCanvas");
  let canvas = new OffscreenCanvas(img.width, img.height);
  let ctx = canvas.getContext("2d");
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height);

  const imageData = canvas
    .getContext("2d")
    .getImageData(0, 0, img.width, img.height);

  // console.timeEnd("transformInCanvas");

  // clean up
  canvas = null;
  ctx = null;

  return imageData;
};

/**
 * Load image using DOM Image element
 *
 * @param {String} path
 * @returns {Promise<HTMLImageElement>} loaded image
 */
export const loadImage = async (path) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = (err) => reject(err);
    img.onload = () => resolve(img);
    img.src = path;
  });
};

export default generateImageData;
