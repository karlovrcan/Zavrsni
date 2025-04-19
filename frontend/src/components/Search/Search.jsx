import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../../Layout/Layout";
import BrowsePage from "../Browse/Browse";
import Card from "../Card/Card";
import MiniCard from "../MiniCard/MiniCard";
import SingularCard from "../SingularCard/SingularCard";
import { useAudio } from "../../states/AudioProvider";
import { IoTimeOutline } from "react-icons/io5";
import GuestModalPortal from "../GuestModal/GuestModalPortal";
import { useNavigate } from "react-router-dom";
import ArtistCard from "../ArtistCard/ArtistCard";

export default function Search({
  songs = [],
  artists = [],
  albums = [],
  playlists = [],
}) {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.account);
  const isGuest = !isAuthenticated || user?.role === "guest";
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const [activeFilter, setActiveFilter] = useState("all");

  const [genreSongs, setGenreSongs] = useState([]);
  const [genrePlaylists, setGenrePlaylists] = useState([]);
  const [genreAlbums, setGenreAlbums] = useState([]);
  const [genreArtists, setGenreArtists] = useState([]);

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

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";
  const queryTokens = searchQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

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
    const fetchGenres = async () => {
      if (activeFilter === "genres" && searchQuery.trim() !== "") {
        try {
          const res = await fetch(
            `/api/search?type=genre&query=${encodeURIComponent(searchQuery)}`
          );
          const data = await res.json();
          if (data.success) {
            // Store the results in local state
            setGenreSongs(data.songs || []);
            setGenrePlaylists(data.playlists || []);
            setGenreAlbums(data.albums || []);
            setGenreArtists(data.artists || []);
          } else {
            setGenreSongs([]);
            setGenrePlaylists([]);
            setGenreAlbums([]);
            setGenreArtists([]);
          }
        } catch (err) {
          console.error("Error fetching genre search:", err);
          setGenreSongs([]);
          setGenrePlaylists([]);
          setGenreAlbums([]);
          setGenreArtists([]);
        }
      } else {
        setGenreSongs([]);
        setGenrePlaylists([]);
        setGenreAlbums([]);
        setGenreArtists([]);
      }
    };

    fetchGenres();
  }, [activeFilter, searchQuery]);

  const handlePlaySpotifyPlaylist = async (playlistMeta) => {
    if (currentPlaylistId === playlistMeta.id && isPlaying) {
      togglePlayPause();
      return;
    }

    if (currentPlaylistId === playlistMeta.id && !isPlaying) {
      togglePlayPause();
      return;
    }

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistMeta.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await res.json();
      const tracks =
        data.tracks?.items
          ?.map(({ track }) => {
            if (!track || !track.uri) return null;
            return {
              uri: track.uri,
              name: track.name,
              artists: track.artists,
              album: track.album?.name || "Unknown Album",
              albumId: track.album?.id || "",
              albumCover: track.album?.images?.[0]?.url || "",
              duration_ms: track.duration_ms,
            };
          })
          .filter(Boolean) || [];

      if (tracks.length === 0) return;

      loadQueue(tracks, playlistMeta.id);
      setCurrentPlaylistId(playlistMeta.id);
      setSongIndex(0);
      playPauseSong(tracks[0]);
    } catch (err) {
      console.error("Failed to fetch and play playlist:", err);
    }
  };

  const handlePlayArtist = async (artist) => {
    if (!artist?.id || !accessToken) return;

    if (currentPlaylistId === artist.id && isPlaying) {
      togglePlayPause();
      return;
    }

    if (currentPlaylistId === artist.id && !isPlaying) {
      togglePlayPause();
      return;
    }

    try {
      const res = await fetch(
        `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const data = await res.json();
      const topTracks =
        data.tracks?.map((track) => ({
          uri: track.uri,
          name: track.name,
          artists: track.artists,
          album: track.album?.name || "Unknown Album",
          albumId: track.album?.id || "",
          albumCover: track.album?.images?.[0]?.url || "",
          duration_ms: track.duration_ms,
        })) || [];

      if (topTracks.length === 0) return;

      loadQueue(topTracks, artist.id);
      setCurrentPlaylistId(artist.id);
      setSongIndex(0);
      playPauseSong(topTracks[0]);
    } catch (err) {
      console.error("❌ Failed to play artist:", err);
    }
  };

  const handlePlayAlbum = async (album) => {
    if (!album?.id || !accessToken) return;

    if (currentPlaylistId === album.id && isPlaying) {
      togglePlayPause();
      return;
    }

    if (currentPlaylistId === album.id && !isPlaying) {
      togglePlayPause();
      return;
    }

    try {
      const res = await fetch(`https://api.spotify.com/v1/albums/${album.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      const tracks =
        data.tracks?.items?.map((track) => ({
          uri: track.uri,
          name: track.name,
          artists: track.artists,
          album: data.name || "Unknown Album",
          albumId: data.id,
          albumCover: data.images?.[0]?.url || "",
          duration_ms: track.duration_ms,
        })) || [];

      if (tracks.length === 0) return;

      loadQueue(tracks, album.id);
      setCurrentPlaylistId(album.id);
      setSongIndex(0);
      playPauseSong(tracks[0]);
    } catch (err) {
      console.error("❌ Failed to play album:", err);
    }
  };

  const validPlaylists = playlists.filter(
    (p) => p && p.id && p.name && p.images?.length > 0
  );
  const firstFivePlaylists = validPlaylists.slice(0, 5);

  const handleTrackClick = (track, index) => {
    if (!songs || !songs.length) return;
    loadQueue(
      songs.map((t) => ({
        uri: t.uri,
        name: t.name,
        artists: t.artists,
        album: t.album?.name || "Unknown Album",
        albumCover: t.album?.images?.[0]?.url || "",
        duration_ms: t.duration_ms,
      })),
      "search-results"
    );
    setSongIndex(index);
    playPauseSong(track);
  };

  const tokenizedMatch = (text, tokens) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return tokens.some((token) => lower.includes(token));
  };

  const songMatchesQuery = (song, tokens) => {
    return (
      tokenizedMatch(song.name, tokens) ||
      song.artists?.some((a) => tokenizedMatch(a.name, tokens)) ||
      tokenizedMatch(song.album?.name, tokens)
    );
  };

  const artistMatchesQuery = (artist, tokens) => {
    return tokenizedMatch(artist.name, tokens);
  };

  const albumMatchesQuery = (album, tokens) => {
    return (
      tokenizedMatch(album.name, tokens) ||
      album.artists?.some((a) => tokenizedMatch(a.name, tokens))
    );
  };

  const playlistMatchesQuery = (playlist, tokens) => {
    return (
      tokenizedMatch(playlist.name, tokens) ||
      tokenizedMatch(playlist.owner?.display_name, tokens)
    );
  };

  const matchedSongs = songs.filter(
    (song) => song && songMatchesQuery(song, queryTokens)
  );

  const matchedArtists = artists.filter(
    (artist) => artist && artistMatchesQuery(artist, queryTokens)
  );

  const matchedAlbums = albums.filter(
    (album) => album && albumMatchesQuery(album, queryTokens)
  );

  const matchedPlaylists = playlists.filter(
    (playlist) => playlist && playlistMatchesQuery(playlist, queryTokens)
  );

  return (
    <>
      {" "}
      <Layout>
        <div
          className={`transition-opacity duration-500 ${
            showResults ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="px-2 secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar">
            {searchQuery === "" ? (
              <BrowsePage />
            ) : isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1db954]" />
                  <p className="text-white text-lg">Searching...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-4 px-6 py-3 fixed top-[64px] left-[440px] right-[20px] z-40 bg-[#121212]  justify-start text-sm">
                  <button
                    className={`${
                      activeFilter === "all"
                        ? "bg-white text-black"
                        : "tertiary_bg text-white"
                    } px-4 py-2 rounded-full transition hover:scale-110`}
                    onClick={() => setActiveFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`${
                      activeFilter === "songs"
                        ? "bg-white text-black"
                        : "tertiary_bg text-white"
                    } px-4 py-2 rounded-full transition hover:scale-110`}
                    onClick={() => setActiveFilter("songs")}
                  >
                    Songs
                  </button>
                  <button
                    className={`${
                      activeFilter === "artists"
                        ? "bg-white text-black"
                        : "tertiary_bg text-white"
                    } px-4 py-2 rounded-full transition hover:scale-110`}
                    onClick={() => setActiveFilter("artists")}
                  >
                    Artists
                  </button>
                  <button
                    className={`${
                      activeFilter === "playlists"
                        ? "bg-white text-black"
                        : "tertiary_bg text-white"
                    } px-4 py-2 rounded-full transition hover:scale-110`}
                    onClick={() => setActiveFilter("playlists")}
                  >
                    Playlists
                  </button>
                  <button
                    className={`${
                      activeFilter === "albums"
                        ? "bg-white text-black"
                        : "tertiary_bg text-white"
                    } px-4 py-2 rounded-full transition hover:scale-110 `}
                    onClick={() => setActiveFilter("albums")}
                  >
                    Albums
                  </button>
                </div>

                <div className="px-3 pt-20 pb-6 secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar">
                  {["all", "songs"].includes(activeFilter) &&
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

                        {activeFilter === "songs" && (
                          <div>
                            <div className="flex items-center justify-between px-4 py-2 text-gray-300 text-sm">
                              <p className="font-semibold w-1/3 text-center pr-[40px]">
                                Title / Author
                              </p>
                              <p className="font-semibold w-1/3 text-center ml-[75px]">
                                Album
                              </p>
                              <div className="w-1/3 flex justify-end pr-[30px]">
                                <IoTimeOutline className="text-xl " />
                              </div>
                            </div>
                            <div className="w-full h-[2px] bg-white/10"></div>
                            <div className="flex flex-col px-6 pt-3">
                              {matchedSongs.map((track, index) => (
                                <MiniCard
                                  key={track.uri || track.id}
                                  song={{
                                    id: track.id,
                                    uri: track.uri,
                                    name: track.name,
                                    artists: track.artists,
                                    album: track.album?.name || "Unknown Album",
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
                          </div>
                        )}
                      </>
                    )}

                  {["all", "artists"].includes(activeFilter) &&
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

                  {/* 3) PLAYLISTS SECTION */}
                  {["all", "playlists"].includes(activeFilter) &&
                    playlists.length > 0 && (
                      <>
                        <h2 className="text-2xl font-bold mt-3 mb-2 px-6">
                          Playlists
                        </h2>
                        <div className="grid grid-cols-5 px-3">
                          {(activeFilter === "all"
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

                  {/* 4) ALBUMS SECTION */}
                  {["all", "albums"].includes(activeFilter) &&
                    albums.length > 0 && (
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
