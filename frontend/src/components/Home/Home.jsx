import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../Layout/Layout";
import VisualCard from "../VisualCard/VisualCard.jsx";
import ArtistCard from "../ArtistCard/ArtistCard.jsx";
import MiniCard from "../MiniCard/MiniCard.jsx";
import { useGlobalContext } from "../../states/Content.jsx";
import { useSelector } from "react-redux";
import { useAudio } from "../../states/AudioProvider.jsx";
import { Link } from "react-router-dom";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import RecentCard from "../RecentCard/RecentCard.jsx";

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
  const navigate = useNavigate();

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
          </>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-3 px-3 my-10">
              {recentCollections.slice(0, 8).map((item) => (
                <RecentCard key={item.collectionId || item.title} item={item} />
              ))}
            </div>

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
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-[60px]">
                  {playlists.map((pl) => (
                    <VisualCard
                      key={pl._id}
                      id={pl._id}
                      title={pl.name}
                      image={
                        pl?.songs?.[0]?.albumCover || "/default_playlist.png"
                      }
                      description={`Playlist • ${pl.userId?.username || "You"}`}
                      link={`/playlist/${pl._id}`}
                      tracks={pl.songs || []}
                      type="playlist"
                    />
                  ))}
                </div>
              </>
            )}

            {spotifyPlaylists?.length > 0 && (
              <>
                <div className="px-3 flex justify-between items-center mb-3">
                  <span className="font-bold text-2xl hover:underline">
                    Public Playlists
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-[60px]">
                  {spotifyPlaylists.map((pl) => (
                    <VisualCard
                      key={pl.spotifyId}
                      id={pl.spotifyId}
                      title={pl.name}
                      image={pl.image || "/default_playlist.png"}
                      description={`Playlist • ${pl.owner?.name || "Spotify"}`}
                      link={`/spotify-playlist/${pl.spotifyId}`}
                      tracks={pl.tracks || []}
                      type="playlist"
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
                      onPlayRequest={() => handlePlayArtist(artist)}
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
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-[60px]">
                  {albums.map((album) => (
                    <VisualCard
                      key={album._id}
                      id={album._id}
                      title={album.name}
                      image={album.image}
                      description={`Album • ${
                        album.artists?.[0]?.name || "Unknown"
                      }`}
                      link={`/album/${album.spotifyId}`}
                      tracks={album.tracks || []}
                      type="album"
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
