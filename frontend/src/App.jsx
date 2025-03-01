import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Search from "./components/Search/Search";
import Navbar from "./components/Navbar";

import { Provider } from "react-redux";
import store from "./states/store";
import { AppProvider } from "./states/Content";
import { toast, ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LayoutWithNavbar() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

const App = () => {
  return (
    <Provider store={store}>
      <AppProvider>
        <Router>
          <Routes>
            <Route element={<LayoutWithNavbar />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Router>

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition={Bounce}
        />
      </AppProvider>
    </Provider>
  );
};

export default App;
