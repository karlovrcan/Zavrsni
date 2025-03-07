import { createStore, combineReducers, applyMiddleware } from "redux";
import { thunk } from "redux-thunk"; // Correct import of thunk
import { composeWithDevTools } from "redux-devtools-extension";
import { songReducer } from "./Reducers/SongReducer";
import { userReducer } from "./Reducers/UserReducer";
import { spotifyReducer } from "./Reducers/SpotifyReducer"; // Add Spotify Reducer

const initialState = {
  account: {
    user: {},
    token: sessionStorage.getItem("token") || null,
    isAuthenticated: !!sessionStorage.getItem("token"),
  },
  spotify: {
    accessToken: sessionStorage.getItem("spotify_access_token") || null,
  },
};

const reducer = combineReducers({
  mainSong: songReducer,
  account: userReducer,
  spotify: spotifyReducer, // Add Spotify Reducer
});

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(thunk)) // Correct usage of applyMiddleware with thunk
);

export default store;
