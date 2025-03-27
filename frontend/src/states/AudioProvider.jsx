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
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Quick UI progress from Spotify or fallback
  const [progress, setProgress] = useState(0);
  const [currTime, setCurrTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [durationMs, setDurationMs] = useState(0);

  // Local-only fallback states
  const [localProgress, setLocalProgress] = useState(0); // 0–100
  const [localCurrTime, setLocalCurrTime] = useState(0); // ms

  const [volume, setVolume] = useState(50);

  // Song management
  const [songIndex, setSongIndex] = useState(0);
  const [songs, setSongs] = useState([]);
  const [recommendedSongs, setRecommendedSongs] = useState([]);

  // Spotify & Redux references
  const [deviceId, setDeviceId] = useState(null);
  const playerRef = useRef(null);
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.spotify.accessToken);

  // ───────────────────────────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────────────────────────
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  /**
   * Moves to the next track, either from our local songs array or recommended songs.
   */
  const nextSong = async () => {
    let nextTrack = null;

    if (songs.length > 0 && songIndex < songs.length - 1) {
      nextTrack = songs[songIndex + 1];
      setSongIndex(songIndex + 1);
    } else if (recommendedSongs.length > 0) {
      nextTrack = recommendedSongs[0];
      setRecommendedSongs((prev) => prev.slice(1));
    } else if (currentSong?.id && recommendedSongs.length === 0) {
      console.log("🔄 Fetching new recommendations...");
      await getRecommendedSongs(currentSong.id);
      return;
    }

    if (nextTrack) {
      playPauseSong(nextTrack);
    }
  };

  /**
   * Fetch recommended songs for a given seed track ID
   */
  const getRecommendedSongs = async (seedTrackId) => {
    if (!accessToken) return;
    if (!seedTrackId || seedTrackId.length !== 22) return;

    try {
      const recommendations = await fetchRecommendedSongs(
        seedTrackId,
        accessToken
      );
      setRecommendedSongs(recommendations);
    } catch (err) {
      console.error("❌ Error fetching recommended songs:", err);
    }
  };

  // ───────────────────────────────────────────────────────────────────
  // 1) Initialize Spotify Player
  // ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    if (playerRef.current) return; // Already set up

    // Inject the Spotify SDK script if not already present
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

        // Device is ready
        player.addListener("ready", ({ device_id }) => {
          console.log("✅ Player Ready with deviceId:", device_id);
          setDeviceId(device_id);
          dispatch(setSpotifyDeviceId(device_id));
        });

        // Player went offline
        player.addListener("not_ready", ({ device_id }) => {
          console.warn("⚠️ Device offline:", device_id);
        });

        // Errors
        player.addListener("initialization_error", (e) =>
          console.error("Init error:", e)
        );
        player.addListener("authentication_error", (e) =>
          console.error("Auth error:", e)
        );
        player.addListener("account_error", (e) =>
          console.error("Account error:", e)
        );

        // State updates (position, pause, etc.)
        player.addListener("player_state_changed", (state) => {
          if (!state || !state.track_window?.current_track) return;

          const { position, paused, duration: fallbackDuration } = state;
          const track = state.track_window.current_track;
          const trackDurationMs = track.duration_ms || fallbackDuration;

          // Update state
          setIsPlaying(!paused);
          setDurationMs(trackDurationMs);
          setCurrTime(formatTime(position / 1000));
          setDuration(formatTime(trackDurationMs / 1000));

          setProgress((position / trackDurationMs) * 100);
          setLocalCurrTime(position);
          setLocalProgress((position / trackDurationMs) * 100);

          // Change song info
          setCurrentSong({
            id: track.id,
            uri: track.uri,
            name: track.name,
            albumCover: track.album.images?.[0]?.url || "",
            artists: track.artists,
            duration_ms: trackDurationMs,
          });

          // If near the end of track
          if (!paused && trackDurationMs - position < 1000) {
            nextSong();
          }
        });

        // Connect the player
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

  // ───────────────────────────────────────────────────────────────────
  // 2) Local Timer for Fallback Tracking (no getCurrentState)
  // ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let localInterval = null;

    // If we’re playing, increment local time every second
    if (isPlaying) {
      localInterval = setInterval(() => {
        setLocalCurrTime((prevMs) => {
          const nextMs = prevMs + 1000;

          // Keep local progress updated
          let nextProgress = 0;
          if (durationMs > 0) {
            nextProgress = (nextMs / durationMs) * 100;
          }
          setLocalProgress(nextProgress);

          // If near the end, proceed to nextSong
          if (durationMs && nextMs >= durationMs - 1000) {
            nextSong();
          }
          return nextMs;
        });
      }, 1000);
    }

    // Cleanup timer
    return () => {
      if (localInterval) clearInterval(localInterval);
    };
  }, [isPlaying, durationMs, nextSong]);

  const prevTrackRef = useRef(null);

  useEffect(() => {
    // If no valid track, do nothing
    if (!currentSong?.id) return;

    // If the track ID actually changed from the previous
    if (prevTrackRef.current !== currentSong.id) {
      setLocalCurrTime(0);
      setLocalProgress(0);
      prevTrackRef.current = currentSong.id;
    }
  }, [currentSong?.id]);

  // ───────────────────────────────────────────────────────────────────
  // 3) Playback Controls
  // ───────────────────────────────────────────────────────────────────

  /**
   * Start playing a brand-new track from 0
   */
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

    try {
      // Tell Spotify to play
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

      // If no local playlist, fetch recommended
      if (songs.length === 0 && song.id) {
        getRecommendedSongs(song.id);
      }
    } catch (error) {
      console.error("❌ Error playing song:", error);
    }
  };

  /**
   * Pause or resume the current track
   */
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

  /**
   * Manually seek to a new position in the current track
   */
  const handleSeek = async (percent) => {
    // Preliminary checks
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

  /**
   * Skip to the previous song in local array
   */
  const prevSong = () => {
    if (songs.length === 0) return;
    const prevIndex = songIndex > 0 ? songIndex - 1 : 0;
    setSongIndex(prevIndex);

    if (songs[prevIndex]) {
      playPauseSong(songs[prevIndex]);
    }
  };

  // ───────────────────────────────────────────────────────────────────
  // 4) Volume
  // ───────────────────────────────────────────────────────────────────
  const changeVolume = async (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);

    // Check if playerRef is null or deviceId missing
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

  // ───────────────────────────────────────────────────────────────────
  // 5) Provide Context
  // ───────────────────────────────────────────────────────────────────
  return (
    <AudioContext.Provider
      value={{
        // Song
        currentSong,
        isPlaying,
        playPauseSong,
        togglePlayPause,

        // Times & progress
        progress: localProgress, // purely local or from 'player_state_changed'
        currTime: formatTime(localCurrTime / 1000),
        duration,
        changeProgress: handleSeek,

        // Volume
        volume,
        changeVolume,

        // Next/Prev
        nextSong,
        prevSong,

        // Expose these so you can set them from outside
        setSongs,
        setSongIndex,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
