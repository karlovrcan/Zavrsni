import React, {
  createContext,
  useState,
  useRef,
  useContext,
  useEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecommendedSongs } from "../api/spotifyService";
import { setSpotifyDeviceId } from "../states/Actions/SpotifyActions";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const dispatch = useDispatch();

  const accessToken = useSelector((state) => state.spotify.accessToken);
  const token = useSelector((state) => state.account.token);

  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [progress, setProgress] = useState(0);
  const [currTime, setCurrTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [durationMs, setDurationMs] = useState(0);

  const [localProgress, setLocalProgress] = useState(0);
  const [localCurrTime, setLocalCurrTime] = useState(0);

  const [volume, setVolume] = useState(50);

  const [activeQueue, setActiveQueue] = useState([]);
  const [songIndex, setSongIndex] = useState(0);

  const [recommendedSongs, setRecommendedSongs] = useState([]);

  const [isShuffling, setIsShuffling] = useState(false);
  const [originalSongs, setOriginalSongs] = useState([]);

  const [currentPlaylistId, setCurrentPlaylistId] = useState(null);

  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  const [deviceId, setDeviceId] = useState(null);
  const playerRef = useRef(null);
  const hasAdvancedRef = useRef(false);

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const loadQueue = (newSongsArray, playlistId) => {
    if (!Array.isArray(newSongsArray) || newSongsArray.length === 0) {
      console.warn("loadQueue was given an empty or invalid songs array.");
      return;
    }
    setActiveQueue(newSongsArray);
    setOriginalSongs(newSongsArray);
    setSongIndex(0);
    setCurrentPlaylistId(playlistId || null);
    setIsShuffling(false);
  };

  const getRecommendedSongs = async (seeds) => {
    if (!accessToken) {
      console.warn("Missing access token or seeds for getRecommendedSongs.");
      return [];
    }
    if (!seeds || (!seeds.trackId && !seeds.artistId && !seeds.genres)) {
      console.warn(
        "No valid seeds provided. Must pass at least trackId, artistId, or genres."
      );
      return [];
    }
    console.log("🎧 getRecommendedSongs with seeds:", seeds);
    const recommended = await fetchRecommendedSongs(seeds, accessToken);
    setRecommendedSongs(recommended);
    return recommended;
  };

  const nextSong = async () => {
    let nextTrack = null;

    if (activeQueue.length > 0 && songIndex < activeQueue.length - 1) {
      nextTrack = activeQueue[songIndex + 1];
      setSongIndex(songIndex + 1);
    } else if (recommendedSongs.length > 0) {
      nextTrack = recommendedSongs[0];
      setRecommendedSongs((prev) => prev.slice(1));
    } else if (currentSong?.id && recommendedSongs.length === 0) {
      console.log("🔄 Fetching new recommendations for:", currentSong.id);
      await getRecommendedSongs({ trackId: currentSong.id });
      return;
    }

    if (nextTrack) {
      playPauseSong(nextTrack);
    }
  };

  const prevSong = () => {
    if (activeQueue.length === 0) return;
    const prevIndex = songIndex > 0 ? songIndex - 1 : 0;
    setSongIndex(prevIndex);

    if (activeQueue[prevIndex]) {
      playPauseSong(activeQueue[prevIndex]);
    }
  };

  const shuffleSongs = () => {
    if (!activeQueue || activeQueue.length <= 1) return;
    if (!currentSong || !currentPlaylistId) return;

    if (!isShuffling) {
      setOriginalSongs(activeQueue);

      const shuffled = [...activeQueue].sort(() => Math.random() - 0.5);
      const currentIndex = shuffled.findIndex((s) => s.uri === currentSong.uri);
      setActiveQueue(shuffled);
      setSongIndex(currentIndex !== -1 ? currentIndex : 0);

      setIsShuffling(true);
      setShuffleStatus(currentPlaylistId, true);
    } else {
      const currentSongIndexInOriginal = originalSongs.findIndex(
        (s) => s.uri === currentSong.uri
      );
      setActiveQueue(originalSongs);
      setSongIndex(
        currentSongIndexInOriginal !== -1 ? currentSongIndexInOriginal : 0
      );

      setIsShuffling(false);
      setShuffleStatus(currentPlaylistId, false);
    }
  };

  const getShuffleStatus = (playlistId) => {
    const saved = localStorage.getItem("shuffledPlaylists");
    const parsed = saved ? JSON.parse(saved) : {};
    return parsed[playlistId] === true;
  };

  const setShuffleStatus = (playlistId, value) => {
    const saved = localStorage.getItem("shuffledPlaylists");
    const parsed = saved ? JSON.parse(saved) : {};
    parsed[playlistId] = value;
    localStorage.setItem("shuffledPlaylists", JSON.stringify(parsed));
  };

  useEffect(() => {
    if (!accessToken) return;
    if (playerRef.current) return;

    if (!window.Spotify) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      script.onload = initializePlayer;
      document.body.appendChild(script);
    } else {
      initializePlayer();
    }

    function initializePlayer() {
      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: "My Spotify Web Player",
          getOAuthToken: (cb) => cb(accessToken),
          volume: 1.0,
        });

        playerRef.current = player;

        player.addListener("ready", ({ device_id }) => {
          console.log("✅ Player Ready with deviceId:", device_id);
          setDeviceId(device_id);
          dispatch(setSpotifyDeviceId(device_id));
        });

        player.addListener("not_ready", ({ device_id }) => {
          console.warn("⚠️ Device offline:", device_id);
        });

        player.addListener("initialization_error", (e) =>
          console.error("Init error:", e)
        );
        player.addListener("authentication_error", (e) =>
          console.error("Auth error:", e)
        );
        player.addListener("account_error", (e) =>
          console.error("Account error:", e)
        );

        player.addListener("player_state_changed", (state) => {
          if (!state || !state.track_window?.current_track) return;

          const { position, paused, duration: fallbackDuration } = state;
          const track = state.track_window.current_track;
          const trackDurationMs = track.duration_ms || fallbackDuration;

          setIsPlaying(!paused);
          setDurationMs(trackDurationMs);
          setCurrTime(formatTime(position / 1000));
          setDuration(formatTime(trackDurationMs / 1000));

          setProgress((position / trackDurationMs) * 100);
          setLocalCurrTime(position);
          setLocalProgress((position / trackDurationMs) * 100);

          setCurrentSong({
            id: track.id,
            uri: track.uri,
            name: track.name,
            albumCover: track.album.images?.[0]?.url || "",
            artists: track.artists,
            duration_ms: trackDurationMs,
          });

          if (
            !paused &&
            trackDurationMs - position < 1000 &&
            !hasAdvancedRef.current
          ) {
            hasAdvancedRef.current = true;
            nextSong();
            setTimeout(() => {
              hasAdvancedRef.current = false;
            }, 2000);
          }
        });

        player.connect().then((success) => {
          if (success) {
            console.log("✅ Connected to Web Playback SDK!");
          } else {
            console.error("❌ Failed to connect!");
          }
        });
      };
    }

    return () => {
      if (playerRef.current) {
        console.log("🛑 Disconnecting Spotify player...");
        playerRef.current.disconnect();
      }
    };
  }, [accessToken, dispatch]);

  useEffect(() => {
    let localInterval = null;

    if (isPlaying) {
      localInterval = setInterval(() => {
        setLocalCurrTime((prevMs) => {
          const nextMs = prevMs + 1000;

          let nextProgress = 0;
          if (durationMs > 0) {
            nextProgress = (nextMs / durationMs) * 100;
          }
          setLocalProgress(nextProgress);

          if (durationMs && nextMs >= durationMs - 1000) {
            nextSong();
          }
          return nextMs;
        });
      }, 1000);
    }

    return () => {
      if (localInterval) clearInterval(localInterval);
    };
  }, [isPlaying, durationMs]);

  const prevTrackRef = useRef(null);

  useEffect(() => {
    if (!currentSong?.id) return;
    if (prevTrackRef.current !== currentSong.id) {
      setLocalCurrTime(0);
      setLocalProgress(0);
      prevTrackRef.current = currentSong.id;
    }
  }, [currentSong?.id]);

  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5001/api/recently-played", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setRecentlyPlayed(data.recentlyPlayed);
        }
      } catch (err) {
        console.error("Failed to fetch recently played:", err);
      }
    };
    fetchRecentlyPlayed();
  }, [token]);

  const playPauseSong = async (song) => {
    if (!song || !song.uri) {
      console.error("❌ Invalid song:", song);
      return;
    }

    if (!deviceId) {
      console.warn("⚠️ No deviceId yet. Wait for the player to be ready.");
      return;
    }

    console.log("🎵 Starting track:", song.name, "| Track ID:", song.id);
    setCurrentSong(song);
    setIsPlaying(true);
    setLocalCurrTime(0);
    setLocalProgress(0);

    if (song && token) {
      fetch("http://localhost:5001/api/recently-played", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ song }),
      }).catch((err) =>
        console.error("Failed to save recently played song:", err)
      );
    }

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

      if (activeQueue.length === 0 && song.id) {
        getRecommendedSongs({ trackId: song.id });
      }
    } catch (error) {
      console.error("❌ Error playing song:", error);
    }
  };

  const togglePlayPause = async () => {
    if (!deviceId || !playerRef.current) {
      console.warn("⚠️ Can't toggle; player or deviceId not ready.");
      return;
    }
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

  const handleSeek = async (percent) => {
    if (!playerRef.current) {
      console.warn("⚠️ playerRef is null. Not seeking yet.");
      return;
    }
    if (!deviceId) {
      console.warn("⚠️ deviceId missing. Not seeking yet.");
      return;
    }
    if (!isPlaying && !currentSong) {
      console.warn("⚠️ No track loaded or playing. Not seeking yet.");
      return;
    }
    if (durationMs === 0) {
      console.warn("⚠️ durationMs=0. Not seeking yet.");
      return;
    }
    const newPositionMs = Math.round((percent / 100) * durationMs);
    try {
      await playerRef.current.seek(newPositionMs);
    } catch (err) {
      console.error("❌ Error seeking in Spotify player:", err);
    }
  };

  const changeVolume = async (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);

    if (!playerRef.current) {
      console.warn("⚠️ Player not ready, can't set volume yet.");
      return;
    }
    try {
      await playerRef.current.setVolume(newVolume / 100);
    } catch (err) {
      console.error("❌ Error setting volume:", err);
    }
  };

  const clearQueue = () => {
    setActiveQueue([]);
    setOriginalSongs([]);
    setRecommendedSongs([]);
    setCurrentSong(null);
    setSongIndex(0);
    setIsPlaying(false);
    setLocalCurrTime(0);
    setLocalProgress(0);
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,

        playPauseSong,
        togglePlayPause,
        nextSong,
        prevSong,

        activeQueue,
        loadQueue,
        songIndex,
        setSongIndex,

        isShuffling,
        shuffleSongs,

        recommendedSongs,
        getRecommendedSongs,

        progress: localProgress,
        currTime: formatTime(localCurrTime / 1000),
        duration,
        changeProgress: handleSeek,
        volume,
        changeVolume,

        recentlyPlayed,

        getShuffleStatus,
        currentPlaylistId,
        setCurrentPlaylistId,
        clearQueue,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
