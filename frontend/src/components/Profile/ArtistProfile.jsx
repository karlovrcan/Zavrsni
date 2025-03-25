import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAudio } from "../../states/AudioProvider";
import { AuthContext } from "../../states/AuthContext";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { Vibrant } from "node-vibrant/browser";
import { IoIosPlay } from "react-icons/io";
import { BsCheckCircleFill } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";

import Card from "../Card/Card";

const ArtistProfile = () => {
  const { id } = useParams();
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const { token } = useContext(AuthContext);
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [discography, setDiscography] = useState([]);
  const [bgColor, setBgColor] = useState("#000000");
  const [isFollowed, setIsFollowed] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");
  const [featuringPlaylists, setFeaturingPlaylists] = useState([]);
  const { setSongs: setGlobalSongs, setSongIndex, playPauseSong } = useAudio();

  useEffect(() => {
    const fetchArtist = async () => {
      const artistRes = await fetch(
        `https://api.spotify.com/v1/artists/${id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const artistData = await artistRes.json();
      setArtist(artistData);

      const trackRes = await fetch(
        `https://api.spotify.com/v1/artists/${id}/top-tracks?market=HR`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const trackData = await trackRes.json();
      const formattedTracks = trackData.tracks.map((track) => ({
        id: track.id,
        uri: track.uri,
        name: track.name,
        artists: track.artists,
        albumCover: track.album?.images?.[0]?.url || "", // 🔥 important!
        duration_ms: track.duration_ms,
      }));

      setTopTracks(formattedTracks);
      setGlobalSongs(formattedTracks);

      const img =
        artistData.images?.[0]?.url ||
        trackData.tracks[0]?.album?.images?.[0]?.url;
      if (img) {
        Vibrant.from(img)
          .getPalette()
          .then((palette) => {
            if (palette.Vibrant) setBgColor(palette.Vibrant.hex);
          })
          .catch((err) => console.error("🎨 Error generating color:", err));
      }
      const albumsRes = await fetch(
        `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&market=HR&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const albumsData = await albumsRes.json();
      setDiscography(albumsData.items);
      if (artistData?.name) {
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
    };

    if (accessToken) fetchArtist();
  }, [id, accessToken, setGlobalSongs]);

  useEffect(() => {
    const fetchFollowed = async () => {
      if (!token || !artist) return;

      const res = await fetch("http://localhost:5001/api/followed-artists", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.artists)) {
        const followed = data.artists.some((a) => a.id === artist.id);
        setIsFollowed(followed);
      }
    };

    fetchFollowed();
  }, [artist, token]);

  // Follow artist
  const handleFollow = async () => {
    if (isFollowed) return;

    await fetch("http://localhost:5001/api/followed-artists", {
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

    setIsFollowed(true);
  };

  if (!artist) return <p className="text-white">Loading...</p>;

  return (
    <Layout>
      <div
        style={{
          background: `linear-gradient(135deg, ${bgColor} 0%, #000000 100%)`,
        }}
        className=" secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar"
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
            <button
              className="bg-[#1db954] text-white font-bold p-2 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
              onClick={() => {
                setSongIndex(0);
                playPauseSong(topTracks[0]);
              }}
            >
              <IoIosPlay className="text-5xl pl-1" />
            </button>
            <button
              onClick={handleFollow}
              className={`text-3xl font-bold p-1 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] ${
                isFollowed ? "text-[#1db954]" : "text-white"
              }`}
            >
              {isFollowed ? <BsCheckCircleFill /> : <CiCirclePlus />}
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between px-4 py-2 text-gray-300  text-sm">
              <p className="font-semibold ml-[65px]">Title / Author</p>
              <IoTimeOutline className="text-xl mr-[70px]" />
            </div>
            <div className="w-full h-[2px] bg-white/10"></div>
          </div>
          <div className="flex flex-col gap-1 p-4">
            {topTracks.map((track, index) => (
              <MiniCard
                key={track.id}
                song={track}
                onClick={() => {
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

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
                {(() => {
                  const uniqueReleases = discography.filter(
                    (release, index, self) =>
                      index === self.findIndex((r) => r.id === release.id)
                  );

                  const filteredDiscography =
                    activeTab === "album"
                      ? uniqueReleases
                          .filter((r) => r.album_type === "album")
                          .slice(0, 5)
                      : activeTab === "single"
                      ? uniqueReleases
                          .filter((r) => r.album_type === "single")
                          .slice(0, 5)
                      : uniqueReleases
                          .sort(
                            (a, b) =>
                              new Date(b.release_date) -
                              new Date(a.release_date)
                          )
                          .slice(0, 5);

                  return filteredDiscography.map((release) => (
                    <Link to={`/album/${release.id}`} key={release.id}>
                      <Card
                        key={release.id}
                        song={{
                          id: release.id,
                          uri: release.uri || "",
                          name: release.name,
                          artists: release.artists || [],
                          albumCover: release.images?.[0]?.url || "",
                        }}
                        handlePlay={() => {}}
                      />
                    </Link>
                  ));
                })()}
              </div>
            </div>
          )}
          {featuringPlaylists.length > 0 && (
            <div className="px-4 mb-10">
              <h2 className="text-white text-3xl font-bold mb-4">
                Featuring {artist.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 ">
                {featuringPlaylists
                  .filter((playlist) => playlist && playlist.id)
                  .map((playlist, index) => (
                    <Link
                      to={`/spotify-playlist/${playlist.id}`}
                      key={playlist.id}
                    >
                      <Card
                        key={playlist.id ?? `fallback-key-${index}`}
                        song={{
                          id: playlist.id ?? `no-id-${index}`,
                          uri: playlist.uri ?? "",
                          name: playlist.name ?? "Unknown Playlist",
                          artists: [
                            {
                              name: playlist.owner?.display_name ?? "Unknown",
                            },
                          ],
                          albumCover: playlist.images?.[0]?.url ?? "",
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
