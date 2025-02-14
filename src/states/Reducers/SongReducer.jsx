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
    case PLAY_SONG_REQUEST:
      if (state.masterSong && state.masterSong.mp3) {
        state.masterSong.mp3.pause();
        state.masterSong.mp3.currentTime = 0;
      }
      return {
        ...state,
        masterSong: action.payload,
        isPlaying: true,
      };
    case PAUSE_SONG_REQUEST:
      if (state.masterSong && state.masterSong.mp3) {
        state.masterSong.mp3.pause();
      }
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
