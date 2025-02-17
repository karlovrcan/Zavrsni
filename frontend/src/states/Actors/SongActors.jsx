import {
  PLAY_SONG_REQUEST,
  PAUSE_SONG_REQUEST,
  PLAY_MASTER,
  PAUSE_MASTER,
} from "../Constants/SongConstant";

export const playSong = (song) => {
  return { type: PLAY_SONG_REQUEST, payload: song };
};

export const pauseSong = () => {
  return { type: PAUSE_SONG_REQUEST };
};

export const playMaster = () => (dispatch, getState) => {
  const { masterSong } = getState().mainSong;
  if (masterSong && masterSong.mp3) {
    masterSong.mp3.play().catch((err) => console.error("Play Error:", err));
  }
  dispatch({ type: PLAY_MASTER });
};

export const pauseMaster = () => (dispatch, getState) => {
  const { masterSong } = getState().mainSong;
  if (masterSong && masterSong.mp3) {
    masterSong.mp3.pause();
  }
  dispatch({ type: PAUSE_MASTER });
};
