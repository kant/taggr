const { remote } = require("electron");
const { observable, observe } = require("@nx-js/observer-util");
const path = require("path");

const {
  recursivelyFindImages,
  constructImageMap,
  constructImageTags,
  generateMD5Hash,
} = require("./utils");

const { loadModel } = require("./imageRecognition");

const { dialog } = remote;

// TODONOW: use reactive classes to declare UI parts, and trigger re-renders

// Global state, reactive with https://github.com/nx-js/observer-util
let state = observable({
  appState: "OPEN", // ['OPEN', 'READY']
  rootFolderPath: null,
  imagePathsList: [],
  imageHashMap: {},
});

// Buttons
const testButton = document.getElementById("testButton");
testButton.onclick = () => counter.num++;

const selectImageFolderPathBtn = document.getElementById(
  "selectImageFolderBtn"
);

selectImageFolderPathBtn.onclick = async () => {
  state.rootFolderPath = await selectRootFolderPath();

  state.imagePathsList = await recursivelyFindImages(state.rootFolderPath);
  // console.log(state);
  state.imageHashMap = await constructImageMap(state.imagePathsList);
  // console.log(state);
  // console.log("///");
  // console.log(state.imageHashMap);

  // state.imageHashMap = await constructImageTags(state.imageHashMap);
  for (var key of Object.keys(state.imageHashMap)) {
    const imagePath = state.imageHashMap[key].path;
    imageTaggingWorker.postMessage({
      path: imagePath,
    });
  }
};

// UI
const currentImageFolderPath = document.getElementById(
  "currentImageFolderPath"
);
const imagesList = document.getElementById("imagesList");

// Render loop, update UI based on state changes
const renderLoop = observe(() => {
  // console.time("renderLoop");

  // update title
  currentImageFolderPath.innerHTML = state.rootFolderPath
    ? state.rootFolderPath
    : "";

  imagesList.innerHTML = null;
  Object.keys(state.imageHashMap).forEach((key) => {
    const imagePath = state.imageHashMap[key].path;
    const imageTags = state.imageHashMap[key].tags;

    const li = document.createElement("li");
    li.appendChild(document.createTextNode(`${imagePath} : [${imageTags}]`));
    imagesList.appendChild(li);
  });
});

/**
 * Open dialog to select root folder path
 *
 * @returns {String} root folder path | undefined
 */
async function selectRootFolderPath() {
  let rootFolderPath = null;

  const { filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (filePaths) {
    rootFolderPath = filePaths[0];
  }

  return rootFolderPath;
}

// web workers
const imageTaggingWorker = new Worker(
  path.resolve(__dirname, "workers/imageTaggingWorker.js")
);

imageTaggingWorker.onmessage = ({ data }) => {
  const imagePath = data.path;
  const imageTags = data.tags;
  const imageHash = generateMD5Hash(imagePath);

  state.imageHashMap[imageHash] = { path: imagePath, tags: imageTags };
};
