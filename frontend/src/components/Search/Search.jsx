import React from "react";
import { useDispatch } from "react-redux";
import { playSong } from "../../states/Actors/SongActors";
import Card from "../Card/Card";
import Layout from "../../Layout/Layout";

const Search = ({ query = [] }) => {
  // ✅ Ensure query prop is passed
  const dispatch = useDispatch();

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-155px)] overflow-auto rounded-lg custom-scrollbar secondary_bg p-3">
        {/* Grid container for the cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 ">
          {/* Render songs or 'No songs found' */}
          {Array.isArray(query) && query.length > 0 ? (
            query.map((track) => (
              <Card
                key={track.id}
                song={{
                  id: track.id,
                  uri: track.uri,
                  name: track.name,
                  artists: track.artists,
                  albumCover: track.album?.images?.[0]?.url, // ✅ Safe access to avoid crashes
                }}
                handlePlay={() => dispatch(playSong(track.uri))}
              />
            ))
          ) : (
            <p className="text-center text-white">No songs found.</p> // Message when no songs are found
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Search;
