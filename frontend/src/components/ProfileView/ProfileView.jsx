import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "../../Layout/Layout";
import Card from "../Card/Card";
import { Vibrant } from "node-vibrant/browser";

const ProfileView = () => {
  const { userId } = useParams();
  const accessToken = useSelector((state) => state.spotify.accessToken);

  const [userInfo, setUserInfo] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [bgColor, setBgColor] = useState("#000000");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!accessToken || !userId) return;
      try {
        const userRes = await fetch(
          `https://api.spotify.com/v1/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const userData = await userRes.json();
        setUserInfo(userData);

        if (userData.images?.[0]?.url) {
          Vibrant.from(userData.images[0].url)
            .getPalette()
            .then((palette) => {
              if (palette.Vibrant) setBgColor(palette.Vibrant.hex);
            })
            .catch((err) => console.error("Vibrant error:", err));
        }

        const playlistsRes = await fetch(
          `https://api.spotify.com/v1/users/${userId}/playlists`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const playlistsData = await playlistsRes.json();
        setPlaylists(playlistsData.items || []);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserData();
  }, [userId, accessToken]);

  if (!userInfo) {
    return (
      <Layout>
        <p className="text-white p-4">Loading user profile...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        style={{
          background: `linear-gradient(135deg, ${bgColor} 0%, #000000 100%)`,
        }}
        className="secondary_bg rounded-lg h-[calc(100vh-155px)] overflow-auto custom-scrollbar"
      >
        <div className="relative w-full h-[320px] pb-5 px-6 flex flex-col justify-end">
          <div className="flex items-end gap-6 flex-wrap sm:flex-nowrap pb-9">
            <img
              src={userInfo.images?.[0]?.url || ""}
              alt="Profile"
              className="w-[240px] h-[240px] object-cover rounded-full shadow-lg"
            />
            <div className="flex flex-col justify-end min-w-0">
              <p className="text-white/80 font-semibold text-sm">Profile</p>
              <h1
                className="text-white font-extrabold text-[clamp(3rem,5vw,2rem)] leading-tight break-words truncate"
                style={{ maxWidth: "100%" }}
                title={userInfo.display_name}
              >
                {userInfo.display_name}
              </h1>
              <p className="text-white/70 font-medium mt-1 text-sm truncate">
                {playlists.length} Public Playlists •{" "}
                {userInfo.followers?.total.toLocaleString()} Followers
              </p>
            </div>
          </div>
        </div>
        <div className="w-full bg-black/50 pb-[100px] pt-4 rounded-r-md">
          {playlists.length > 0 && (
            <div className="px-6 mb-10 mt-4">
              <h2 className="text-white text-3xl font-bold mb-4 ml-3">
                Public Playlists
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                {playlists.map((pl) => (
                  <Link to={`/spotify-playlist/${pl.id}`} key={pl.id}>
                    <Card
                      song={{
                        id: pl.id,
                        uri: pl.uri || "",
                        name: pl.name || "Untitled",
                        artists: [
                          {
                            name: pl.owner?.display_name || "Unknown",
                          },
                        ],
                        albumCover: pl.images?.[0]?.url || "",
                      }}
                      handlePlay={() => {}}
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfileView;
