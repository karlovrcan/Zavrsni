import React, {
  createContext,
  useState,
  useRef,
  useContext,
  useEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecommendedSongs } from "../api/spotifyService";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [currTime, setCurrTime] = useState("00:00");
  const [songIndex, setSongIndex] = useState(0);
  const [songs, setSongs] = useState([]);
  const [recommendedSongs, setRecommendedSongs] = useState([]);

  const audioRef = useRef(new Audio());
  const intervalRef = useRef(null);
  const dispatch = useDispatch();

  // ✅ Get Access Token & Device ID from Redux
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const deviceId = useSelector((state) => state.spotify.deviceId);

  // ✅ Play/Pause Song
  const playPauseSong = async (song) => {
    if (!song || !song.uri || !song.id) {
      console.error("❌ Invalid song provided:", song);
      return;
    }

    console.log("🎵 Playing:", song.name, "| Track ID:", song.id);

    setCurrentSong(song);
    setIsPlaying(true);

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [song.uri] }),
        }
      );

      // ✅ Fetch recommendations only if the song is not in a playlist
      if (songs.length === 0) {
        console.log("📡 Fetching recommendations for:", song.id);
        getRecommendedSongs(song.id);
      }
    } catch (error) {
      console.error("❌ Error playing song:", error);
    }
  };

  // ✅ Fetch Recommended Songs (Now using `spotifyService.js`)
  const getRecommendedSongs = async (seedTrackId) => {
    if (!accessToken) {
      console.warn("⚠️ No Spotify access token available.");
      return;
    }

    if (!seedTrackId || seedTrackId.length !== 22) {
      console.warn("⚠️ Invalid seed track ID:", seedTrackId);
      return;
    }

    console.log("📡 Calling fetchRecommendedSongs with:", seedTrackId);

    const recommendations = await fetchRecommendedSongs(
      seedTrackId,
      accessToken
    );
    setRecommendedSongs(recommendations);
  };

  // ✅ Next Song Logic
  const nextSong = async () => {
    let nextTrack = null;

    if (songs.length > 0 && songIndex < songs.length - 1) {
      nextTrack = songs[songIndex + 1];
      setSongIndex(songIndex + 1);
    } else if (recommendedSongs.length > 0) {
      nextTrack = recommendedSongs[0];
      setRecommendedSongs((prev) => prev.slice(1));
    } else if (currentSong && currentSong.id && recommendedSongs.length === 0) {
      console.log("🔄 Fetching new recommendations...");
      await getRecommendedSongs(currentSong.id);
      return;
    }

    playPauseSong(nextTrack);
  };

  // ✅ Previous Song Logic
  const prevSong = () => {
    if (songs.length === 0) return;

    const prevIndex = songIndex > 0 ? songIndex - 1 : 0;
    setSongIndex(prevIndex);
    playPauseSong(songs[prevIndex]);
  };

  // ✅ Update Progress Bar
  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current && !isNaN(audioRef.current.duration)) {
        setProgress(
          (audioRef.current.currentTime / audioRef.current.duration) * 100
        );
        setCurrTime(formatTime(audioRef.current.currentTime));
        setDuration(formatTime(audioRef.current.duration));
      }
    };

    if (isPlaying) {
      intervalRef.current = setInterval(updateProgress, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  const changeProgress = (e) => {
    if (!audioRef.current) return;

    const newProgress = e.target.value;
    setProgress(newProgress);

    if (audioRef.current.duration) {
      audioRef.current.currentTime =
        (newProgress / 100) * audioRef.current.duration;
    }
  };

  const changeVolume = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // ✅ Format Time
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ✅ Toggle Play/Pause
  const togglePlayPause = async () => {
    if (!deviceId) return;

    try {
      const endpoint = isPlaying ? "pause" : "play";
      await fetch(
        `https://api.spotify.com/v1/me/player/${endpoint}?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("❌ Error toggling playback:", error);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        playPauseSong,
        togglePlayPause,
        progress,
        changeProgress,
        currTime,
        duration,
        changeVolume,
        volume,
        nextSong,
        prevSong,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
