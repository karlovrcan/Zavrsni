import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { playSong } from "../../states/Actors/SongActors";
import Layout from "../../Layout/Layout";
import SongBar from "../MasterBar/SongBar";
import Card from "../Card/Card";
import { useLocation } from "react-router-dom";

const Search = ({ songs = [], artists = [], albums = [], playlists = [] }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query") || "";

  return (
    <Layout>
      <div className="px-2 secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar">
        {/* Songs Section */}
        <h2 className="text-2xl font-bold mb-2 mt-2 px-6 hover:underline">
          Songs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
          {songs.length > 0 ? (
            songs.slice(0, 5).map((track) => (
              <Card
                key={track.id}
                song={{
                  id: track.id,
                  uri: track.uri,
                  name: track.name,
                  artists: track.artists,
                  albumCover: track.album?.images?.[0]?.url || "",
                }}
                handlePlay={() => dispatch(playSong(track.uri))}
              />
            ))
          ) : (
            <p className="text-center text-white">No songs found.</p>
          )}
        </div>

        {/* Playlists Section */}
        <h2 className="text-2xl font-bold mt-6 mb-2 px-6">Playlists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
          {playlists.length > 0 ? (
            playlists.slice(0, 5).map((playlist) => (
              <Card
                key={playlist.id}
                song={{
                  id: playlist.id,
                  uri: playlist.uri || "",
                  name: playlist.name,
                  artists: [
                    { name: playlist.owner?.display_name || "Unknown" },
                  ],
                  albumCover: playlist.images[0]?.url || "",
                }}
                handlePlay={() => dispatch(playSong(playlist.uri || ""))}
              />
            ))
          ) : (
            <p className="text-center text-white">No playlists found.</p>
          )}
        </div>

        {/* Artists Section */}
        <h2 className="text-2xl font-bold mt-6 mb-2 px-6">Artists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
          {artists.length > 0 ? (
            artists.slice(0, 5).map((artist) => (
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
                handlePlay={() => dispatch(playSong(artist.uri || ""))}
              />
            ))
          ) : (
            <p className="text-center text-white">No artists found.</p>
          )}
        </div>

        {/* Albums Section */}
        <h2 className="text-2xl font-bold mt-6 mb-2 px-6">Albums</h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-3">
          {albums.length > 0 ? (
            albums.slice(0, 5).map((album) => (
              <Card
                key={album.id}
                song={{
                  id: album.id,
                  uri: album.uri || "",
                  name: album.name,
                  artists: album.artists || [],
                  albumCover: album.images?.[0]?.url || "",
                }}
                handlePlay={() => dispatch(playSong(album.uri || ""))}
              />
            ))
          ) : (
            <p className="text-center text-white">No albums found.</p>
          )}
        </div>
      </div>
      <SongBar />
    </Layout>
  );
};

export default Search;
