import {
  USER_LOGGED_IN,
  USER_ABOUT,
  USER_LOGGED_OUT,
} from "../Constants/UserConstant";

export const userActor = (user) => {
  return { type: USER_LOGGED_IN, payload: user };
};

export const userLogout = () => {
  return { type: USER_LOGGED_OUT };
};

export const getUser = (user) => {
  return { type: USER_ABOUT, payload: user };
};
