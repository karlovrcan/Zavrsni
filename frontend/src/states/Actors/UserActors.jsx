import {
  USER_LOGGED_IN,
  USER_ABOUT,
  USER_LOGGED_OUT,
} from "../Constants/UserConstant";

export const userActor = (user, token) => {
  sessionStorage.setItem("token", token);
  return { type: USER_LOGGED_IN, payload: { user, token } };
};

export const userLogout = () => {
  sessionStorage.removeItem("token");
  return { type: USER_LOGGED_OUT };
};

export const getUser = (user) => {
  return { type: USER_ABOUT, payload: user };
};

export const updateUserProfile = (updatedUser) => ({
  type: "UPDATE_USER_PROFILE",
  payload: updatedUser,
});
