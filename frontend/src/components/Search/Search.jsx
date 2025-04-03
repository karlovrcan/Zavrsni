import React, { useState, useEffect } from "react";
import { useAudio } from "../../states/AudioProvider";
import Layout from "../../Layout/Layout";
import SongBar from "../MasterBar/SongBar";
import Card from "../Card/Card";
import { Link, useLocation } from "react-router-dom";
import BrowsePage from "../Browse/Browse";
import MiniCard from "../MiniCard/MiniCard";
import SingularCard from "../SingularCard/SingularCard";

const Search = ({
  songs = [],
  artists = [],
  albums = [],
  playlists = [],
  genres = [],
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const { playPauseSong } = useAudio();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";
  const matchingCategories = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setIsLoading(true);
    setShowResults(false);

    const delay = setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 800);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const validPlaylists = playlists.filter(
    (p) => p && p.id && p.name && p.images?.length > 0
  );
  const firstFivePlaylists = validPlaylists.slice(0, 5);

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
              <div className="flex mb-2 px-6">
                <h2 className="w-1/3 text-2xl font-bold mt-5">Top Result</h2>
                <h2 className="w-2/3 text-2xl font-bold mt-5">Songs</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 items-stretch">
                <div className="col-span-1">
                  {songs.length > 0 && (
                    <SingularCard
                      song={{
                        id: songs[0].id || songs[0].uri,
                        uri: songs[0].uri,
                        name: songs[0].name,
                        artists: songs[0].artists,
                        albumCover: songs[0].album?.images?.[0]?.url || "",
                      }}
                      handlePlay={() =>
                        playPauseSong({
                          _id: songs[0].id,
                          uri: songs[0].uri,
                          name: songs[0].name,
                          artists: songs[0].artists,
                          albumCover: songs[0].album?.images?.[0]?.url || "",
                          duration_ms: songs[0].duration_ms,
                        })
                      }
                    />
                  )}
                </div>

                <div className="col-span-1 lg:col-span-2">
                  <div className="flex flex-col">
                    {songs.slice(1, 5).map((track) => (
                      <MiniCard
                        key={track.id}
                        song={{
                          id: track.id,
                          uri: track.uri,
                          name: track.name,
                          artists: track.artists,
                          album: track.album?.name || "Unknown Album",
                          albumCover: track.album?.images?.[0]?.url || "",
                          duration_ms: track.duration_ms,
                        }}
                        hideAlbum={true}
                        handlePlay={() =>
                          playPauseSong({
                            _id: track.id,
                            uri: track.uri,
                            name: track.name,
                            artists: track.artists,
                            albumCover: track.album?.images?.[0]?.url || "",
                            duration_ms: track.duration_ms,
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              {firstFivePlaylists.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold mt-6 mb-2 px-6">
                    Playlists
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
                    {firstFivePlaylists.map((playlist, index) => (
                      <Link
                        to={`/spotify-playlist/${playlist.id}`}
                        key={playlist.id}
                      >
                        <Card
                          key={playlist.id}
                          song={{
                            id: playlist.id,
                            uri: playlist.uri ?? "",
                            name: playlist.name,
                            artists: [
                              {
                                name: playlist.owner?.display_name ?? "Unknown",
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

              {artists.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold mt-6 mb-2 px-6">Artists</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
                    {artists.slice(0, 5).map((artist) => (
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

              {albums.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold mt-6 mb-2 px-6">Albums</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
                    {albums.slice(0, 5).map((album) => (
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
              {matchingCategories.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold mt-6 mb-2 px-6">
                    Keyword Category
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
                    {matchingCategories.slice(0, 5).map((genre) => (
                      <Link to={`/genre/${genre.id}`} key={genre.id}>
                        <Card
                          song={{
                            id: genre.id,
                            uri: genre.uri || "",
                            name: genre.name,
                            artists: [{ name: "Category" }],
                            albumCover: genre.icons?.[0]?.url || "",
                          }}
                          handlePlay={() => playPauseSong(genre)}
                        />
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <SongBar />
    </Layout>
  );
};

export default Search;
