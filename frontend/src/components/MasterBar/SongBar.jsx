import { useState, useEffect } from "react";
import { useAudio } from "../../states/AudioProvider";
import { useSelector } from "react-redux";
import { IoIosSkipBackward, IoIosSkipForward } from "react-icons/io";
import { IoPauseCircleSharp, IoPlayCircleSharp } from "react-icons/io5";
import { CiCirclePlus } from "react-icons/ci";
import { BsCheckCircleFill } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import {
  LuShuffle,
  LuRepeat2,
  LuVolume2,
  LuVolume1,
  LuVolume,
} from "react-icons/lu";
import { AiOutlinePlaySquare } from "react-icons/ai";
import { HiOutlineQueueList } from "react-icons/hi2";
import { TbArrowsDiagonal } from "react-icons/tb";
import "./SongBar.css";
import { Link } from "react-router-dom";
import MiniCard from "../MiniCard/MiniCard";

const SongBar = () => {
  const {
    activeQueue,
    setSongIndex,
    playPauseSong,
    currentSong,
    isPlaying,
    togglePlayPause,
    progress,
    changeProgress,
    currTime,
    changeVolume,
    volume,
    nextSong,
    prevSong,
    shuffleSongs,
    isShuffling,
  } = useAudio();

  const currentSongUri = currentSong?.uri || "";
  const disabled = !currentSong;

  const { user, token } = useSelector((state) => state.account);
  const accessToken = useSelector((state) => state.spotify.accessToken);

  const [playlists, setPlaylists] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addedToPlaylists, setAddedToPlaylists] = useState([]);

  const [queueDropdownOpen, setQueueDropdownOpen] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchPlaylists();
    }
  }, [user, token, currentSongUri]);

  useEffect(() => {
    if (!accessToken || !currentSong?.artists?.length) return;
    const needsFetching = currentSong.artists.some((a) => !a.id);
    if (!needsFetching) return;

    const fetchArtistIds = async () => {
      try {
        const query = encodeURIComponent(currentSong.artists[0].name);
        const res = await fetch(
          `https://api.spotify.com/v1/search?q=${query}&type=artist&limit=1`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.artists?.items?.[0]) {
          currentSong.artists[0].id = data.artists.items[0].id;
        }
      } catch (err) {
        console.error("Failed to fetch artist ID:", err);
      }
    };

    fetchArtistIds();
  }, [accessToken, currentSong]);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlaylists(data.playlists);
        const inThese = data.playlists
          .filter((p) => p.songs.some((s) => s.uri === currentSongUri))
          .map((p) => p._id);
        setAddedToPlaylists(inThese);
      }
    } catch (err) {
      console.error("Error fetching playlists", err);
    }
  };

  const togglePlaylistSong = async (playlistId) => {
    if (!currentSongUri) return;

    const isAdded = addedToPlaylists.includes(playlistId);
    const endpoint = isAdded ? "remove-song" : "add-song";

    const body = {
      songId: currentSong.uri,
      name: currentSong.name,
      uri: currentSong.uri,
      album:
        currentSong.album?.name ||
        currentSong.albumName ||
        currentSong.album ||
        "Unknown Album",
      albumCover: currentSong.albumCover || "",
      albumId: currentSong.albumId || currentSong.album?.id || null,
      artists: currentSong.artists || [],
      artistId: currentSong.artistId || currentSong.artists?.[0]?.id || null,
      spotifyId: currentSong.spotifyId || null,
      duration_ms: currentSong.duration_ms || 0,
    };

    try {
      const res = await fetch(
        `http://localhost:5001/api/playlists/${playlistId}/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (data.success) {
        setAddedToPlaylists((prev) =>
          isAdded
            ? prev.filter((id) => id !== playlistId)
            : [...prev, playlistId]
        );
        if (typeof window.refreshActivePlaylist === "function") {
          window.refreshActivePlaylist();
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error updating playlist", err);
    }
  };

  const formatRawMs = (ms) => {
    const totalSeconds = Math.floor((ms || 0) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleSeekClick = (e) => {
    if (disabled) return;
    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    changeProgress(newProgress);
  };

  let nextSongToPlay = null;
  let restOfQueue = [];

  if (activeQueue.length > 0 && currentSong) {
    const currentIndex = activeQueue.findIndex(
      (s) => s.uri === currentSong.uri
    );
    if (currentIndex !== -1) {
      if (currentIndex < activeQueue.length - 1) {
        nextSongToPlay = activeQueue[currentIndex + 1];
      }
      if (currentIndex + 2 <= activeQueue.length - 1) {
        restOfQueue = activeQueue.slice(currentIndex + 2);
      }
    } else {
      restOfQueue = activeQueue.filter((s) => s.uri !== currentSong.uri);
    }
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black z-50">
      <div className="h-[90px] flex justify-between items-center px-4">
        <div className="flex items-center gap-4 w-[30%] min-w-[200px] max-w-[30%] overflow-hidden">
          <img
            src={currentSong?.albumCover || "../src/assets/playlistCover.png"}
            alt="Cover"
            className="h-14 w-14 rounded-md object-cover flex-shrink-0"
          />

          <div className="flex items-center min-w-0 w-full overflow-hidden relative">
            <div className="flex flex-col min-w-0 pr-2">
              <p className="truncate text-white font-normal text-sm w-full">
                {currentSong?.name || ""}
              </p>
              <p className="truncate text-xs text-gray-400 w-full">
                {Array.isArray(currentSong?.artists)
                  ? currentSong.artists.map((artist, i, arr) => (
                      <Link
                        key={artist.id || `${artist.name}-${i}`}
                        to={`/artist/${encodeURIComponent(
                          artist.id || artist.name
                        )}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline text-[11px] text-gray-400"
                      >
                        {artist.name}
                        {i < arr.length - 1 ? ", " : ""}
                      </Link>
                    ))
                  : "Unknown Artist"}
              </p>
            </div>

            <div className="relative">
              <button
                className={`text-white px-3 py-1 rounded-md ${
                  disabled ? "opacity-30 cursor-not-allowed" : ""
                }`}
                onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
                disabled={disabled}
              >
                {addedToPlaylists.length > 0 ? (
                  <BsCheckCircleFill className="text-green-400 text-lg transform hover:scale-110" />
                ) : (
                  <CiCirclePlus className="text-white text-2xl transform hover:scale-110" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center w-[40%] min-w-[300px]">
          <div className="flex justify-center gap-5 items-center mt-3">
            <LuShuffle
              onClick={shuffleSongs}
              className={`text-lg cursor-pointer hover:scale-110 transition ${
                isShuffling ? "text-green-400" : "text-white"
              } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
            />
            <IoIosSkipBackward
              onClick={() => !disabled && prevSong()}
              className={`text-2xl hover:scale-110 transition ${
                disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
              }`}
            />
            {isPlaying ? (
              <IoPauseCircleSharp
                onClick={() => !disabled && togglePlayPause()}
                className={`text-white text-[40px] hover:scale-110 transition ${
                  disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                }`}
              />
            ) : (
              <IoPlayCircleSharp
                onClick={() => !disabled && togglePlayPause()}
                className={`text-white text-[40px] hover:scale-110 transition ${
                  disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                }`}
              />
            )}
            <IoIosSkipForward
              onClick={() => !disabled && nextSong()}
              className={`text-2xl hover:scale-110 transition ${
                disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
              }`}
            />
            <LuRepeat2 className={`text-lg ${disabled ? "opacity-30" : ""}`} />
          </div>

          <div className="flex items-center justify-between gap-2 w-full px-4 mt-2 mb-1 h-[32px] relative z-10">
            <span className="text-xs text-gray-400 w-[42px] text-right flex-shrink-0">
              {disabled ? "0:00" : currTime}
            </span>
            <div
              className="slider-container flex-grow relative"
              onClick={handleSeekClick}
            >
              <div
                className="active_progress"
                style={{ width: `${progress || 0}%` }}
              />
              <input
                type="range"
                min={0}
                max={100}
                value={isNaN(progress) ? 0 : progress}
                onChange={(e) => changeProgress(Number(e.target.value))}
                disabled={disabled}
                className={`progression ${
                  disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                }`}
              />
            </div>
            <span className="text-xs text-gray-400 w-[42px] text-left flex-shrink-0">
              {disabled ? "0:00" : formatRawMs(currentSong?.duration_ms)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end w-[30%] min-w-[250px] gap-4 text-white">
          <HiOutlineQueueList
            onClick={() => setQueueDropdownOpen((prev) => !prev)}
            className={`text-xl cursor-pointer transition hover:scale-110 ${
              disabled
                ? "opacity-30"
                : queueDropdownOpen
                ? "text-green-500"
                : "text-white"
            }`}
          />
          {volume > 50 ? (
            <LuVolume2 className={`text-xl ${disabled ? "opacity-30" : ""}`} />
          ) : volume > 0 ? (
            <LuVolume1 className={`text-xl ${disabled ? "opacity-30" : ""}`} />
          ) : (
            <LuVolume className={`text-xl ${disabled ? "opacity-30" : ""}`} />
          )}
          <div className="slider-container w-24">
            <div
              className="active_progress"
              style={{ width: `${volume || 0}%` }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={changeVolume}
              disabled={disabled}
              className={`progression ${
                disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
              }`}
            />
          </div>
        </div>
      </div>

      {!disabled && dropdownOpen && (
        <div className="absolute bottom-[100px] left-[150px] w-64 bg-[#242424] rounded-lg drop-shadow-[0_-2px_7px_rgba(0,0,0,0.9)] p-2 z-[999]">
          <p className="text-gray-400 text-sm px-2 mb-2 mt-2">
            Add to playlist
          </p>
          <div className="w-full h-[2px] bg-white/10" />
          <div className="max-h-64 overflow-y-auto custom-scrollbar mt-1">
            {playlists.length > 0 ? (
              playlists.map((pl) => {
                const isAdded = addedToPlaylists.includes(pl._id);
                const playlistImage =
                  pl.songs?.[0]?.albumCover ||
                  "https://misc.scdn.co/liked-songs/liked-songs-640.png";
                return (
                  <button
                    key={pl._id}
                    onClick={() => {
                      togglePlaylistSong(pl._id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between text-left px-2 py-2 rounded hover:bg-[#1a1a1a] transition ${
                      isAdded ? "bg-[#1db954]/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={playlistImage}
                        alt="playlist"
                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                      />
                      <span className="text-white text-sm truncate">
                        {pl.name}
                      </span>
                    </div>
                    {isAdded ? (
                      <BsCheckCircleFill className="text-green-500 text-lg flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 border border-white/30 rounded-full flex-shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm px-2">No playlists found</p>
            )}
          </div>
          <div className="flex justify-end px-2 pt-2">
            <button
              onClick={() => setDropdownOpen(false)}
              className="text-gray-400 text-sm hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {queueDropdownOpen && !disabled && (
        <div
          className="fixed top-[64px] bottom-[91px] right-0 w-1/3 tertiary_bg
                     z-[1000] drop-shadow-[-4px_0_6px_rgba(0,0,0,0.5)]
                     border-l-[2px] border-black/40
                     flex flex-col"
        >
          <div className="pt-1">
            <div className="flex items-center justify-between px-3 mb-4">
              <h2 className="text-white text-lg font-bold pt-1">Queue</h2>
              <FaPlus
                onClick={() => setQueueDropdownOpen((prev) => !prev)}
                className={`rotate-[45deg] text-xl hover:scale-110 cursor-pointer ${
                  disabled
                    ? "opacity-30"
                    : queueDropdownOpen
                    ? "text-gray-500"
                    : "text-white"
                }`}
              />
            </div>

            <div className="mb-2 px-2 shadow-[0_3px_4px_-1px_rgba(0,0,0,0.5)] pb-3">
              <p className="text-normal font-semibold text-gray-400 mb-2 px-1 ">
                Now Playing
              </p>
              {currentSong && <MiniCard song={currentSong} hideAlbum active />}
            </div>
          </div>

          <div className="flex-grow overflow-y-auto px-2 custom-scrollbar pb-6">
            {restOfQueue.length > 0 && (
              <p className="text-normal font-semibold text-gray-400 mb-2 px-1 mt-3">
                Later in Queue
              </p>
            )}
            {restOfQueue.map((song, index) => (
              <MiniCard
                key={`${song.uri}-${index}`}
                song={song}
                hideAlbum
                onClick={() => {
                  const indexInQueue = activeQueue.findIndex(
                    (s) => s.uri === song.uri
                  );
                  if (indexInQueue !== -1) {
                    setSongIndex(indexInQueue);
                    playPauseSong(song);
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SongBar;
