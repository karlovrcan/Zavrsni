import {
  PLAY_SONG_REQUEST,
  PAUSE_SONG_REQUEST,
  PLAY_MASTER,
  PAUSE_MASTER,
} from "../Constants/SongConstant";

const initialState = {
  masterSong: null,
  isPlaying: false,
};

export const songReducer = (state = initialState, action) => {
  switch (action.type) {
    case "PLAY_SONG_REQUEST":
      return {
        masterSong: action.payload, // Set the current song
        isPlaying: true, // Set the song as playing
      };
    case "PAUSE_SONG_REQUEST":
      return {
        ...state,
        isPlaying: false, // Set the song as paused
      };
    default:
      return state;
  }
};
