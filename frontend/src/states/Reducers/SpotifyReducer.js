const initialState = {
  accessToken: sessionStorage.getItem("spotify_access_token") || null, // ✅ Retrieve from sessionStorage
  deviceId: null, // ✅ Store deviceId
};

export const spotifyReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_SPOTIFY_ACCESS_TOKEN":
      sessionStorage.setItem("spotify_access_token", action.payload); // ✅ Store in sessionStorage
      return { ...state, accessToken: action.payload };

    case "SET_SPOTIFY_DEVICE_ID":
      return { ...state, deviceId: action.payload };

    default:
      return state;
  }
};
