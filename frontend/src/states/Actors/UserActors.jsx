import {USER_LOGGED_IN, USER_ABOUT} from "../Constants/UserConstant";

export const userActor = (user) => {
  return { type: USER_LOGGED_IN, payload: user };
};

export const getUser = (user) => {
  return { type: USER_ABOUT, payload: user };
};