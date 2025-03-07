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
      {" "}
      <div className="search-results">
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
          <p>No songs found.</p>
        )}
      </div>
    </Layout>
  );
};

export default Search;
