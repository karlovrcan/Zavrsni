import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Layout from "../../Layout/Layout";
import MiniCard from "../MiniCard/MiniCard";
import { useAudio } from "../../states/AudioProvider";
import { IoIosPlay } from "react-icons/io";
import { BsCheckCircleFill } from "react-icons/bs";
import { CiCirclePlus } from "react-icons/ci";
import { IoTimeOutline } from "react-icons/io5";
import { Vibrant } from "node-vibrant/browser";

const Album = () => {
  const { token } = useSelector((state) => state.account);
  const { id } = useParams();
  const accessToken = useSelector((state) => state.spotify.accessToken);

  const [albumData, setAlbumData] = useState(null);
  const [bgColor, setBgColor] = useState("#000000");
  const [isSaved, setIsSaved] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    setSongIndex,
    playPauseSong,
    loadQueue,
    isPlaying,
    currentSong,
    togglePlayPause,
  } = useAudio();
  useEffect(() => {
    const fetchAlbum = async () => {
      if (!id || !accessToken || !token) return;

      try {
        const spotifyRes = await fetch(
          `https://api.spotify.com/v1/albums/${id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const fetchedAlbumData = await spotifyRes.json();

        if (fetchedAlbumData.error) {
          console.error("Invalid album data from Spotify:", fetchedAlbumData);
          return;
        }
        setAlbumData(fetchedAlbumData);

        const coverImage = fetchedAlbumData?.images?.[0]?.url;
        if (coverImage) {
          Vibrant.from(coverImage)
            .getPalette()
            .then((palette) => {
              if (palette.Vibrant) {
                setBgColor(palette.Vibrant.hex);
              }
            })
            .catch((err) => console.error("Vibrant error:", err));
        }
      } catch (err) {
        console.error("Error fetching album data:", err);
      }
    };

    fetchAlbum();
  }, [id, accessToken, token]);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!token || !albumData?.id) return;

      try {
        const res = await fetch("http://localhost:5001/api/albums", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const alreadySaved = data.albums.some(
            (a) => a.spotifyId === albumData.id
          );
          setIsSaved(alreadySaved);
        }
      } catch (err) {
        console.error("Error checking album save status:", err);
      }
    };

    checkIfSaved();
  }, [albumData, token]);

  useEffect(() => {
    if (albumData) {
      setShowContent(false);
      setIsLoading(true);

      const delay = setTimeout(() => {
        setIsLoading(false);
        setShowContent(true);
      }, 500);

      return () => clearTimeout(delay);
    }
  }, [albumData]);

  const saveAlbumToSidebar = async () => {
    if (!albumData || !token) return;

    try {
      const res = await fetch("http://localhost:5001/api/albums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          spotifyId: albumData.id,
          name: albumData.name,
          image: albumData.images?.[0]?.url,
          artists: albumData.artists?.map((a) => ({
            name: a.name,
            id: a.id,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        if (window.addAlbumToSidebar) {
          window.addAlbumToSidebar();
        }
      }
    } catch (err) {
      console.error("Error saving album:", err);
    }
  };

  const deleteAlbumFromSidebar = async () => {
    if (!albumData || !token) return;

    try {
      const res = await fetch("http://localhost:5001/api/albums", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const match = data.albums.find((a) => a.spotifyId === albumData.id);
        if (!match) return;

        const deleteRes = await fetch(
          `http://localhost:5001/api/albums/${match._id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const deleteData = await deleteRes.json();
        if (deleteData.success) {
          setIsSaved(false);
          if (window.addAlbumToSidebar) {
            window.addAlbumToSidebar();
          }
        }
      }
    } catch (err) {
      console.error("Error deleting album:", err);
    }
  };

  const formattedTracks =
    albumData?.tracks?.items?.map((track) => ({
      uri: track.uri,
      name: track.name,
      artists: track.artists,
      album: albumData.name || "Unknown Album",
      albumId: albumData.id,
      albumCover: albumData.images?.[0]?.url || "",
      duration_ms: track.duration_ms,
    })) || [];

  const albumCoverImage = albumData?.images?.[0]?.url || "";

  const handlePlayPauseClick = () => {
    if (!formattedTracks.length || !albumData?.id) return;

    const firstTrack = formattedTracks[0];
    if (!firstTrack) return;

    if (currentSong?.uri === firstTrack.uri && isPlaying) {
      togglePlayPause();
    } else {
      loadQueue(formattedTracks, albumData.id);
      setSongIndex(0);
      setTimeout(() => {
        playPauseSong(firstTrack);
      }, 0);
    }
  };

  return (
    <Layout>
      <div className="relative h-[calc(100vh-155px)]">
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center z-50 bg-black">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#1db954]" />
              <p className="text-white text-lg">Loading album...</p>
            </div>
          </div>
        )}

        <div
          className={`transition-opacity duration-500 h-full ${
            showContent ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${bgColor} 0%, #000000 100%)`,
            }}
            className="secondary_bg rounded-lg h-full overflow-auto custom-scrollbar"
          >
            <div className="flex p-4">
              <div className="w-1/4">
                <img
                  src={albumCoverImage}
                  alt="Album Cover"
                  className="w-[230px] h-[230px] rounded-lg object-cover drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]"
                />
              </div>

              <div className="w-3/4 flex items-end pl-6 overflow-hidden">
                <h1
                  className="text-white font-extrabold w-full break-words text-[clamp(2.5rem,5vw,2rem)] leading-tight"
                  title={albumData?.name}
                >
                  {albumData?.name || "Unnamed Album"}
                </h1>
              </div>
            </div>

            <div className="w-full bg-black/30 pb-[75px]">
              <div className="flex items-center p-4 gap-4 mb-6 mt-6">
                <button
                  className="bg-[#1db954] text-white font-bold p-2 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
                  onClick={handlePlayPauseClick}
                >
                  <IoIosPlay className="text-5xl text-black pl-1" />
                </button>

                <button
                  onClick={() =>
                    isSaved ? deleteAlbumFromSidebar() : saveAlbumToSidebar()
                  }
                  className={`text-3xl font-bold p-1 transition hover:scale-110 rounded-full flex items-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] ${
                    isSaved ? "text-[#1db954]" : "text-white"
                  }`}
                >
                  {isSaved ? <BsCheckCircleFill /> : <CiCirclePlus />}
                </button>
              </div>

              <div className="flex items-center justify-between px-4 py-2 text-gray-300 text-sm">
                <p className="font-semibold w-1/3 text-center pr-[70px]">
                  Title / Author
                </p>
                <p className="font-semibold w-1/3 text-center ml-[60px]">
                  Album
                </p>
                <div className="w-1/3 flex justify-end pr-6">
                  <IoTimeOutline className="text-xl " />
                </div>
              </div>
              <div className="w-full items-center justify-between h-[2px] bg-white/10"></div>

              <div className="flex flex-col gap-2 p-4">
                {formattedTracks.map((track, index) => (
                  <MiniCard
                    key={track.uri || index}
                    song={track}
                    onClick={() => {
                      loadQueue(formattedTracks, albumData.id);
                      setSongIndex(index);
                      playPauseSong(track);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Album;
