import React, { useEffect, useState, useMemo } from "react";
import Layout from "../../Layout/Layout";
import VisualCard from "../VisualCard/VisualCard.jsx";
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
        {/* Recently Played */}
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
            <div className="grid  grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-6">
              {recentlyPlayed.slice(0, 6).map((song, idx) => (
                <VisualCard
                  key={`${song._id || song.uri}-${idx}`}
                  title={song.name}
                  image={song.albumCover}
                  description={song.artists?.map((a) => a.name).join(", ")}
                  link={`/album/${song.albumId || ""}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Editor’s Picks (local + Spotify) */}
        {(featuredPlaylists.local.length > 0 ||
          featuredPlaylists.spotify.length > 0) && (
          <>
            <div className="px-3 flex justify-between items-center mb-2">
              <span className="font-bold text-2xl hover:underline">
                Editor's Picks
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-6">
              {featuredPlaylists.local.map((pl) => (
                <VisualCard
                  key={pl._id}
                  title={pl.name}
                  image={pl?.songs?.[0]?.albumCover || "/default_playlist.png"}
                  description={`Playlist • ${pl.userId?.username || "You"}`}
                  link={`/playlist/${pl._id}`}
                />
              ))}
              {featuredPlaylists.spotify.map((pl) => (
                <VisualCard
                  key={pl.spotifyId}
                  title={pl.name}
                  image={pl.image || "/default_playlist.png"}
                  description={`Spotify • ${pl.owner?.name || "Spotify"}`}
                  link={`/spotify-playlist/${pl.spotifyId}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Followed Artists */}
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
                <VisualCard
                  key={artist.id}
                  title={artist.name}
                  image={artist.image || "/default_artist.png"}
                  description="Artist"
                  link={`/artist/${artist.id}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Albums */}
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

        {/* Your Local Playlists */}
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

        {/* Your Saved Spotify Playlists (database) */}
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

        {/* Category Sections: Party, Pop, Rock */}
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

        {/* Example of how to add more categories if you see them in console logs */}
        {/* e.g. {categoryPlaylists["mood"]?.length > 0 && (...)} */}

        {/* Enriched Artists */}
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
                <VisualCard
                  key={artist.id}
                  title={artist.name}
                  image={artist.image || "/default_artist.png"}
                  description="Artist"
                  link={`/artist/${artist.id}`}
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
