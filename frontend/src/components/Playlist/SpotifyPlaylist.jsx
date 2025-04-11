import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { useAudio } from "../../states/AudioProvider";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { Vibrant } from "node-vibrant/browser";
import { BsCheckCircleFill } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";

/**
 * Displays a Spotify playlist retrieved from the official API,
 * plus local user “save to sidebar” functionality.
 */
const SpotifyPlaylist = () => {
  const { id } = useParams(); // The Spotify playlist ID from the URL
  const { token } = useSelector((state) => state.account);
  const accessToken = useSelector((state) => state.spotify.accessToken);

  const [playlist, setPlaylist] = useState(null);
  const [bgColor, setBgColor] = useState("#000000");
  const [isSaved, setIsSaved] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    currentSong,
    isPlaying,
    setSongs: setGlobalSongs,
    setSongIndex,
    playPauseSong,
    togglePlayPause,
    setCurrentPlaylistId,
    getShuffleStatus,
  } = useAudio();

  useEffect(() => {
    const fetchPlaylist = async () => {
      if (!accessToken) return;
      try {
        const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        setPlaylist(data);

        // Format the tracks so each track uses .uri
        const formattedTracks =
          data?.tracks?.items
            ?.map(({ track }) => {
              if (!track) return null;
              console.log("Track data1 =>", track);
              return {
                uri: track.uri,
                name: track.name,
                artists: track.artists,
                album: track.album?.name || "Unknown Album",
                albumCover: track.album?.images?.[0]?.url || "",
                duration_ms: track.duration_ms,
              };
            })
            .filter(Boolean) || [];

        setGlobalSongs(formattedTracks);

        // Extract color from the cover
        const coverImage =
          data.images?.[0]?.url || formattedTracks[0]?.albumCover || null;
        if (coverImage) {
          Vibrant.from(coverImage)
            .getPalette()
            .then((palette) => {
              if (palette.Vibrant) {
                setBgColor(palette.Vibrant.hex);
              }
            })
            .catch((err) => console.error("Error extracting palette:", err));
        }
      } catch (err) {
        console.error("Error fetching Spotify playlist:", err);
      }
    };

    if (accessToken) {
      fetchPlaylist();
    }
  }, [id, accessToken, setGlobalSongs]);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!playlist?.id || !token) return;
      try {
        const res = await fetch("http://localhost:5001/api/spotify-playlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          // Check if this playlist is already saved in the local DB
          const alreadySaved = data.playlists.some(
            (pl) => pl.spotifyId === playlist.id
          );
          setIsSaved(alreadySaved);
        }
      } catch (err) {
        console.error("Error checking if playlist is saved:", err);
      }
    };
    if (playlist && token) {
      checkIfSaved();
    }
  }, [playlist, token]);

  // Fade in effect
  useEffect(() => {
    if (playlist) {
      setShowContent(false);
      setIsLoading(true);

      const delay = setTimeout(() => {
        setIsLoading(false);
        setShowContent(true);
      }, 500);

      return () => clearTimeout(delay);
    }
  }, [playlist]);

  const saveSpotifyPlaylistToSidebar = async () => {
    if (!playlist || !token) return;

    try {
      const res = await fetch("http://localhost:5001/api/spotify-playlist", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spotifyId: playlist.id,
          name: playlist.name,
          image: playlist.images?.[0]?.url || "",
          owner: {
            name: playlist.owner?.display_name || "Unknown",
            id: playlist.owner?.id || "",
          },
          tracks:
            playlist.tracks.items?.map(({ track }) => ({
              uri: track.uri || "unknown",
              name: track.name,
              album: track.album?.name || "Unknown Album",
              albumCover: track.album?.images?.[0]?.url || "",
              duration_ms: track.duration_ms || 0,
              artists:
                track.artists?.map((a) => ({
                  name: a.name,
                  id: a.id,
                })) || [],
            })) || [],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        if (window.addSpotifyToSidebar) {
          window.addSpotifyToSidebar();
        }
      }
    } catch (err) {
      console.error("Error saving Spotify playlist:", err);
    }
  };

  const deleteSpotifyPlaylistFromSidebar = async () => {
    if (!playlist || !token) return;

    try {
      // Fetch all saved Spotify playlists to find the DB _id
      const res = await fetch("http://localhost:5001/api/spotify-playlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        const target = data.playlists.find(
          (pl) => pl.spotifyId === playlist.id
        );
        if (!target) return;

        const deleteRes = await fetch(
          `http://localhost:5001/api/spotify-playlist/${target._id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const deleteData = await deleteRes.json();
        if (deleteData.success) {
          setIsSaved(false);
          if (window.addSpotifyToSidebar) {
            window.addSpotifyToSidebar();
          }
        }
      }
    } catch (err) {
      console.error("Error deleting Spotify playlist:", err);
    }
  };

  const formattedTracks =
    playlist?.tracks?.items
      ?.map(({ track }) => {
        if (!track) return null;
        console.log("Track data2 =>", track);
        return {
          uri: track.uri,
          name: track.name,
          artists: track.artists,
          album: track.album?.name || "Unknown Album",
          albumCover: track.album?.images?.[0]?.url || "",
          duration_ms: track.duration_ms,
        };
      })
      .filter(Boolean) || [];

  const playlistImage =
    playlist?.images?.[0]?.url || formattedTracks[0]?.albumCover || "";

  const handlePlayPauseClick = () => {
    if (!formattedTracks.length || !playlist?.id) return;

    setCurrentPlaylistId(playlist.id);

    const shouldShuffle = getShuffleStatus(playlist.id);
    const tracksToPlay = shouldShuffle
      ? [...formattedTracks].sort(() => Math.random() - 0.5)
      : formattedTracks;

    const firstTrack = tracksToPlay[0];
    if (!firstTrack) return;

    if (currentSong?.uri === firstTrack.uri) {
      togglePlayPause();
    } else {
      setGlobalSongs(tracksToPlay);
      setSongIndex(0);

      setTimeout(() => {
        playPauseSong(firstTrack);
      }, 0);
    }
  };

  return (
    <Layout>
      <div className="relative h-[calc(100vh-155px)]">
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center z-50 bg-black">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1db954]" />
              <p className="text-white text-lg">Loading playlist...</p>
            </div>
          </div>
        )}

        <div
          className={`transition-opacity duration-500 h-full ${
            showContent ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${bgColor} 0%, #000000 100%)`,
            }}
            className="secondary_bg rounded-lg h-full overflow-auto custom-scrollbar"
          >
            <div className="flex p-4">
              <div className="w-1/4">
                <img
                  src={playlistImage}
                  alt="Playlist Cover"
                  className="w-[230px] h-[230px] rounded-lg object-cover drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]"
                />
              </div>
              <div className="w-3/4 flex flex-col justify-end pl-6 overflow-hidden">
                <h1
                  className="text-white font-extrabold w-full break-words text-[clamp(2rem,5vw,1.5rem)] leading-tight"
                  title={playlist?.name}
                >
                  {playlist?.name}
                </h1>
                <p className="text-gray-300 text-sm mt-2 font-sm">
                  Playlist by{" "}
                  <span className="text-white font-bold">
                    {playlist?.owner?.display_name || "Unknown"}
                  </span>
                </p>
              </div>
            </div>

            <div className="w-full bg-black/50 pb-[100px]">
              <div className="flex items-center p-4 gap-4 mb-6 mt-6">
                {/* Play / Pause */}
                <button
                  className="bg-[#1db954] text-black font-bold p-2 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
                  onClick={handlePlayPauseClick}
                >
                  {currentSong?.uri === formattedTracks[0]?.uri && isPlaying ? (
                    <IoIosPause className="text-4xl text-black " />
                  ) : (
                    <IoIosPlay className="text-4xl text-black pl-1" />
                  )}
                </button>

                {/* Save/Remove from sidebar */}
                <button
                  onClick={() => {
                    if (isSaved) {
                      deleteSpotifyPlaylistFromSidebar();
                    } else {
                      saveSpotifyPlaylistToSidebar();
                    }
                  }}
                  className={`text-3xl font-bold p-1 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] ${
                    isSaved ? "text-[#1db954]" : "text-white"
                  }`}
                >
                  {isSaved ? <BsCheckCircleFill /> : <CiCirclePlus />}
                </button>
              </div>

              {/* Table header */}
              <div className="flex items-center justify-between px-4 py-2 text-gray-300 text-sm">
                <p className="font-semibold w-1/3 text-center pr-[70px]">
                  Title / Author
                </p>
                <p className="font-semibold w-1/3 text-center ml-[60px]">
                  Album
                </p>
                <div className="w-1/3 flex justify-end pr-6">
                  <IoTimeOutline className="text-xl " />
                </div>
              </div>

              <div className="w-full h-[2px] bg-white/10"></div>

              {/* Tracks list */}
              <div className="flex flex-col px-5 pt-2">
                {formattedTracks.map((track, index) => (
                  <MiniCard
                    key={track.uri || index}
                    song={track}
                    onClick={() => {
                      setSongIndex(index);
                      playPauseSong(track);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SpotifyPlaylist;
