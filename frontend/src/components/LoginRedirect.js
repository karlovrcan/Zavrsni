import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSpotifyAccessToken } from "../states/Actions/SpotifyActions"; // ✅ Store token in Redux

const LoginRedirect = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // ✅ Get token from URL or sessionStorage
    let token =
      new URLSearchParams(window.location.hash).get("access_token") ||
      sessionStorage.getItem("spotify_access_token");

    if (token) {
      dispatch(setSpotifyAccessToken(token));
      sessionStorage.setItem("spotify_access_token", token); // ✅ Store token
      navigate("/"); // ✅ Redirect to home page
    } else {
      console.warn("⚠️ No access token found. Redirecting to login.");
      navigate("/login");
    }
  }, [dispatch, navigate]);

  return null; // ✅ No UI needed, just handle token & redirect
};

export default LoginRedirect;
