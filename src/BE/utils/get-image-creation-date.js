import get from "lodash.get";
const fs = require("fs");
const { promisify } = require("util");
const readStats = promisify(fs.stat);
const ExifImage = require("exif").ExifImage;

/**
 * Load EXIF data from path.
 * @param {string} path
 */
const loadEXIFData = (path) => {
  return new Promise((resolve) => {
    new ExifImage(path, (err, data) => {
      resolve(data);
    });
  });
};

/**
 * Transform string to UTC EPOCH time. Uses local timezone for conversion.
 *
 * @param {string} exifDateString ex. "2013:01:01 01:01:01"
 */
const exifDateStringToDate = (exifDateString) => {
  if (!exifDateString) return null;

  var str = exifDateString.split(" ");
  //get date part and replace ':' with '-'
  var dateStr = str[0].replace(/:/g, "-");
  //concat the strings (date and time part)
  var properDateStr = dateStr + " " + str[1];
  //pass to Date
  var date = new Date(properDateStr);
  return date.getTime();
};

/**
 * Get file creation date in UNIX EPOCH
 *
 * @param {string} path
 * @returns {Promise<number|null>}
 */
async function getImageCreationDate(path) {
  const exifData = await loadEXIFData(path);
  const exifDateTimeOriginal = get(exifData, "exif.DateTimeOriginal", null);
  const exifCreateDate = get(exifData, "exif.CreateDate", null);
  const exifModifyDate = get(exifData, "image.ModifyDate", null);

  if (exifDateTimeOriginal) {
    return exifDateStringToDate(exifDateTimeOriginal);
  }

  if (exifCreateDate) {
    return exifDateStringToDate(exifCreateDate);
  }

  if (exifModifyDate) {
    return exifDateStringToDate(exifModifyDate);
  }

  const fsStats = await readStats(path);
  const birthtime = get(fsStats, "birthtime", null);
  // the birthtime can be epoch 0, then check the mtime
  if (birthtime && birthtime !== 0) return birthtime.getTime();

  const mtime = get(fsStats, "mtime", null);
  if (mtime && mtime !== 0) return mtime.getTime();

  return null;
}

export default getImageCreationDate;
