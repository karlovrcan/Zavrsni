import React, { useState, useEffect } from "react";
import { useAudio } from "../../states/AudioProvider";
import Layout from "../../Layout/Layout";
import SongBar from "../MasterBar/SongBar";
import Card from "../Card/Card";
import { Link, useLocation } from "react-router-dom";
import BrowsePage from "../Browse/Browse";
import MiniCard from "../MiniCard/MiniCard";

const Search = ({ songs = [], artists = [], albums = [], playlists = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const { playPauseSong } = useAudio();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";

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
              <div className="flex mb-2">
                <h2 className="w-[45rem] text-2xl font-bold mb-2 mt-5 px-6">
                  Top Result
                </h2>
                <h2 className="w-full ml-2 text-2xl font-bold mb-2 mt-5 px-6 hover:underline">
                  Songs
                </h2>
              </div>
              <div className="flex">
                <div className="w-[45rem] h-auto grid grid-cols-1 gap-4 px-3 mb-5">
                  {songs.slice(0, 1).map((track) => (
                    <Card
                      key={track.id}
                      song={{
                        id: track.id || track.uri,
                        uri: track.uri,
                        name: track.name,
                        artists: track.artists,

                        albumCover: track.album?.images?.[0]?.url || "",
                      }}
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
                <div className="ml-5 block h-full w-full px-3">
                  {songs.slice(1, 8).map((track) => (
                    <MiniCard
                      key={track.id}
                      song={{
                        id: track.id,
                        uri: track.uri,
                        name: track.name,
                        artists: track.artists,
                        album: track.album?.name || "Unknown Album",
                        albumCover: track.album?.images?.[0]?.url || "",
                      }}
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
            </>
          )}
        </div>
      </div>

      <SongBar />
    </Layout>
  );
};

export default Search;
