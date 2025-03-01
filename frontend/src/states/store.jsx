import { createStore, combineReducers, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { songReducer } from "./Reducers/SongReducer";
import { userReducer } from "./Reducers/UserReducer";

const initialState = {};

const reducer = combineReducers({
  mainSong: songReducer,
  account: userReducer,
});

// const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(thunk))
);

export default store;
