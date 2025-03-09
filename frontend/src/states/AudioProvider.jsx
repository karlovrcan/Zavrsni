import React, {
  createContext,
  useState,
  useRef,
  useContext,
  useEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [currTime, setCurrTime] = useState("00:00");
  const [songIndex, setSongIndex] = useState(0);
  const [songs, setSongs] = useState([]); // Playlist or search results
  const [recommendedSongs, setRecommendedSongs] = useState([]); // Recommended tracks

  const audioRef = useRef(new Audio());
  const intervalRef = useRef(null);
  const dispatch = useDispatch();

  // ✅ Use `deviceId` from Redux (since it's handled in App.jsx)
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const deviceId = useSelector((state) => state.spotify.deviceId);

  // ✅ Play/Pause Song
  const playPauseSong = async (song) => {
    if (!song || !song.uri) {
      console.error("❌ Invalid song provided:", song);
      return;
    }

    console.log(
      `🎵 Playing: ${song.name} (ID: ${song.id}) on device: ${deviceId}`
    );

    // ✅ Ensure the song is set first before playing
    setCurrentSong(song);
    setIsPlaying(true);

    try {
      const playRes = await fetch(
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

      if (!playRes.ok) {
        console.error(`⚠️ Failed to play song: ${playRes.status}`);
        return;
      }

      // ✅ Fetch recommendations *only if the song is not in a playlist*
      if (songs.length === 0) {
        fetchRecommendedSongs(song.id);
      }
    } catch (error) {
      console.error("❌ Error playing song:", error);
    }
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
      await fetchRecommendedSongs(currentSong.id); // Fetch once only
      return;
    } else {
      console.warn("⚠️ No songs or recommendations available.");
      return;
    }

    console.log("🎶 Next Song:", nextTrack?.name);
    playPauseSong(nextTrack);
  };

  // ✅ Previous Song Logic
  const prevSong = () => {
    if (songs.length === 0) return;

    const prevIndex = songIndex > 0 ? songIndex - 1 : 0;
    setSongIndex(prevIndex);
    playPauseSong(songs[prevIndex]);
  };

  // ✅ Fetch Recommended Songs
  const fetchRecommendedSongs = async (seedTrackId) => {
    if (!accessToken || !seedTrackId) {
      console.warn("⚠️ No access token or seed track ID.");
      return;
    }

    if (!currentSong || !currentSong.id) {
      console.error("❌ No valid current song found for recommendations.");
      return;
    }

    try {
      console.log("📡 Fetching recommendations for:", seedTrackId);
      const res = await fetch(
        `https://api.spotify.com/v1/recommendations?seed_tracks=${seedTrackId}&limit=5`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok) {
        console.error(`⚠️ Spotify API Error: ${res.status} ${res.statusText}`);
        return;
      }

      const data = await res.json();
      if (!data.tracks || data.tracks.length === 0) {
        console.warn("⚠️ No recommendations found.");
        return;
      }

      setRecommendedSongs(data.tracks);
      console.log("🎵 Recommended Songs:", data.tracks);
    } catch (error) {
      console.error("❌ Error fetching recommended songs:", error);
    }
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
