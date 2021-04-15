import MESSAGES_PASSING from "../shared/message-passing";
import ROUTES from "../shared/fe-routes";
import { ImageFactory, ImageHashMapFactory } from "../shared/entities";

import messageHandler from "./message-handler";

import generateFileHash from "./utils/generate-file-hash";
import normalizePath from "./utils/normalize-path";
// const filesystem = require("../filesystem");
// const db = require("../db");
// const { filterImages } = require("./filter");
// const image = require("../image");

// entities
// const Image = require("../entities/Image");

// // utils
// const { recursivelyFindImages } = require("../utils/find-image-path-recursive");
// const logFunctionPerf = require("../utils/log-function-perf");
// const generateFileHash = require("../utils/generate-hash");

import findImagePaths from "./utils/find-images-in-path";
import preProcessImages from "./utils/pre-process-images";
import envPaths from "./utils/env-paths";

/**
 * Transfrom the imageHashMap to imageList
 *
 * @param {ImageHashMapType|{}} imageHashMap
 * @returns {Object[]} imageList
 */
function transformImageMaptoImageList(imageHashMap) {
  return Object.keys(imageHashMap).map((key) => ({
    ...imageHashMap[key],
  }));
}

/**
 * Cental entity in the BE.
 * Holds the business logic.
 */
class Project {
  constructor() {
    this.imageMap = ImageHashMapFactory();
  }

  /**
   * Initialize taggr project
   * @param {string} rootPath
   */
  async create(rootPath) {
    console.log("[BE] create: ", rootPath);

    // 0. update FE route
    messageHandler.postMessage(
      MESSAGES_PASSING.MESSAGES.setRoute(ROUTES.PROCESSING_PAGE)
    );

    // 1. Locate image paths in project
    const imagePathsInProject = await findImagePaths(rootPath);

    // 2. Generate in memory structure, and calculate the file hashes
    for (const imagePath of imagePathsInProject) {
      const hash = await generateFileHash(imagePath);
      this.imageMap[hash] = ImageFactory({
        hash,
        path: normalizePath(imagePath),
        rawPath: imagePath,
        tags: null,
        location: null,
      });
    }

    console.log("this.imageMap");
    console.log(this.imageMap);

    // 3. Optimize images
    console.time("preProcessImages");
    await preProcessImages(this.imageMap, envPaths.data);
    console.timeEnd("preProcessImages");
    return;

    // 4. Store images in DB
    // Object.keys(this.imageMap).forEach((key) => {
    //   db.saveImage(this.imageMap[key]);
    // });
    // console.log(await db.getImages());

    // populate FE
    services.services.updateImages({
      images: transformImageMaptoImageList(this.imageMap),
      imagesWithLocation: [],
    });

    services.services.setRoute("DASHBOARD_PAGE");

    this.isProcessingActive = false;

    // Projecs ML of images
    this.process();
  }

  /**
   * ML the shit out of the images
   */
  async process() {
    // TODONOW: diff to only process the non stored ones
    const imageHashToProcess = Object.keys(this.imageMap);

    const toProcess = Object.keys(this.imageMap).length;

    for (const hash of imageHashToProcess) {
      console.log(await image.process(this.imageMap[hash].rawPath));
    }
    return;
    while (this.isProcessingActive && imagePathsToProcess.length) {
      //   const imagePath = imagePathsToProcess.shift();
      //   const hash = filesystem.generateMD5HashFromString(imagePath);

      services.services.updateTask({
        name: `Processing ${toProcess} memories!`,
        isOngoing: true,
        percentage: Math.ceil(
          ((toProcess - imagePathsToProcess.length) * 100) / toProcess
        ),
      });

      imageHashMap[hash] = {
        ...imageHashMap[hash],
        ...(await image.process(imagePath)),
      };
    }

    if (!this.isProcessingActive) return;

    services.services.updateTask({
      isOngoing: false,
    });

    // send location pictures
    services.services.updateImages({
      images: transformImageMaptoImageList(imageHashMap),
      imagesWithLocation: transformImageMaptoImageList(
        store.getImagesWithLocation()
      ),
    });
  }

  /**
   * Filter images
   *
   * @param {FilterType} filters
   * @returns {{images: ImageType[], imagesWithLocation: ImageType[]}} images
   */
  filterImages(filters) {
    return filterImages(this.imageMap, filters);
  }

  destroy() {
    // reset project
  }
}

export default new Project();
