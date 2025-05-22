import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../Layout/Layout";
import VisualCard from "../VisualCard/VisualCard.jsx";
import ArtistCard from "../ArtistCard/ArtistCard.jsx";
import MiniCard from "../MiniCard/MiniCard.jsx";
import { useGlobalContext } from "../../states/Content.jsx";
import { useSelector } from "react-redux";
import { useAudio } from "../../states/AudioProvider.jsx";
import { Link } from "react-router-dom";
import { IoIosPlay, IoIosPause } from "react-icons/io";

const Home = () => {
  const {
    getUser,
    playlists,
    albums,
    spotifyPlaylists,
    followedArtists,
    featuredPlaylists,
    categoryPlaylists,
    currentPlaylistId,
    isPlaying,
  } = useGlobalContext();

  const {
    recentlyPlayed,
    loadQueue,
    setSongIndex,
    playPauseSong,
    currentSong,
    togglePlayPause,
    setCurrentPlaylistId,
  } = useAudio();
  const [recentCollections, setRecentCollections] = useState([]);
  const { token } = useSelector((state) => state.account);
  const accessToken = useSelector((state) => state.spotify.accessToken);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    fetch("http://localhost:5001/api/recently-played-collections", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const enriched = (data.collections || []).map((item) => {
          const spotifyId =
            item.type === "spotify-playlist" ? item.collectionId : null;
          const playlistId =
            item.type === "playlist" ? item.collectionId : null;
          const albumId = item.type === "album" ? item.collectionId : null;

          const link = spotifyId
            ? `/spotify-playlist/${spotifyId}`
            : playlistId
            ? `/playlist/${playlistId}`
            : albumId
            ? `/album/${albumId}`
            : "#";

          return {
            ...item,
            spotifyId,
            playlistId,
            albumId,
            link,
          };
        });

        setRecentCollections(enriched);
      });
  }, [token]);

  useEffect(() => {
    window.refreshHomePage = getUser;
    return () => {
      window.refreshHomePage = null;
    };
  }, [getUser]);

  const enrichedArtists = useMemo(() => {
    const seen = new Set();

    return recentlyPlayed
      .map((song) => ({
        id: song.artistId,
        name: song.artists?.[0]?.name || "Unknown Artist",
        image: song.artistImage || "/default_artist.png",
      }))
      .filter((artist) => {
        if (!artist.id || seen.has(artist.id)) return false;
        seen.add(artist.id);
        return true;
      });
  }, [recentlyPlayed]);

  console.log("recentlyPlayed:", recentlyPlayed);

  const isEmpty =
    recentlyPlayed.length === 0 &&
    followedArtists.length === 0 &&
    albums.length === 0 &&
    playlists.length === 0 &&
    spotifyPlaylists.length === 0 &&
    enrichedArtists.length === 0;

  return (
    <Layout>
      <div className="secondary_bg h-[calc(100vh-155px)] px-7 py-4 rounded-lg mr-3 overflow-y-auto custom-scrollbar">
        {isEmpty ? (
          <>
            <div className="text-center text-white mt-10 space-y-4">
              <h1 className="text-3xl font-bold">
                Welcome to your music space 👋
              </h1>
              <p className="text-gray-400">
                Save playlists, albums, or follow artists to personalize this
                page.
              </p>
              <Link
                to="/search"
                className="inline-block mt-4 px-6 py-3 bg-[#1db954] text-black font-semibold rounded-full hover:scale-105 transition"
              >
                Discover Music
              </Link>
            </div>
            {featuredPlaylists?.length > 0 && (
              <>
                <div className="px-3 flex justify-between items-center mb-2 mt-10">
                  <span className="font-bold text-2xl hover:underline">
                    Editor's Picks
                  </span>
                  <span className="text-xs hover:underline">Show all</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-[60px]">
                  {featuredPlaylists.map((playlist) => (
                    <VisualCard
                      key={playlist.id}
                      title={playlist.name}
                      image={playlist.images?.[0]?.url}
                      description={`Playlist • ${
                        playlist.owner?.display_name || ""
                      }`}
                      link={`/spotify-playlist/${playlist.id}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {recentCollections.length > 0 && (
              <div className="mb-[80px] mt-6">
                <div className="grid grid-cols-4 gap-2 px-3">
                  {recentCollections.slice(0, 8).map((item, idx) => {
                    const playlistOrAlbumId =
                      item.spotifyId || item.playlistId || item.albumId;

                    const isCurrent =
                      currentPlaylistId === playlistOrAlbumId &&
                      recentlyPlayed.some((s) => s.uri === currentSong?.uri) &&
                      isPlaying;

                    return (
                      <div
                        key={idx}
                        className="group relative flex items-center gap-2 bg-white/5 hover:bg-white/10 transition rounded-lg overflow-hidden cursor-pointer"
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded-l-lg object-cover"
                        />
                        <span className="text-white font-medium text-sm truncate w-full pr-1">
                          {item.title}
                        </span>

                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            e.preventDefault();

                            if (currentPlaylistId === playlistOrAlbumId) {
                              togglePlayPause();
                              return;
                            }

                            const trackList = item.tracks || [];

                            if (!trackList.length) {
                              console.warn(
                                "⚠️ No tracks saved in collection. Not playing."
                              );
                              return;
                            }

                            const sourceType =
                              item.spotifyId || item.playlistId
                                ? "playlist"
                                : "album";

                            loadQueue(trackList, playlistOrAlbumId, sourceType);
                            setCurrentPlaylistId(playlistOrAlbumId);
                            setSongIndex(0);
                            playPauseSong(trackList[0]);

                            console.log(
                              "💾 Saving collection with tracks:",
                              trackList
                            );
                            await fetch(
                              "http://localhost:5001/api/recently-played-collections",
                              {
                                method: "POST",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  type: item.spotifyId
                                    ? "spotify-playlist"
                                    : item.playlistId
                                    ? "playlist"
                                    : "album",
                                  collectionId:
                                    item.spotifyId ||
                                    item.playlistId ||
                                    item.albumId,
                                  title: item.title,
                                  image: item.image,
                                  tracks: trackList,
                                }),
                              }
                            );
                          }}
                          className="absolute right-2 bg-[#1db954] text-black p-2 rounded-full opacity-0 group-hover:opacity-100 scale-100 hover:scale-110 transition-all duration-200 ease-in-out z-10"
                        >
                          {isCurrent ? (
                            <IoIosPause className="h-5 w-5" />
                          ) : (
                            <IoIosPlay className="h-5 w-5 pl-[1px]" />
                          )}
                        </button>

                        <Link to={item.link} className="absolute inset-0 z-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {recentlyPlayed?.length > 0 && (
              <>
                <div className="px-3 flex justify-between items-center mb-3">
                  <Link to="/recently-played">
                    <span className="font-bold text-2xl hover:underline">
                      Recently Played Songs
                    </span>
                  </Link>
                  <Link
                    to="/recently-played"
                    className="text-xs text-gray-300 hover:underline"
                  >
                    Show all
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-[80px] px-1">
                  <div className="flex flex-col">
                    {recentlyPlayed.slice(0, 5).map((song, idx) => (
                      <MiniCard
                        key={`left-${song._id || song.uri}-${idx}`}
                        song={song}
                        hideAlbum={true}
                        active={song.uri === currentSong?.uri}
                        onClick={() => {
                          loadQueue(
                            recentlyPlayed,
                            "recently-played",
                            "recent"
                          );
                          setSongIndex(idx);
                          playPauseSong(song);
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col">
                    {recentlyPlayed.slice(5, 10).map((song, idx) => (
                      <MiniCard
                        key={`right-${song._id || song.uri}-${idx}`}
                        song={song}
                        hideAlbum={true}
                        active={song.uri === currentSong?.uri}
                        onClick={() => {
                          loadQueue(recentlyPlayed, "recently-played");
                          setSongIndex(idx + 5);
                          playPauseSong(song);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {playlists?.length > 0 && (
              <>
                <div className="px-3 flex justify-between items-center mb-3">
                  <span className="font-bold text-2xl hover:underline">
                    Your Playlists
                  </span>
                  <span className="text-xs hover:underline">Show all</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-[60px]">
                  {playlists.map((pl) => (
                    <VisualCard
                      key={pl._id}
                      title={pl.name}
                      image={
                        pl?.songs?.[0]?.albumCover || "/default_playlist.png"
                      }
                      description={`Playlist • ${pl.userId?.username || "You"}`}
                      link={`/playlist/${pl._id}`}
                    />
                  ))}
                </div>
              </>
            )}

            {spotifyPlaylists?.length > 0 && (
              <>
                <div className="px-3 flex justify-between items-center mb-3">
                  <span className="font-bold text-2xl hover:underline">
                    Spotify Playlists
                  </span>
                  <span className="text-xs hover:underline">Show all</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-[60px]">
                  {spotifyPlaylists.map((pl) => (
                    <VisualCard
                      key={pl.spotifyId}
                      title={pl.name}
                      image={pl.image || "/default_playlist.png"}
                      description={`Playlist • ${pl.owner?.name || "Spotify"}`}
                      link={`/spotify-playlist/${pl.spotifyId}`}
                    />
                  ))}
                </div>
              </>
            )}

            {followedArtists?.length > 0 && (
              <>
                <div className="px-3 flex justify-between items-center mb-3">
                  <span className="font-bold text-2xl hover:underline">
                    Artists You Follow
                  </span>
                  <span className="text-xs hover:underline">Show all</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-[60px]">
                  {followedArtists.map((artist, idx) => (
                    <ArtistCard
                      key={artist.id}
                      song={{
                        id: artist.id,
                        name: artist.name,
                        albumCover: artist.image || "/default_artist.png",
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {albums?.length > 0 && (
              <>
                <div className="px-3 flex justify-between items-center mb-3">
                  <span className="font-bold text-2xl hover:underline">
                    Albums you like
                  </span>
                  <span className="text-xs hover:underline">Show all</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-[60px]">
                  {albums.map((album) => (
                    <VisualCard
                      key={album._id}
                      title={album.name}
                      image={album.image}
                      description={`Album • ${
                        album.artists?.[0]?.name || "Unknown"
                      }`}
                      link={`/album/${album.spotifyId}`}
                    />
                  ))}
                </div>
              </>
            )}

            {enrichedArtists?.length > 0 && (
              <>
                <div className="px-3 flex justify-between items-center mb-2">
                  <span className="font-bold text-2xl hover:underline">
                    Artists Of Albums You Like
                  </span>
                  <span className="text-xs hover:underline">Show all</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-6">
                  {enrichedArtists.slice(0, 12).map((artist) => (
                    <ArtistCard
                      key={artist.id}
                      song={{
                        id: artist.id,
                        name: artist.name,
                        albumCover: artist.image || "/default_artist.png",
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Home;
