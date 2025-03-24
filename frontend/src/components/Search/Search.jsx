import React, { useState } from "react";
import { useAudio } from "../../states/AudioProvider";
import Layout from "../../Layout/Layout";
import SongBar from "../MasterBar/SongBar";
import Card from "../Card/Card";
import { Link, useLocation } from "react-router-dom";
import BrowsePage from "../Browse/Browse";
import MiniCard from "../MiniCard/MiniCard";

const Search = ({ songs = [], artists = [], albums = [], playlists = [] }) => {
  const { playPauseSong } = useAudio();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";

  return (
    <Layout>
      <div className="px-2 secondary_bg rounded-lg h-[calc(100vh-155px)]  overflow-auto custom-scrollbar">
        {searchQuery === "" ? (
          <BrowsePage />
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
              <div className="ml-5 block  h-full w-full px-3">
                {songs.slice(1, 8).map((track) => (
                  <MiniCard
                    key={track.id}
                    song={{
                      id: track.id,
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
            </div>
            {playlists.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mt-6 mb-2 px-6">Playlists</h2>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
                  {playlists.slice(0, 5).map((playlist, index) => {
                    if (!playlist) {
                      return (
                        <div
                          key={`null-playlist-${index}`}
                          className="text-white"
                        >
                          No playlist data
                        </div>
                      );
                    }

                    // Use optional chaining and fallback strings so we never crash
                    return (
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
                          handlePlay={() => playPauseSong(playlist)}
                        />
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
            {artists.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mt-6 mb-2 px-6">Artists</h2>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
                  {artists.slice(0, 5).map((artist) => (
                    <Card
                      type="artist"
                      key={artist.id}
                      song={{
                        id: artist.id,
                        uri: artist.uri || "",
                        name: artist.name,
                        artists: [{ name: "Artist" }],
                        albumCover: artist.images?.[0]?.url || "",
                      }}
                      handlePlay={() => playPauseSong(artist)}
                    />
                  ))}
                </div>
              </>
            )}
            {albums.length > 0 && (
              <>
                <h2 className="text-2xl font-bold mt-6 mb-2 px-6">Albums</h2>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
                  {albums.slice(0, 5).map((album) => (
                    <Card
                      key={album.id}
                      song={{
                        id: album.id,
                        uri: album.uri || "",
                        name: album.name,
                        artists: album.artists || [],
                        albumCover: album.images?.[0]?.url || "",
                      }}
                      handlePlay={() => playPauseSong(album)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <SongBar />
    </Layout>
  );
};

export default Search;
