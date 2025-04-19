import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../Layout/Layout";
import VisualCard from "../VisualCard/VisualCard.jsx";
import ArtistCard from "../ArtistCard/ArtistCard.jsx";
import MiniCard from "../MiniCard/MiniCard.jsx";
import { useGlobalContext } from "../../states/Content.jsx";
import { useSelector } from "react-redux";
import { useAudio } from "../../states/AudioProvider.jsx";
import { Link } from "react-router-dom";

const Home = () => {
  const {
    getUser,
    playlists,
    albums,
    spotifyPlaylists,
    followedArtists,
    featuredPlaylists,
    categoryPlaylists, // { Party: [...], Pop: [...], Rock: [...] }
  } = useGlobalContext();

  const { recentlyPlayed } = useAudio();
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const [enrichedArtists, setEnrichedArtists] = useState([]);

  // fetch user on mount
  useEffect(() => {
    getUser();
  }, []);

  // Extract unique artist IDs
  const artistIdMap = useMemo(() => {
    const artistMap = new Map();

    const pushArtists = (artistArr = []) => {
      artistArr.forEach((a) => {
        if (a?.id && !artistMap.has(a.id)) {
          artistMap.set(a.id, { id: a.id, name: a.name });
        }
      });
    };

    albums?.forEach((album) => pushArtists(album.artists));
    spotifyPlaylists?.forEach((pl) =>
      pl.tracks?.forEach((track) => pushArtists(track.artists))
    );
    playlists?.forEach((pl) =>
      pl.songs?.forEach((track) => pushArtists(track.artists))
    );

    return Array.from(artistMap.values());
  }, [albums, playlists, spotifyPlaylists]);

  // fetch artist images from Spotify
  useEffect(() => {
    const fetchArtistImages = async () => {
      if (!accessToken || artistIdMap.length === 0) return;

      try {
        const responses = await Promise.all(
          artistIdMap.map(async (artist) => {
            const res = await fetch(
              `https://api.spotify.com/v1/artists/${artist.id}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            if (!res.ok) return artist;
            const data = await res.json();
            return {
              id: data.id,
              name: data.name,
              image: data.images?.[0]?.url || null,
            };
          })
        );
        const unique = new Map();
        responses.forEach((a) => unique.set(a.id, a));
        setEnrichedArtists(Array.from(unique.values()));
      } catch (err) {
        console.error("Error fetching artist images:", err);
      }
    };

    fetchArtistImages();
  }, [artistIdMap, accessToken]);

  // Debug logs
  console.log("🎧 categoryPlaylists:", categoryPlaylists);

  return (
    <Layout>
      <div className="secondary_bg h-[calc(100vh-155px)] px-4 py-4 rounded-lg mr-3 overflow-y-auto custom-scrollbar">
        {recentlyPlayed?.length > 0 && (
          <>
            <div className="px-3 flex justify-between items-center mb-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col">
                {recentlyPlayed.slice(0, 5).map((song, idx) => (
                  <MiniCard
                    key={`left-${song._id || song.uri}-${idx}`}
                    song={song}
                    hideAlbum={true}
                    onClick={() => {
                      // Optional: play logic
                    }}
                  />
                ))}
              </div>

              {/* Right column */}
              <div className="flex flex-col">
                {recentlyPlayed.slice(5, 10).map((song, idx) => (
                  <MiniCard
                    key={`right-${song._id || song.uri}-${idx}`}
                    song={song}
                    hideAlbum={true}
                    onClick={() => {
                      // Optional: play logic
                    }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {followedArtists?.length > 0 && (
          <>
            <div className="px-3 flex justify-between items-center mb-2">
              <span className="font-bold text-2xl hover:underline">
                Artists You Follow
              </span>
              <span className="text-xs hover:underline">Show all</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-6">
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
            <div className="px-3 flex justify-between items-center mb-2">
              <span className="font-bold text-2xl hover:underline">
                Albums you like
              </span>
              <span className="text-xs hover:underline">Show all</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-6">
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

        {playlists?.length > 0 && (
          <>
            <div className="px-3 flex justify-between items-center mb-2">
              <span className="font-bold text-2xl hover:underline">
                Your Playlists
              </span>
              <span className="text-xs hover:underline">Show all</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-6">
              {playlists.map((pl) => (
                <VisualCard
                  key={pl._id}
                  title={pl.name}
                  image={pl?.songs?.[0]?.albumCover || "/default_playlist.png"}
                  description={`Playlist • ${pl.userId?.username || "You"}`}
                  link={`/playlist/${pl._id}`}
                />
              ))}
            </div>
          </>
        )}

        {spotifyPlaylists?.length > 0 && (
          <>
            <div className="px-3 flex justify-between items-center mb-2">
              <span className="font-bold text-2xl hover:underline">
                Spotify Playlists
              </span>
              <span className="text-xs hover:underline">Show all</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-6">
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

        {categoryPlaylists["Party"]?.length > 0 && (
          <>
            <div className="px-3 flex justify-between items-center mb-2">
              <span className="font-bold text-2xl hover:underline">Party</span>
              <span className="text-xs hover:underline">Show all</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-6">
              {categoryPlaylists["Party"].map((playlist) => (
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

        {categoryPlaylists["Pop"]?.length > 0 && (
          <>
            <div className="px-3 flex justify-between items-center mb-2">
              <span className="font-bold text-2xl hover:underline">Pop</span>
              <span className="text-xs hover:underline">Show all</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-6">
              {categoryPlaylists["Pop"].map((playlist) => (
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

        {categoryPlaylists["Rock"]?.length > 0 && (
          <>
            <div className="px-3 flex justify-between items-center mb-2">
              <span className="font-bold text-2xl hover:underline">Rock</span>
              <span className="text-xs hover:underline">Show all</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-6">
              {categoryPlaylists["Rock"].map((playlist) => (
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
      </div>
    </Layout>
  );
};

export default Home;
