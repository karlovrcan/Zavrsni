import {
  USER_LOGGED_IN,
  USER_LOGGED_OUT,
  USER_ABOUT,
} from "../Constants/UserConstant";

const initialState = {
  user: {},
  token: sessionStorage.getItem("token") || null,
  isAuthenticated: !!sessionStorage.getItem("token"),
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_LOGGED_IN:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };

    case USER_LOGGED_OUT:
      return {
        ...state,
        user: {},
        token: null,
        isAuthenticated: false,
      };

    case USER_ABOUT:
      return {
        ...state,
        user: action.payload,
      };
    case "UPDATE_USER_PROFILE":
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
};
