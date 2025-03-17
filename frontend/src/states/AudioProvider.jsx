import React, {
  createContext,
  useState,
  useRef,
  useContext,
  useEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecommendedSongs } from "../api/spotifyService";
import { setSpotifyDeviceId } from "../states/Actions/SpotifyActions"; // if you still use Redux for deviceId

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Slider progress 0..100
  const [progress, setProgress] = useState(0);

  // *** Track these as strings for the UI: "00:00"
  const [currTime, setCurrTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");

  // *** Also track the raw duration in ms, so we can SEEK
  const [durationMs, setDurationMs] = useState(0);

  const [volume, setVolume] = useState(50);
  const [songIndex, setSongIndex] = useState(0);
  const [songs, setSongs] = useState([]);
  const [recommendedSongs, setRecommendedSongs] = useState([]);

  // Redux
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.spotify.accessToken);

  // Store deviceId here (and optionally in Redux)
  const [deviceId, setDeviceId] = useState(null);

  // Player ref for Web Playback SDK
  const playerRef = useRef(null);

  // Helper: convert seconds -> "mm:ss"
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // ───────────────────────────────────────────────────────────────────
  //  1) Initialize the Spotify Player once
  // ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;
    if (playerRef.current) return; // Already set up

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
          volume: 0.8,
        });

        playerRef.current = player;

        // Player is ready => we get a device ID
        player.addListener("ready", ({ device_id }) => {
          console.log("✅ Player Ready. deviceId:", device_id);
          setDeviceId(device_id);
          dispatch(setSpotifyDeviceId(device_id));
        });

        // Not ready
        player.addListener("not_ready", ({ device_id }) => {
          console.warn("⚠️ Device offline:", device_id);
        });

        // Error listeners
        player.addListener("initialization_error", (e) => console.error(e));
        player.addListener("authentication_error", (e) => console.error(e));
        player.addListener("account_error", (e) => console.error(e));

        // Main event for track changes, pausing, etc. (not every second)
        player.addListener("player_state_changed", (state) => {
          if (!state || !state.track_window?.current_track) return;

          setIsPlaying(!state.paused);

          // position & duration in ms
          const { position, duration } = state;
          setDurationMs(duration);
          setProgress((position / duration) * 100);
          setCurrTime(formatTime(position / 1000));
          setDuration(formatTime(duration / 1000));

          // Current track details
          const track = state.track_window.current_track;
          setCurrentSong({
            id: track.id,
            uri: track.uri,
            name: track.name,
            albumCover: track.album.images?.[0]?.url || "",
            artists: track.artists,
          });
        });

        // Connect
        player.connect().then((success) => {
          if (success) {
            console.log("✅ Connected to Web Playback SDK!");
          } else {
            console.error("❌ Failed to connect!");
          }
        });
      };
    }

    // Cleanup
    return () => {
      if (playerRef.current) {
        console.log("🛑 Disconnecting Spotify player...");
        playerRef.current.disconnect();
      }
    };
  }, [accessToken, dispatch]);

  // ───────────────────────────────────────────────────────────────────
  //  2) Poll getCurrentState() while playing => update currTime
  // ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let intervalId = null;

    if (isPlaying && playerRef.current) {
      intervalId = setInterval(() => {
        playerRef.current
          .getCurrentState()
          .then((state) => {
            if (!state || !state.track_window?.current_track) return;

            const { position, duration, paused } = state;
            setIsPlaying(!paused); // in case user paused from another device

            setDurationMs(duration);
            setProgress((position / duration) * 100);

            // Convert ms -> seconds -> "mm:ss"
            setCurrTime(formatTime(position / 1000));
            setDuration(formatTime(duration / 1000));
          })
          .catch((err) => console.error("Error polling getCurrentState:", err));
      }, 1000);
    }

    // Cleanup when isPlaying changes or unmount
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying]);

  // ───────────────────────────────────────────────────────────────────
  //  3) Controls
  // ───────────────────────────────────────────────────────────────────

  // Play a NEW track from 0
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

      if (songs.length === 0 && song.id) {
        getRecommendedSongs(song.id);
      }
    } catch (error) {
      console.error("❌ Error playing song:", error);
    }
  };

  // Pause/Resume current track
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

  // Seek to a new position
  const handleSeek = async (percent) => {
    if (!playerRef.current || durationMs === 0) return;
    const newPositionMs = (percent / 100) * durationMs;
    try {
      await playerRef.current.seek(newPositionMs);
    } catch (err) {
      console.error("❌ Error seeking:", err);
    }
  };

  // Get recommended songs
  const getRecommendedSongs = async (seedTrackId) => {
    if (!accessToken) return;
    if (!seedTrackId || seedTrackId.length !== 22) return;

    try {
      const recommendations = await fetchRecommendedSongs(seedTrackId, accessToken);
      setRecommendedSongs(recommendations);
    } catch (err) {
      console.error("❌ Error fetching recommended songs:", err);
    }
  };

  // Next/Prev
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

    if (nextTrack) playPauseSong(nextTrack);
  };

  const prevSong = () => {
    if (songs.length === 0) return;
    const prevIndex = songIndex > 0 ? songIndex - 1 : 0;
    setSongIndex(prevIndex);
    if (songs[prevIndex]) playPauseSong(songs[prevIndex]);
  };

  // Volume
  const changeVolume = async (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);

    if (playerRef.current) {
      try {
        await playerRef.current.setVolume(newVolume / 100);
      } catch (err) {
        console.error("❌ Error setting volume:", err);
      }
    }
  };

  // Provide context
  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        playPauseSong,
        togglePlayPause,

        // Expose progress & times
        progress,
        currTime,
        duration,
        changeProgress: handleSeek,

        volume,
        changeVolume,
        nextSong,
        prevSong,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
