// I need to fix my 2FA access
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
// Store
import Store from "./store/store";
import { Provider } from "mobx-react";

const Root = (
  <Provider store={Store}>
    <App />
  </Provider>
);

ReactDOM.render(Root, document.getElementById("root"));
registerServiceWorker();
