import { sendToRendererThrottled } from "../services/utils";
import generateImageData from "./generateImageData";
import { classifyImage } from "./classifyImage";
import { getStopFlow } from "../store";

import { setTask } from "../../renderer/store";

/**
 * Generate the tags for all the untaged images in the imageHashMap
 * Notifies task state to renderer
 * @param {Object} sourceImageHashMap
 */
const generateTags = async (sourceImageHashMap) => {
  if (getStopFlow()) return;

  const imageHashMap = {};

  const imageHasesToProcess = getImagesWithoutTags(sourceImageHashMap);

  let totalImagesToTag = imageHasesToProcess.length;
  let imagesTagged = 0;

  console.time("processImages");

  while (imageHasesToProcess.length > 0) {
    let hash = imageHasesToProcess.pop();

    try {
      if (getStopFlow()) return;

      console.time("generateImageData");
      let imageData = await generateImageData(sourceImageHashMap[hash].path);
      console.timeEnd("generateImageData");

      console.time("classifyImage");
      let tags = await classifyImage(imageData);
      console.timeEnd("classifyImage");

      imageHashMap[hash] = {
        ...sourceImageHashMap[hash],
        tags: tags ? tags : [],
      };

      console.log(`Processing: ${imagesTagged++} / ${totalImagesToTag}`);
      console.log(sourceImageHashMap[hash].path);

      // clean up
      hash = null;
      imageData = null;
      tags = null;

      // update task status
      // TODONOW: fix: since the whole main page is connected to the store, it re-renders every time a new notification comes.
      // SOLUTION: connect the notification component directly to the store.
      sendToRendererThrottled({
        type: setTask.type,
        payload: {
          percentage: Math.floor((imagesTagged * 100) / totalImagesToTag),
        },
      });
    } catch (e) {
      console.error(sourceImageHashMap[hash].path);
    }
  }
  console.timeEnd("processImages");

  return imageHashMap;
};

/**
 * Returns the images hashes of the images that dont have tags
 * @param {Object} imageHashMap
 * @returns {string[]} list of image hashes without tags
 */
const getImagesWithoutTags = (imageHashMap) => {
  let imageHashListToProcess = [];
  Object.keys(imageHashMap).forEach((key) => {
    const image = imageHashMap[key];
    if (image.tags === null) {
      imageHashListToProcess.push(key);
    }
  });

  return imageHashListToProcess;
};

export default generateTags;
