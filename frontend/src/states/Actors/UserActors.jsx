import {
  USER_LOGGED_IN,
  USER_ABOUT,
  USER_LOGGED_OUT,
} from "../Constants/UserConstant";

// 🔹 Log In User & Store Token
export const userActor = (user, token) => {
  sessionStorage.setItem("token", token); // Store token securely
  return { type: USER_LOGGED_IN, payload: { user, token } };
};

// 🔹 Log Out User & Remove Token
export const userLogout = () => {
  sessionStorage.removeItem("token"); // Clear token on logout
  return { type: USER_LOGGED_OUT };
};

// 🔹 Get User Information
export const getUser = (user) => {
  return { type: USER_ABOUT, payload: user };
};
