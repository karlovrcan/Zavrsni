import {
  USER_LOGGED_IN,
  USER_LOGGED_OUT,
  USER_ABOUT,
} from "../Constants/UserConstant";

const initialState = {
  user: {},
  isAuthenticated: false,
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_LOGGED_IN:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };

    case USER_LOGGED_OUT:
      return {
        ...state,
        user: {},
        isAuthenticated: false,
      };

    case USER_ABOUT:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: false,
      };

    default:
      return state;
  }
};
