import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import App from "./components/App";
import { setupFpsOverlayInDev } from "./components/utils";

import * as serviceWorker from "./serviceWorker";
import store from "./store";
import { initSocketToServer } from "./services/helpers";
import "./statics/index.css";

import * as Sentry from "@sentry/browser";

// SETUP ANALYTICS
import "./analystics";
import { isBuildTestEnv, isBuildProductionEnv } from "./environment";

if (isBuildTestEnv() || isBuildProductionEnv()) setupFpsOverlayInDev();
initSocketToServer();

ReactDOM.render(
  // <React.StrictMode>
  <Provider store={store}>
    <App />
  </Provider>,
  // </React.StrictMode>,
  document.getElementById("root")
);

// TODONOW: remove service worker
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
