import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAudio } from "../../states/AudioProvider";
import { toast } from "react-toastify";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { Vibrant } from "node-vibrant/browser";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { BsCheckCircleFill, BsFillTrashFill } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";
import Card from "../Card/Card";
import GuestModal from "../GuestModal/GuestModal";

const ArtistProfile = () => {
  const { id } = useParams();
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const { user, isAuthenticated, token } = useSelector(
    (state) => state.account
  );
  const isGuest = !isAuthenticated || user?.role === "guest";
  const [showGuestModal, setShowGuestModal] = useState(false);

  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [discography, setDiscography] = useState([]);
  const [bgColor, setBgColor] = useState("#000000");
  const [isFollowed, setIsFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");
  const [featuringPlaylists, setFeaturingPlaylists] = useState([]);

  const {
    loadQueue,
    setSongIndex,
    playPauseSong,
    currentSong,
    isPlaying,
    togglePlayPause,
    currentPlaylistId,
  } = useAudio();

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id || !accessToken) return;

      try {
        const artistRes = await fetch(
          `https://api.spotify.com/v1/artists/${id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (artistRes.status === 429) throw new Error("Rate limited: artist");
        const artistData = await artistRes.json();
        setArtist(artistData);

        await new Promise((res) => setTimeout(res, 200)); // 200ms pause
        const topTracksRes = await fetch(
          `https://api.spotify.com/v1/artists/${id}/top-tracks?market=US`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (topTracksRes.status === 429)
          throw new Error("Rate limited: top-tracks");
        const topTracksData = await topTracksRes.json();

        const formattedTracks = (topTracksData.tracks || []).map((track) => ({
          uri: track.uri,
          name: track.name,
          artists: track.artists,
          album: track.album?.name || "Unknown Album",
          albumId: track.album?.id || "",
          albumCover: track.album?.images?.[0]?.url || "",
          duration_ms: track.duration_ms,
        }));

        if (formattedTracks.length > 0) {
          setTopTracks(formattedTracks);
        }

        const img =
          artistData.images?.[0]?.url ||
          topTracksData.tracks?.[0]?.album?.images?.[0]?.url;
        if (img) {
          Vibrant.from(img)
            .getPalette()
            .then((palette) => {
              if (palette.Vibrant) {
                setBgColor(palette.Vibrant.hex);
              }
            })
            .catch((err) => console.error("Vibrant color error:", err));
        }

        await new Promise((res) => setTimeout(res, 200));
        const albumsRes = await fetch(
          `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&limit=20`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (albumsRes.status === 429) throw new Error("Rate limited: albums");
        const albumsData = await albumsRes.json();
        setDiscography(albumsData.items || []);

        if (artistData.name) {
          await new Promise((res) => setTimeout(res, 200));
          const searchQuery = encodeURIComponent(artistData.name);
          const playlistRes = await fetch(
            `https://api.spotify.com/v1/search?q=${searchQuery}&type=playlist&limit=10`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (playlistRes.status === 429)
            throw new Error("Rate limited: playlist search");
          const playlistData = await playlistRes.json();
          setFeaturingPlaylists(playlistData.playlists?.items || []);
        }
      } catch (err) {
        console.error("Error loading artist data:", err);
      }
    };

    fetchArtistData();
  }, [id, accessToken, loadQueue]);

  const handlePlayPauseClick = () => {
    if (!topTracks.length || !artist?.id) return;

    const isSameQueue = currentPlaylistId === artist.id;

    if (isSameQueue) {
      togglePlayPause();
      return;
    }
    loadQueue(topTracks, artist.id);
    setSongIndex(0);
    playPauseSong(topTracks[0]);
  };

  useEffect(() => {
    const fetchFollowed = async () => {
      if (!token || !artist?.id) return;

      try {
        const res = await fetch("http://localhost:5001/api/followed-artists", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.artists)) {
          const followed = data.artists.some((a) => a.id === artist.id);
          setIsFollowed(followed);
        }
      } catch (err) {
        console.error("Error checking followed artists:", err);
      }
    };

    fetchFollowed();
  }, [artist, token]);

  const toggleFollowArtist = async () => {
    if (!artist || !artist.id || !token) return;

    try {
      if (isFollowed) {
        const res = await fetch(
          `http://localhost:5001/api/followed-artists/${artist.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.success) {
          setIsFollowed(false);
          window.refreshHomePage?.();
          toast("Artist removed from your profile.", {
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
          if (window.addFollowedArtistToSidebar) {
            window.addFollowedArtistToSidebar();
          }
        }
      } else {
        const res = await fetch("http://localhost:5001/api/followed-artists", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: artist.id,
            name: artist.name,
            image: artist.images?.[0]?.url || "",
          }),
        });
        const data = await res.json();
        if (data.success) {
          setIsFollowed(true);
          window.refreshHomePage?.();
          toast("Artist added to your profile.", {
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
          if (window.addFollowedArtistToSidebar) {
            window.addFollowedArtistToSidebar();
          }
        }
      }
    } catch (err) {
      console.error("Error toggling follow status for artist:", err);
    }
  };

  if (!artist) {
    return (
      <Layout>
        <p className="text-white p-4">Loading artist...</p>
      </Layout>
    );
  }

  const uniqueReleases = discography.filter(
    (release, idx, self) => idx === self.findIndex((r) => r.id === release.id)
  );
  let filteredReleases = [];
  if (activeTab === "album") {
    filteredReleases = uniqueReleases
      .filter((r) => r.album_type === "album")
      .slice(0, 5);
  } else if (activeTab === "single") {
    filteredReleases = uniqueReleases
      .filter((r) => r.album_type === "single")
      .slice(0, 5);
  } else {
    filteredReleases = [...uniqueReleases]
      .sort(
        (a, b) =>
          new Date(b.release_date).getTime() -
          new Date(a.release_date).getTime()
      )
      .slice(0, 5);
  }

  const isArtistPlaying =
    topTracks.some((track) => track.uri === currentSong?.uri) && isPlaying;

  return (
    <>
      <Layout>
        <div
          style={{
            background: `linear-gradient(135deg, ${bgColor} 0%, #000000 100%)`,
          }}
          className="secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar"
        >
          <div className="relative w-full h-[400px] pb-5">
            <div
              className="absolute inset-0 bg-center bg-cover object-cover opacity-60"
              style={{
                backgroundImage: `url(${artist.images?.[0]?.url})`,
              }}
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/90"
              style={{
                background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9))`,
              }}
            />
            <div className="relative z-10 flex flex-col justify-end h-full p-6">
              <h1 className="text-white text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-tight">
                {artist.name}
              </h1>
              <p className="text-white/60 text-md mt-1">
                {parseInt(artist.followers?.total).toLocaleString()} monthly
                listeners
              </p>
            </div>
          </div>

          <div className="w-full bg-black/50 pb-[100px]">
            <div className="flex items-center p-4 gap-4 mb-6">
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
                {isArtistPlaying ? (
                  <IoIosPause className="text-5xl" />
                ) : (
                  <IoIosPlay className="text-5xl pl-1" />
                )}
              </button>

              <button
                onClick={() => {
                  if (isGuest) {
                    setShowGuestModal(true);
                    return;
                  }
                  toggleFollowArtist();
                }}
                className={`text-3xl font-bold p-1 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] ${
                  isFollowed ? "text-[#1db954]" : "text-white"
                }`}
              >
                {isFollowed ? <BsCheckCircleFill /> : <CiCirclePlus />}
              </button>
            </div>

            {/* Table header for top tracks */}
            <div className="flex items-center justify-between px-4 py-2 text-gray-300 text-sm">
              <p className="font-semibold w-1/3 text-center pr-[70px]">
                Title / Author
              </p>
              <p className="font-semibold w-1/3 text-center ml-[60px]">Album</p>
              <div className="w-1/3 flex justify-end pr-6">
                <IoTimeOutline className="text-xl " />
              </div>
            </div>
            <div className="w-full h-[2px] bg-white/10"></div>

            <div className="flex flex-col p-4">
              {topTracks.map((track, index) => (
                <MiniCard
                  key={track.uri || index}
                  song={track}
                  onClick={() => {
                    if (isGuest) {
                      setShowGuestModal(true);
                      return;
                    }
                    loadQueue(topTracks, artist.id);
                    setSongIndex(index);
                    playPauseSong(track);
                  }}
                />
              ))}
            </div>

            {discography.length > 0 && (
              <div className="px-2 mb-10 mt-10">
                <div className="flex justify-between items-center mb-4">
                  <div className="px-2 mb-4">
                    <h2 className="text-white text-3xl font-bold mb-4">
                      Discography
                    </h2>
                    <div className="flex gap-3">
                      {["popular", "album", "single"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            if (isGuest) {
                              setShowGuestModal(true);
                              return;
                            }
                            setActiveTab(tab);
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                            activeTab === tab
                              ? "bg-white text-black"
                              : "bg-zinc-800 text-white hover:bg-zinc-700"
                          }`}
                        >
                          {tab === "popular"
                            ? "Popular releases"
                            : tab === "album"
                            ? "Albums"
                            : "Singles and EPs"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm hover:underline cursor-pointer px-[15px]">
                    Show all
                  </p>
                </div>

                {/* Display filtered discography */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
                  {filteredReleases.map((release) => (
                    <Link to={`/album/${release.id}`} key={release.id}>
                      <Card
                        song={{
                          // Not part of the “active track” logic, just for display
                          id: release.id,
                          uri: release.uri || "",
                          name: release.name,
                          artists: release.artists,
                          albumCover: release.images?.[0]?.url || "",
                        }}
                        handlePlay={() => {}}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Featuring Playlists */}
            {featuringPlaylists.length > 0 && (
              <div className="px-4 mb-10">
                <h2 className="text-white text-3xl font-bold mb-4">
                  Featuring {artist.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  {featuringPlaylists
                    .filter((p) => p && p.id)
                    .map((pl, i) => (
                      <Link to={`/spotify-playlist/${pl.id}`} key={pl.id}>
                        <Card
                          song={{
                            id: pl.id,
                            uri: pl.uri || "",
                            name: pl.name || "Unknown Playlist",
                            artists: [
                              {
                                name: pl.owner?.display_name || "Unknown",
                              },
                            ],
                            albumCover: pl.images?.[0]?.url || "",
                          }}
                          handlePlay={() => {}}
                        />
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
      {showGuestModal && (
        <GuestModal onClose={() => setShowGuestModal(false)} />
      )}
    </>
  );
};

export default ArtistProfile;
