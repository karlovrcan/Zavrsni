import {
  PLAY_SONG_REQUEST,
  PAUSE_SONG_REQUEST,
  PLAY_MASTER,
  PAUSE_MASTER,
} from "../Constants/SongConstant";

export const songReducer = (
  state = { mainSong: {}, isPlaying: false },
  action
) => {
  switch (action.type) {
    case PLAY_SONG_REQUEST:
      return { ...state, mainSong: action.payload, isPlaying: true };
    case PAUSE_SONG_REQUEST:
      return { ...state, isPlaying: true };
    default:
      return state;
  }
};
