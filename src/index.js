import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import App from "./App.js";
import { Provider } from "react-redux";
import store from "./app/store";
import background from "../assets/background.jpg";

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,

  document.getElementById("app-container")
);
