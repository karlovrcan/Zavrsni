import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { useAudio } from "../../states/AudioProvider";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { Vibrant } from "node-vibrant/browser";
import { BsCheckCircleFill, BsFillTrashFill } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";
import { SlOptions } from "react-icons/sl";
import GuestModal from "../GuestModal/GuestModal";
import { Link } from "react-router-dom";

const SpotifyPlaylist = () => {
  const { id } = useParams();
  const { token } = useSelector((state) => state.account);
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const { user, isAuthenticated } = useSelector((state) => state.account);

  const isGuest = !isAuthenticated || user?.role === "guest";
  const [showGuestModal, setShowGuestModal] = useState(false);

  const [playlist, setPlaylist] = useState(null);
  const [bgColor, setBgColor] = useState("#000000");
  const [isSaved, setIsSaved] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    currentSong,
    isPlaying,
    setSongIndex,
    playPauseSong,
    togglePlayPause,
    setCurrentPlaylistId,
    getShuffleStatus,
    loadQueue,
    currentPlaylistId,
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

        const formattedTracks =
          data?.tracks?.items
            ?.map(({ track }) => {
              if (!track) return null;
              return {
                uri: track.uri,
                name: track.name,
                artists: track.artists,
                album: track.album?.name || "Unknown Album",
                albumId: track.album?.id || "Unknown Id",
                albumCover: track.album?.images?.[0]?.url || "",
                duration_ms: track.duration_ms,
              };
            })
            .filter(Boolean) || [];

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
  }, [id, accessToken]);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!playlist?.id || !token) return;
      try {
        const res = await fetch("http://localhost:5001/api/spotify-playlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
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
              albumId: track.album?.id || "Unknown Id",
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
        window.refreshHomePage?.();
        toast("Playlist added to your profile.", {
          position: "bottom-center",
          hideProgressBar: true,

          style: {
            background: "#242424",
            color: "#fff",
            fontWeight: "500",
            borderRadius: "6px",
            marginBottom: "90px",
          },
          icon: <BsCheckCircleFill color="#1db954" />,
        });

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
          toast("Playlist removed from your profile.", {
            position: "bottom-center",
            hideProgressBar: true,
            style: {
              background: "#242424",
              color: "#fff",
              fontWeight: "500",
              borderRadius: "6px",
              marginBottom: "90px",
            },
            icon: <BsFillTrashFill color="#ff4d4d" />,
          });

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
        return {
          uri: track.uri,
          name: track.name,
          artists: track.artists,
          album: track.album?.name || "Unknown Album",
          albumId: track.album?.id || "Unknown Id",
          albumCover: track.album?.images?.[0]?.url || "",
          duration_ms: track.duration_ms,
        };
      })
      .filter(Boolean) || [];

  const playlistImage =
    playlist?.images?.[0]?.url || formattedTracks[0]?.albumCover || "";

  const handlePlayPauseClick = async () => {
    if (!formattedTracks.length || !playlist?.id) return;

    const isCurrent = currentPlaylistId === playlist.id;

    if (isCurrent) {
      togglePlayPause();
      return;
    }

    setCurrentPlaylistId(playlist.id);

    const shouldShuffle = getShuffleStatus(playlist.id);
    const tracksToPlay = shouldShuffle
      ? [...formattedTracks].sort(() => Math.random() - 0.5)
      : formattedTracks;

    loadQueue(tracksToPlay, playlist.id, "playlist");
    setSongIndex(0);
    playPauseSong(tracksToPlay[0]);
    const res = await fetch(
      "http://localhost:5001/api/recently-played-collections",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "spotify-playlist",
          collectionId: playlist.id,
          title: playlist.name,
          image: playlist.images?.[0]?.url || "",
          tracks: formattedTracks,
        }),
      }
    );

    const data = await res.json();
    console.log("✅ Collection saved:", data);
  };

  const isPlaylistPlaying =
    formattedTracks.some((track) => track.uri === currentSong?.uri) &&
    isPlaying;

  const totalSongs = formattedTracks.length;
  const totalDurationMs = formattedTracks.reduce(
    (acc, song) => acc + song.duration_ms,
    0
  );
  const minutes = Math.floor(totalDurationMs / 60000);
  const seconds = Math.floor((totalDurationMs % 60000) / 1000);
  const formattedDuration = `${minutes} min ${seconds
    .toString()
    .padStart(2, "0")} sec`;

  return (
    <>
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
                  <h3 className="text-sm pb-2">Public Playlist</h3>
                  <h1
                    className="text-white font-extrabold w-full break-words text-[clamp(2rem,5vw,1.5rem)] leading-tight"
                    title={playlist?.name}
                  >
                    {playlist?.name}
                  </h1>
                  <p className="text-sm text-gray-200 mt-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    {playlist?.owner?.id ? (
                      <Link
                        to={`/user/${playlist.owner.id}`}
                        className="text-white font-semibold hover:underline"
                      >
                        {playlist.owner.display_name || "Unknown"}
                      </Link>
                    ) : (
                      <span className="text-white font-semibold">
                        {playlist?.owner?.display_name || "Unknown"}
                      </span>
                    )}
                    {" • "}
                    {totalSongs} songs, {formattedDuration}
                  </p>
                </div>
              </div>

              <div className="w-full bg-black/50 pb-[100px] rounded-r-md">
                <div className="flex items-center p-4 pl-6 gap-4 mb-6 mt-6">
                  <button
                    className="bg-[#1db954] text-black font-bold p-2 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
                    onClick={() => {
                      if (isGuest) {
                        setShowGuestModal(true);
                        return;
                      }
                      handlePlayPauseClick();
                    }}
                  >
                    {isPlaylistPlaying ? (
                      <IoIosPause className="text-4xl text-black" />
                    ) : (
                      <IoIosPlay className="text-4xl text-black pl-1" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (isGuest) {
                        setShowGuestModal(true);
                        return;
                      }
                      if (isSaved) {
                        deleteSpotifyPlaylistFromSidebar();
                      } else {
                        saveSpotifyPlaylistToSidebar();
                      }
                    }}
                    className={`text-3xl font-bold p-1 ml-2 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] ${
                      isSaved ? "text-[#1db954]" : "text-white"
                    }`}
                  >
                    {isSaved ? <BsCheckCircleFill /> : <CiCirclePlus />}
                  </button>
                </div>

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

                <div className="flex flex-col px-5 pt-2">
                  {formattedTracks.map((track, index) => (
                    <MiniCard
                      key={track.uri || index}
                      song={track}
                      onClick={() => {
                        if (isGuest) {
                          setShowGuestModal(true);
                          return;
                        }
                        loadQueue(formattedTracks, playlist.id, "playlist");
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
      {showGuestModal && (
        <GuestModal onClose={() => setShowGuestModal(false)} />
      )}
    </>
  );
};

export default SpotifyPlaylist;
