import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAudio } from "../../states/AudioProvider";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { Vibrant } from "node-vibrant/browser";
import { IoIosPlay } from "react-icons/io";
import { BsCheckCircleFill } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";
import Card from "../Card/Card";

/**
 * ArtistProfile loads a specific artist from Spotify (artist, top tracks, discography)
 * and also checks if the user has “followed” this artist in your local DB.
 */
const ArtistProfile = () => {
  const { id } = useParams();
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const { token } = useSelector((state) => state.account);

  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [discography, setDiscography] = useState([]);
  const [bgColor, setBgColor] = useState("#000000");
  const [isFollowed, setIsFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");
  const [featuringPlaylists, setFeaturingPlaylists] = useState([]);

  const { setSongs: setGlobalSongs, setSongIndex, playPauseSong } = useAudio();

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id || !accessToken) return;

      try {
        // 1) Fetch the Artist object
        const artistRes = await fetch(
          `https://api.spotify.com/v1/artists/${id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const artistData = await artistRes.json();
        setArtist(artistData);

        // 2) Fetch artist's top tracks
        const topTracksRes = await fetch(
          `https://api.spotify.com/v1/artists/${id}/top-tracks?market=US`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const topTracksData = await topTracksRes.json();

        // Format top tracks so each track has a .uri
        const formattedTracks = (topTracksData.tracks || []).map((track) => ({
          uri: track.uri,
          name: track.name,
          artists: track.artists,
          album: track.album?.name || "Unknown Album",
          albumId: track.album?.id || "",
          albumCover: track.album?.images?.[0]?.url || "",
          duration_ms: track.duration_ms,
        }));

        setTopTracks(formattedTracks);
        setGlobalSongs(formattedTracks);

        // Extract a color from the artist’s main image or the first track’s album cover
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

        // 3) Fetch discography (albums & singles)
        const albumsRes = await fetch(
          `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&limit=20`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const albumsData = await albumsRes.json();
        setDiscography(albumsData.items || []);

        // 4) Search for playlists featuring the artist
        if (artistData.name) {
          const searchQuery = encodeURIComponent(artistData.name);
          const playlistRes = await fetch(
            `https://api.spotify.com/v1/search?q=${searchQuery}&type=playlist&limit=10`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          const playlistData = await playlistRes.json();
          setFeaturingPlaylists(playlistData.playlists?.items || []);
        }
      } catch (err) {
        console.error("Error loading artist data:", err);
      }
    };

    fetchArtistData();
  }, [id, accessToken, setGlobalSongs]);

  // Check if user has followed this artist (local DB)
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
        // Unfollow (DELETE)
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
          if (window.addFollowedArtistToSidebar) {
            window.addFollowedArtistToSidebar();
          }
        }
      } else {
        // Follow (POST)
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
          if (window.addFollowedArtistToSidebar) {
            window.addFollowedArtistToSidebar();
          }
        }
      }
    } catch (err) {
      console.error("Error toggling follow status for artist:", err);
    }
  };

  // Render “Loading” if no artist data yet
  if (!artist) {
    return (
      <Layout>
        <p className="text-white p-4">Loading artist...</p>
      </Layout>
    );
  }

  // Remove duplicates, then filter based on tab
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
    // "popular" or default
    filteredReleases = [...uniqueReleases]
      .sort(
        (a, b) =>
          new Date(b.release_date).getTime() -
          new Date(a.release_date).getTime()
      )
      .slice(0, 5);
  }

  return (
    <Layout>
      <div
        style={{
          background: `linear-gradient(135deg, ${bgColor} 0%, #000000 100%)`,
        }}
        className="secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar"
      >
        <div className="flex p-4">
          <div className="w-1/4">
            <img
              src={artist.images?.[0]?.url}
              alt="Artist"
              className="w-[230px] h-[230px] rounded-full object-cover drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]"
            />
          </div>
          <div className="w-3/4 place-content-end pl-2 font-extrabold text-7xl text-white">
            {artist.name}
          </div>
        </div>

        <div className="w-full bg-black/50 pb-[100px]">
          <div className="flex items-center p-4 gap-4 mb-6 mt-6">
            {/* Play button (plays the first top track) */}
            <button
              className="bg-[#1db954] text-white font-bold p-2 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
              onClick={() => {
                setSongIndex(0);
                if (topTracks[0]) {
                  playPauseSong(topTracks[0]);
                }
              }}
            >
              <IoIosPlay className="text-5xl pl-1" />
            </button>

            {/* Follow/unfollow artist */}
            <button
              onClick={toggleFollowArtist}
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

          {/* Top tracks list */}
          <div className="flex flex-col p-4">
            {topTracks.map((track, index) => (
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

          {/* Discography */}
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
                        onClick={() => setActiveTab(tab)}
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
  );
};

export default ArtistProfile;
