import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "../../Layout/Layout";
import BrowsePage from "../Browse/Browse";
import Card from "../Card/Card";
import MiniCard from "../MiniCard/MiniCard";
import SingularCard from "../SingularCard/SingularCard";
import { useAudio } from "../../states/AudioProvider";
import { IoTimeOutline } from "react-icons/io5";

export default function Search({
  songs = [],
  artists = [],
  albums = [],
  playlists = [],
}) {
  // Shows/hides the loading spinner & fade-in animation
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Which filter is active? "all", "artists", "playlists", "albums", "genres", etc.
  const [activeFilter, setActiveFilter] = useState("all");

  // Local “all” data is from props, but for "genres" we fetch from the server:
  const [genreSongs, setGenreSongs] = useState([]);
  const [genrePlaylists, setGenrePlaylists] = useState([]);
  const [genreAlbums, setGenreAlbums] = useState([]);
  const [genreArtists, setGenreArtists] = useState([]);

  // Audio context for playing tracks
  const {
    loadQueue,
    setSongIndex,
    playPauseSong,
    currentSong,
    isPlaying,
    togglePlayPause,
  } = useAudio();

  // Pull ?query= from the URL (e.g. /search?query=pop)
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";

  // On mount or whenever searchQuery changes, show a spinner for 800ms then fade in results
  useEffect(() => {
    setIsLoading(true);
    setShowResults(false);

    const delay = setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 800);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Whenever user selects "genres" + there's a non-empty searchQuery, fetch from server
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
            // If the server responded with success=false
            setGenreSongs([]);
            setGenrePlaylists([]);
            setGenreAlbums([]);
            setGenreArtists([]);
          }
        } catch (err) {
          console.error("Error fetching genre search:", err);
          // Clear out old data if there's an error
          setGenreSongs([]);
          setGenrePlaylists([]);
          setGenreAlbums([]);
          setGenreArtists([]);
        }
      } else {
        // If user is NOT on "genres" or searchQuery is empty,
        // reset the genre-based arrays
        setGenreSongs([]);
        setGenrePlaylists([]);
        setGenreAlbums([]);
        setGenreArtists([]);
      }
    };

    fetchGenres();
  }, [activeFilter, searchQuery]);

  // Filter out invalid playlists
  const validPlaylists = playlists.filter(
    (p) => p && p.id && p.name && p.images?.length > 0
  );
  const firstFivePlaylists = validPlaylists.slice(0, 5);

  // Function to handle playing a track from your "songs" array
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

  return (
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
                                  handlePlay={() =>
                                    playPauseSong({
                                      _id: songs[0].id,
                                      uri: songs[0].uri,
                                      name: songs[0].name,
                                      artists: songs[0].artists,
                                      albumCover:
                                        songs[0].album?.images?.[0]?.url || "",
                                      duration_ms: songs[0].duration_ms,
                                    })
                                  }
                                  titleClassName="text-[clamp(1rem,3vw,1.2rem)] font-extrabold text-white leading-tight"
                                  subtitleClassName="text-sm text-gray-400 mt-1"
                                  artistClassName="text-sm text-white font-medium mt-1"
                                />
                              )}
                            </div>

                            <div className="lg:col-span-3">
                              <div className="flex flex-col">
                                {songs
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
                                          track.album?.name || "Unknown Album",
                                        albumCover:
                                          track.album?.images?.[0]?.url || "",
                                        duration_ms: track.duration_ms,
                                      }}
                                      hideAlbum
                                      onClick={() =>
                                        handleTrackClick(track, index + 1)
                                      }
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* SONGS FILTER VIEW */}
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
                            {songs
                              .filter((track) => track && track.id)
                              .map((track, index) => (
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
                                  onClick={() => handleTrackClick(track, index)}
                                />
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                {/* 2) ARTISTS SECTION */}
                {["all", "artists"].includes(activeFilter) &&
                  artists.length > 0 && (
                    <>
                      <h2 className="text-2xl font-bold mt-6 mb-2 px-6">
                        Artists
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-5 px-3">
                        {(activeFilter === "all"
                          ? artists.slice(0, 5)
                          : artists
                        )
                          .filter((artist) => artist && artist.id)
                          .map((artist) => (
                            <Link key={artist.id} to={`/artist/${artist.id}`}>
                              <Card
                                type="artist"
                                song={{
                                  id: artist.id,
                                  uri: artist.uri || "",
                                  name: artist.name,
                                  artists: [{ name: "Artist" }],
                                  albumCover: artist.images?.[0]?.url || "",
                                }}
                                handlePlay={() => playPauseSong(artist)}
                              />
                            </Link>
                          ))}
                      </div>
                    </>
                  )}

                {/* 3) PLAYLISTS SECTION */}
                {["all", "playlists"].includes(activeFilter) &&
                  playlists.length > 0 && (
                    <>
                      <h2 className="text-2xl font-bold mt-6 mb-2 px-6">
                        Playlists
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-5 px-3">
                        {(activeFilter === "all"
                          ? playlists.slice(0, 5)
                          : playlists
                        )
                          .filter((playlist) => playlist && playlist.id)
                          .map((playlist) => (
                            <Link
                              to={`/spotify-playlist/${playlist.id}`}
                              key={playlist.id}
                            >
                              <Card
                                song={{
                                  id: playlist.id,
                                  uri: playlist.uri ?? "",
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
                                handlePlay={() => playPauseSong(playlist)}
                              />
                            </Link>
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
                        {(activeFilter === "all" ? albums.slice(0, 5) : albums)
                          .filter((album) => album && album.id)
                          .map((album) => (
                            <Link to={`/album/${album.id}`} key={album.id}>
                              <Card
                                song={{
                                  id: album.id,
                                  uri: album.uri || "",
                                  name: album.name,
                                  artists: album.artists || [],
                                  albumCover: album.images?.[0]?.url || "",
                                }}
                                handlePlay={() => playPauseSong(album)}
                              />
                            </Link>
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
  );
}
