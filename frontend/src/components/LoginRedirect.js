import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSpotifyAccessToken } from "../states/Actions/SpotifyActions";

const LoginRedirect = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Read from the query string instead of the hash
    const urlParams = new URLSearchParams(window.location.search);
    const token =
      urlParams.get("access_token") ||
      sessionStorage.getItem("spotify_access_token");
    const refreshToken = urlParams.get("refresh_token");

    if (token) {
      // Put token in Redux
      dispatch(setSpotifyAccessToken(token));
      // Also store in sessionStorage
      sessionStorage.setItem("spotify_access_token", token);

      // If you want to save the refresh token:
      if (refreshToken) {
        sessionStorage.setItem("spotify_refresh_token", refreshToken);
      }

      // Navigate home
      navigate("/");
    } else {
      console.warn("⚠️ No access token found. Redirecting to login.");
      navigate("/login");
    }
  }, [dispatch, navigate]);

  return null; // no UI needed
};

export default LoginRedirect;
