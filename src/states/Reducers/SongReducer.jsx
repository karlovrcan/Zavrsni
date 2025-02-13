import {
  PLAY_SONG_REQUEST,
  PAUSE_SONG_REQUEST,
  PAUSE_MASTER,
  PLAY_MASTER,
} from "../Constants/SongConstant";

const initialState = {
  masterSong: null,
  isPlaying: false,
};

export const songReducer = (state = initialState, action) => {
  switch (action.type) {
    case PLAY_SONG_REQUEST:
      return {
        ...state,
        masterSong: action.payload,
        isPlaying: true,
      };
    case PAUSE_SONG_REQUEST:
      return {
        ...state,
        isPlaying: false,
      };
    case PLAY_MASTER:
      return {
        ...state,
        isPlaying: true,
      };
    case PAUSE_MASTER:
      return {
        ...state,
        isPlaying: false,
      };
    default:
      return state;
  }
};
