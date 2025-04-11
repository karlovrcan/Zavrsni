import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAudio } from "../../states/AudioProvider";
import MiniCard from "../MiniCard/MiniCard";
import Layout from "../../Layout/Layout";

const SongRadio = () => {
  const { seedId } = useParams();
  const { setSongs, setSongIndex, playPauseSong } = useAudio();

  const playlist = window.radioPlaylist;

  useEffect(() => {
    if (playlist?.tracks) {
      console.log("🎧 SongRadio => Received radioPlaylist:", playlist);
      setSongs(playlist.tracks);
    }
  }, [playlist, setSongs]);

  if (!playlist || playlist.seedId !== seedId) {
    return <div className="text-white p-4">Radio not found.</div>;
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-white text-3xl font-bold mb-4">{playlist.name}</h1>
        <div className="flex flex-col gap-2">
          {playlist.tracks.map((track, index) => {
            console.log(
              `SongRadio track #${index}: id="${track.id}" (len: ${track.id?.length})`
            );
            return (
              <MiniCard
                key={track.id}
                song={track}
                onClick={() => {
                  setSongIndex(index);
                  playPauseSong(track);
                }}
              />
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default SongRadio;
