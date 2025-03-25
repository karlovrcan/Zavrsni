import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../states/AuthContext";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { useAudio } from "../../states/AudioProvider";
import { IoIosPlay } from "react-icons/io";
import { Vibrant } from "node-vibrant/browser";
import { BsCheckCircleFill } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";

const SpotifyPlaylist = () => {
  const { token } = useContext(AuthContext);
  const [isSaved, setIsSaved] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);

  const { id } = useParams();
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const [playlist, setPlaylist] = useState(null);
  const [bgColor, setBgColor] = useState("#000000");

  const { setSongs: setGlobalSongs, setSongIndex, playPauseSong } = useAudio();
  const createAndSaveSpotifyPlaylist = async (playlistData, token) => {
    const createRes = await fetch("http://localhost:5001/api/playlists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: playlistData.name }),
    });

    const { playlist } = await createRes.json();
    const playlistId = playlist._id;

    for (const item of playlistData.tracks.items) {
      const track = item.track;
      if (!track) continue;

      const song = {
        songId: track.id,
        name: track.name,
        uri: track.uri,
        artists: track.artists,
        albumCover: track.album?.images?.[0]?.url || "",
        duration_ms: track.duration_ms,
      };

      await fetch(
        `http://localhost:5001/api/playlists/${playlistId}/add-song`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(song),
        }
      );
    }

    setIsSaved(true);
  };

  useEffect(() => {
    const fetchPlaylist = async () => {
      const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      setPlaylist(data);

      const formattedTracks = data.tracks.items
        .map(({ track }) => {
          if (!track) return null;
          return {
            id: track.id,
            uri: track.uri,
            name: track.name,
            artists: track.artists,
            albumCover: track.album?.images?.[0]?.url || "",
            duration_ms: track.duration_ms,
          };
        })
        .filter(Boolean);

      setGlobalSongs(formattedTracks);

      const coverImage =
        data.images?.[0]?.url || formattedTracks[0]?.albumCover || null;

      if (coverImage) {
        Vibrant.from(coverImage)
          .getPalette()
          .then((palette) => {
            if (palette.Vibrant) {
              setBgColor(palette.Vibrant.hex);
            }
          })
          .catch((err) => console.error("Error extracting palette:", err));
      }
    };

    if (accessToken) {
      fetchPlaylist();
    }
  }, [id, accessToken, setGlobalSongs]);

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      if (!token || !playlist) return;

      try {
        const res = await fetch("http://localhost:5001/api/playlists", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success && Array.isArray(data.playlists)) {
          setUserPlaylists(data.playlists);
          const isAlreadySaved = data.playlists.some((pl) => {
            return pl.name === playlist.name;
          });

          setIsSaved(isAlreadySaved);
        }
      } catch (err) {
        console.error("❌ Error checking if playlist is saved:", err);
      }
    };

    fetchUserPlaylists();
  }, [playlist, token]);

  if (!playlist) return <p className="text-white">Loading...</p>;

  const formattedTracks = playlist.tracks.items
    .map(({ track }) => {
      if (!track) return null;
      return {
        id: track.id,
        uri: track.uri,
        name: track.name,
        artists: track.artists,
        albumCover: track.album?.images?.[0]?.url || "",
        duration_ms: track.duration_ms,
      };
    })
    .filter(Boolean);

  const playlistImage =
    playlist.images?.[0]?.url || formattedTracks[0]?.albumCover;

  return (
    <Layout>
      <div
        style={{
          background: `linear-gradient(135deg, ${bgColor} 0%, #000000 100%)`,
        }}
        className=" secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar"
      >
        <div className="flex p-4">
          <div className="w-1/4">
            <img
              src={playlistImage}
              alt="Playlist Cover"
              className="w-[230px] h-[230px] rounded-lg object-cover drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]"
            />
          </div>
          <div className="w-3/4 place-content-end pl-2 font-extrabold text-7xl text-white">
            {playlist.name}
          </div>
        </div>
        <div className="w-full bg-black/50 pb-[100px]">
          {" "}
          <div className="flex items-center p-4 gap-4 mb-6 mt-6">
            <button
              className="bg-[#1db954] text-white font-bold p-2 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
              onClick={() => {
                setSongIndex(0);
                playPauseSong(formattedTracks[0]);
              }}
            >
              <IoIosPlay className="text-5xl pl-1" />
            </button>
            <button
              onClick={() => {
                if (!isSaved) {
                  createAndSaveSpotifyPlaylist(playlist, token);
                }
              }}
              className={`text-3xl font-bold p-1 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] ${
                isSaved ? "text-[#1db954]" : "text-white"
              }`}
            >
              {isSaved ? <BsCheckCircleFill /> : <CiCirclePlus />}
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between px-5 py-2 text-gray-300  text-sm">
              <p className="font-semibold ml-[65px]">Title / Author</p>
              <IoTimeOutline className="text-xl mr-[70px]" />
            </div>
            <div className="w-[95%]  h-[2px] bg-white/10 mx-auto"></div>
          </div>
          <div className="flex flex-col px-5 pt-2">
            {formattedTracks.map((track, index) => (
              <MiniCard
                key={`${track.id}-${index}`}
                song={track}
                onClick={() => {
                  setSongIndex(index);
                  playPauseSong(track);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SpotifyPlaylist;
