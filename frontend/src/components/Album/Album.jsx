import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../states/AuthContext";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { useAudio } from "../../states/AudioProvider";
import { IoIosPlay } from "react-icons/io";
import { IoTimeOutline } from "react-icons/io5";
import { Vibrant } from "node-vibrant/browser";

const Album = () => {
  const { token } = useContext(AuthContext);
  const { id } = useParams();
  const accessToken = useSelector((state) => state.spotify.accessToken);
  const [albumData, setAlbumData] = useState(null);
  const [bgColor, setBgColor] = useState("#000000");
  const { setSongIndex, playPauseSong } = useAudio();

  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id || !accessToken || !token) return;

      try {
        // 1) Fetch the album data from Spotify
        const spotifyRes = await fetch(
          `https://api.spotify.com/v1/albums/${id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const fetchedAlbumData = await spotifyRes.json();
        setAlbumData(fetchedAlbumData);

        // 2) Extract a dominant color from the album cover, if available
        const coverImage = fetchedAlbumData.images?.[0]?.url;
        if (coverImage) {
          Vibrant.from(coverImage)
            .getPalette()
            .then((palette) => {
              if (palette.Vibrant) {
                setBgColor(palette.Vibrant.hex);
              }
            })
            .catch((err) =>
              console.error("Error extracting palette with Vibrant:", err)
            );
        }
      } catch (err) {
        console.error("❌ Error loading album:", err);
      }
    };

    fetchAlbum();
  }, [id, accessToken, token]);

  if (!albumData) {
    return <p className="text-white">Loading...</p>;
  }

  // Prepare tracks for playback
  const formattedTracks = albumData.tracks?.items
    ?.map((item) => {
      const track = item?.track || item;
      if (!track) return null;
      return {
        id: track.id,
        uri: track.uri,
        name: track.name,
        artists: track.artists,
        // Use the album's main image for each track
        albumCover: albumData.images?.[0]?.url || "",
        duration_ms: track.duration_ms,
      };
    })
    .filter(Boolean);

  const albumCoverImage =
    albumData.images?.[0]?.url ||
    (formattedTracks?.[0] ? formattedTracks[0].albumCover : "");

  return (
    <Layout>
      <div
        style={{
          background: `linear-gradient(135deg, ${bgColor} 0%, #000000 100%)`,
        }}
        className="secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar"
      >
        {/* Album Header */}
        <div className="flex p-4">
          <div className="w-1/4">
            <img
              src={albumCoverImage}
              alt="Album Cover"
              className="w-[230px] h-[230px] rounded-lg object-cover drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]"
            />
          </div>
          <div className="w-3/4 pl-2 font-extrabold text-7xl text-white">
            {albumData.name}
          </div>
        </div>

        {/* Tracks Section */}
        <div className="w-full bg-black/30 pb-[75px]">
          {/* Play & Info Buttons */}
          <div className="flex items-center p-4 gap-4 mb-6 mt-6">
            <button
              className="bg-[#1db954] text-white font-bold p-2 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
              onClick={() => {
                if (formattedTracks.length > 0) {
                  setSongIndex(0);
                  playPauseSong(formattedTracks[0]);
                }
              }}
            >
              <IoIosPlay className="text-5xl pl-1" />
            </button>
          </div>

          {/* Track Headers */}
          <div>
            <div className="flex items-center justify-between px-4 py-2 text-gray-300 text-sm">
              <p className="font-semibold ml-[65px]">Title / Author</p>
              <IoTimeOutline className="text-xl mr-[70px]" />
            </div>
            <div className="w-full h-[2px] bg-white/10"></div>
          </div>

          {/* Track List */}
          <div className="flex flex-col gap-2 p-4">
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

export default Album;
