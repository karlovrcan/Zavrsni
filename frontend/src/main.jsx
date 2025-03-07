import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./states/store"; // ✅ Import Redux store
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    {" "}
    {/* ✅ Wrap the entire app with Provider */}
    <App />
  </Provider>
);
