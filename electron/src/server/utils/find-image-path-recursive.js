const readdirp = require("readdirp");
const logFunctionPerf = require("./log-function-perf");

const {
  trackCreatedProjectImages,
  trackCreatedProjectSize,
} = require("../analytics/googleAnalytics");

/**
 * Recursively find all the image paths inside the folderPath
 *
 * @param {String} folderPath
 * @returns {Promise<String[]>} image paths list
 */
async function recursivelyFindImages(folderPath) {
  let imagePathsList = [];
  let projectSize = 0;

  var settings = {
    // Filter files with png and jpeg extension
    fileFilter: ["*.png", "*.PNG", "*.jpg", "*.JPG", "*.jpeg", "*.JPEG"],
    // Filter by directory
    directoryFilter: ["!.git", "!*modules", "!.cache", "!.*"],
    alwaysStat: true,
  };

  try {
    for await (const entry of readdirp(folderPath, settings)) {
      const {
        path,
        stats: { size },
      } = entry;

      // in windows, files read as bigint. in linux, as number
      const normalizedSize = typeof size === "bigint" ? Number(size) : size;
      projectSize += normalizedSize;

      imagePathsList.push(`${folderPath}/${path}`);
    }

    trackCreatedProjectImages(imagePathsList.length);
    trackCreatedProjectSize(Math.round(projectSize / 1000000));
  } catch (e) {
    // TODONOW: Sentry: send error.
    // Error reading folders
    console.log(e);
  }

  trackCreatedProjectImages(imagePathsList.length);
  trackCreatedProjectSize(Math.round(projectSize / 1000000));

  return imagePathsList;
}

module.exports = {
  recursivelyFindImages: logFunctionPerf(recursivelyFindImages),
};