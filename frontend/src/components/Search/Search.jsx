import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../../Layout/Layout";
import BrowsePage from "../Browse/Browse";
import Card from "../Card/Card";
import MiniCard from "../MiniCard/MiniCard";
import SingularCard from "../SingularCard/SingularCard";
import ArtistCard from "../ArtistCard/ArtistCard";
import GuestModalPortal from "../GuestModal/GuestModalPortal";
import { useAudio } from "../../states/AudioProvider";

export default function Search({
  songs = [],
  artists = [],
  albums = [],
  playlists = [],
}) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tagParam = queryParams.get("tags");
  const tags = tagParam
    ? tagParam.split(",").map((tag) => tag.trim().toLowerCase())
    : [];

  const initialQuery = queryParams.get("query") || "";
  const source = queryParams.get("source");
  const isFromBrowse = source === "browse";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [allCategories, setAllCategories] = useState([]);

  const { isAuthenticated, user } = useSelector((state) => state.account);
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const isGuest = !isAuthenticated || user?.role === "guest";
  const navigate = useNavigate();
  const token = useSelector((state) => state.account.token);

  const {
    loadQueue,
    activeQueue,
    currentPlaylistId,
    currentSong,
    isPlaying,
    setSongIndex,
    playPauseSong,
    togglePlayPause,
    setCurrentPlaylistId,
  } = useAudio();

  const queryTokens = decodeURIComponent(searchQuery)
    .trim()
    .toLowerCase()
    .split(/[+,\s]+/)
    .filter(Boolean);

  const effectiveTokens = tags.length > 0 ? tags : queryTokens;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const newQuery = queryParams.get("query") || "";
    setSearchQuery(newQuery);
  }, [location.search]);

  useEffect(() => {
    setIsLoading(true);
    setShowResults(false);
    const delay = setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 800);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/category");
        const data = await res.json();
        setAllCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

  const tokenizedMatch = (text, tokens) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return tokens.some((token) => lower.includes(token));
  };

  const songMatchesQuery = (song) =>
    tokenizedMatch(song.name, effectiveTokens) ||
    song.artists?.some((a) => tokenizedMatch(a.name, effectiveTokens)) ||
    tokenizedMatch(song.album?.name, effectiveTokens);

  const artistMatchesQuery = (artist) =>
    tokenizedMatch(artist.name, effectiveTokens);

  const albumMatchesQuery = (album) =>
    tokenizedMatch(album.name, effectiveTokens) ||
    album.artists?.some((a) => tokenizedMatch(a.name, effectiveTokens));

  const playlistMatchesQuery = (playlist) =>
    tokenizedMatch(playlist.name, effectiveTokens) ||
    tokenizedMatch(playlist.owner?.display_name, effectiveTokens);

  const matchedSongs = songs.filter((song) => song && songMatchesQuery(song));
  const matchedArtists = artists.filter(
    (artist) => artist && artistMatchesQuery(artist)
  );
  const matchedAlbums = albums.filter(
    (album) => album && albumMatchesQuery(album)
  );
  const matchedPlaylists = playlists.filter(
    (playlist) => playlist && playlistMatchesQuery(playlist)
  );

  const handleTrackClick = (track, index) => {
    if (!songs.length) return;
    const queue = songs.map((t) => ({
      uri: t.uri,
      name: t.name,
      artists: t.artists,
      album: t.album?.name || "Unknown Album",
      albumCover: t.album?.images?.[0]?.url || "",
      duration_ms: t.duration_ms,
    }));
    loadQueue(queue, "search-results");
    setSongIndex(index);
    playPauseSong(track);
  };

  const handlePlaySpotifyPlaylist = async (playlistMeta) => {
    if (!accessToken) return;
    if (currentPlaylistId === playlistMeta.id) return togglePlayPause();

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistMeta.id}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await res.json();
      const tracks =
        data.tracks?.items
          ?.map(({ track }) =>
            track?.uri
              ? {
                  uri: track.uri,
                  name: track.name,
                  artists: track.artists,
                  album: track.album?.name,
                  albumId: track.album?.id,
                  albumCover: track.album?.images?.[0]?.url,
                  duration_ms: track.duration_ms,
                }
              : null
          )
          .filter(Boolean) || [];

      if (tracks.length) {
        loadQueue(tracks, playlistMeta.id);
        setCurrentPlaylistId(playlistMeta.id);
        setSongIndex(0);
        playPauseSong(tracks[0]);
        await fetch("http://localhost:5001/api/recently-played-collections", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "spotify-playlist",
            collectionId: playlistMeta.id,
            title: playlistMeta.name,
            image: playlistMeta.images?.[0]?.url || "",
            tracks,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to play playlist:", err);
    }
  };

  const handlePlayAlbum = async (album) => {
    if (!album?.id || !accessToken) return;
    if (currentPlaylistId === album.id) return togglePlayPause();

    try {
      const res = await fetch(`https://api.spotify.com/v1/albums/${album.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      const tracks = data.tracks?.items.map((track) => ({
        uri: track.uri,
        name: track.name,
        artists: track.artists,
        album: data.name,
        albumId: data.id,
        albumCover: data.images?.[0]?.url,
        duration_ms: track.duration_ms,
      }));

      loadQueue(tracks, album.id);
      setCurrentPlaylistId(album.id);
      setSongIndex(0);
      playPauseSong(tracks[0]);
      await fetch("http://localhost:5001/api/recently-played-collections", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "album",
          collectionId: album.id,
          title: album.name,
          image: album.images?.[0]?.url || "",
          tracks,
        }),
      });
    } catch (err) {
      console.error("Failed to play album:", err);
    }
  };

  const handlePlayArtist = async (artist) => {
    if (!artist?.id || !accessToken) return;
    if (currentPlaylistId === artist.id) return togglePlayPause();

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      const topTracks = data.tracks.map((track) => ({
        uri: track.uri,
        name: track.name,
        artists: track.artists,
        album: track.album?.name,
        albumId: track.album?.id,
        albumCover: track.album?.images?.[0]?.url,
        duration_ms: track.duration_ms,
      }));

      loadQueue(topTracks, artist.id);
      setCurrentPlaylistId(artist.id);
      setSongIndex(0);
      playPauseSong(topTracks[0]);
    } catch (err) {
      console.error("Failed to play artist:", err);
    }
  };

  const matchedCategory = allCategories.find((cat) =>
    tags.every((tag) => cat.tags.includes(tag))
  );

  const categoryLabel =
    isFromBrowse && matchedCategory ? `${matchedCategory.label}` : null;

  return (
    <>
      <Layout>
        <div
          className={`transition-opacity duration-500 ${
            showResults ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`${
              isFromBrowse
                ? "overflow-auto custom-scrollbar w-full secondary_bg h-[calc(100vh-155px)]"
                : "px-2 secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar"
            }`}
          >
            {!searchQuery && tags.length === 0 ? (
              <BrowsePage setSearchQuery={setSearchQuery} />
            ) : isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1db954]" />
                  <p className="text-white text-lg">Searching...</p>
                </div>
              </div>
            ) : (
              <>
                {!isFromBrowse && (
                  <div className="flex gap-4 px-6 py-3 fixed top-[64px] left-[440px] right-[20px] z-40 bg-[#121212]  justify-start text-sm">
                    {["all", "songs", "artists", "playlists", "albums"].map(
                      (type) => (
                        <button
                          key={type}
                          className={`${
                            activeFilter === type
                              ? "bg-white text-black"
                              : "tertiary_bg text-white"
                          } px-4 py-2 rounded-full transition hover:scale-110`}
                          onClick={() => setActiveFilter(type)}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                )}

                <div
                  className={`${
                    isFromBrowse
                      ? ""
                      : "px-3 pt-20 pb-6 secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar"
                  }`}
                >
                  {!isFromBrowse &&
                    ["all", "songs"].includes(activeFilter) &&
                    songs.length > 0 && (
                      <>
                        {activeFilter === "all" && (
                          <>
                            <div className="flex mb-2 px-6">
                              <h2 className="w-1/3 text-2xl font-bold mt-3">
                                Top Result
                              </h2>
                              <h2 className="w-2/3 text-2xl font-bold mt-3 pl-[75px]">
                                Songs
                              </h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 px-5 items-start">
                              <div className="lg:col-span-2 ">
                                {songs[0] && (
                                  <SingularCard
                                    song={{
                                      id: songs[0].id || songs[0].uri,
                                      uri: songs[0].uri,
                                      name: songs[0].name,
                                      artists: songs[0].artists,
                                      albumCover:
                                        songs[0].album?.images?.[0]?.url || "",
                                    }}
                                    handlePlay={() => {
                                      if (isGuest) {
                                        setShowGuestModal(true);
                                        return;
                                      }
                                      playPauseSong({
                                        _id: songs[0].id,
                                        uri: songs[0].uri,
                                        name: songs[0].name,
                                        artists: songs[0].artists,
                                        albumCover:
                                          songs[0].album?.images?.[0]?.url ||
                                          "",
                                        duration_ms: songs[0].duration_ms,
                                      });
                                    }}
                                    titleClassName="text-[clamp(1rem,3vw,1.2rem)] font-extrabold text-white leading-tight"
                                    subtitleClassName="text-sm text-gray-400 mt-1"
                                    artistClassName="text-sm text-white font-medium mt-1"
                                  />
                                )}
                              </div>

                              <div className="lg:col-span-3">
                                <div className="flex flex-col">
                                  {matchedSongs
                                    .slice(1, 5)
                                    .filter((track) => track && track.id)
                                    .map((track, index) => (
                                      <MiniCard
                                        key={track.uri || track.id}
                                        song={{
                                          id: track.id,
                                          uri: track.uri,
                                          name: track.name,
                                          artists: track.artists,
                                          album:
                                            track.album?.name ||
                                            "Unknown Album",
                                          albumCover:
                                            track.album?.images?.[0]?.url || "",
                                          duration_ms: track.duration_ms,
                                        }}
                                        hideAlbum
                                        onClick={() => {
                                          if (isGuest) {
                                            setShowGuestModal(true);
                                            return;
                                          }
                                          handleTrackClick(track, index + 1);
                                        }}
                                      />
                                    ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        {activeFilter === "songs" &&
                          matchedSongs.length > 0 && (
                            <>
                              <h2 className="text-2xl font-bold mt-3 mb-2 px-6">
                                Songs
                              </h2>
                              <div className="flex flex-col px-6">
                                {matchedSongs
                                  .filter((track) => track && track.uri)
                                  .map((track, index) => (
                                    <MiniCard
                                      key={track.uri}
                                      song={{
                                        id: track.id || track._id,
                                        uri: track.uri,
                                        name: track.name,
                                        artists: track.artists,
                                        album:
                                          track.album?.name || "Unknown Album",
                                        albumCover:
                                          track.album?.images?.[0]?.url || "",
                                        duration_ms: track.duration_ms,
                                      }}
                                      onClick={() => {
                                        if (isGuest) {
                                          setShowGuestModal(true);
                                          return;
                                        }
                                        handleTrackClick(track, index);
                                      }}
                                    />
                                  ))}
                              </div>
                            </>
                          )}
                      </>
                    )}

                  {!isFromBrowse &&
                    ["all", "artists"].includes(activeFilter) &&
                    artists.length > 0 && (
                      <>
                        <h2 className="text-2xl font-bold mt-3 mb-2 px-6">
                          Artists
                        </h2>
                        <div className="grid grid-cols-5 px-3">
                          {(activeFilter === "all"
                            ? matchedArtists.slice(0, 5)
                            : matchedArtists
                          )
                            .filter((artist) => artist && artist.id)
                            .map((artist) => (
                              <ArtistCard
                                key={artist.id}
                                type="artist"
                                song={{
                                  id: artist.id,
                                  uri: artist.uri || "",
                                  name: artist.name,
                                  artists: [{ name: "Artist" }],
                                  albumCover: artist.images?.[0]?.url || "",
                                }}
                                onPlayRequest={() => {
                                  if (isGuest) {
                                    setShowGuestModal(true);
                                    return;
                                  }
                                  handlePlayArtist(artist);
                                }}
                                onClickCard={() => {
                                  navigate(`/artist/${artist.id}`);
                                }}
                              />
                            ))}
                        </div>
                      </>
                    )}
                  {isFromBrowse && matchedCategory && (
                    <div
                      className="w-full px-6 rounded-t-lg py-20 mb-10 shadow-lg "
                      style={{
                        backgroundColor: matchedCategory.color,
                        backgroundImage:
                          "linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.2))",
                      }}
                    >
                      <h1 className="text-8xl font-extrabold text-white drop-shadow-md">
                        {matchedCategory.label}
                      </h1>
                    </div>
                  )}

                  {["all", "playlists"].includes(activeFilter) &&
                    playlists.length > 0 && (
                      <>
                        <h2 className="text-xl font-semibold px-6 mb-3 text-white">
                          Playlists
                        </h2>

                        <div className="grid grid-cols-5 px-3">
                          {(activeFilter === "all" && !isFromBrowse
                            ? matchedPlaylists.slice(0, 5)
                            : matchedPlaylists
                          )
                            .filter((playlist) => playlist && playlist.id)
                            .map((playlist) => (
                              <Card
                                key={playlist.id}
                                song={{
                                  id: playlist.id,
                                  uri: playlist.uri,
                                  name: playlist.name,
                                  artists: [
                                    {
                                      name:
                                        playlist.owner?.display_name ??
                                        "Unknown",
                                    },
                                  ],
                                  albumCover: playlist.images?.[0]?.url ?? "",
                                }}
                                type="playlist"
                                onPlayRequest={() => {
                                  if (isGuest) {
                                    setShowGuestModal(true);
                                    return;
                                  }
                                  handlePlaySpotifyPlaylist(playlist);
                                }}
                              />
                            ))}
                        </div>
                      </>
                    )}

                  {["all", "albums"].includes(activeFilter) &&
                    albums.length > 0 &&
                    !isFromBrowse && (
                      <>
                        <h2 className="text-2xl font-bold mt-6 mb-2 px-6">
                          Albums
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-5 px-3">
                          {(activeFilter === "all"
                            ? matchedAlbums.slice(0, 5)
                            : matchedAlbums
                          )
                            .filter((album) => album && album.id)
                            .map((album) => (
                              <Card
                                key={album.id}
                                song={{
                                  id: album.id,
                                  uri: album.uri || "",
                                  name: album.name,
                                  artists: album.artists || [],
                                  albumCover: album.images?.[0]?.url || "",
                                }}
                                type="album"
                                onPlayRequest={() => {
                                  if (isGuest) {
                                    setShowGuestModal(true);
                                    return;
                                  }
                                  handlePlayAlbum(album);
                                }}
                                onClickCard={() => {
                                  navigate(`/album/${album.id}`);
                                }}
                              />
                            ))}
                        </div>
                      </>
                    )}
                </div>
              </>
            )}
          </div>
        </div>
      </Layout>
      {showGuestModal && (
        <GuestModalPortal onClose={() => setShowGuestModal(false)} />
      )}
    </>
  );
}
