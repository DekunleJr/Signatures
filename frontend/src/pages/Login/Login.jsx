import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./Login.css";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const url = import.meta.env.VITE_API_URL;
      const { data, status } = await axios.post(
        `${url}/login`,
        formData.toString(),
        {
          "Content-Type": "application/x-www-form-urlencoded",
        }
      );

      if (status === 200) {
        console.log("Login successful:", data);
        login(data.access_token, {
          first_name: data.first_name,
          is_admin: data.is_admin,
        });
        navigate(from, { replace: true }); // Redirect to previous page
      } else {
        console.error("Login failed:", data.detail);
        setError(data.detail || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred during login. Please try again later.");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    const decodedToken = jwtDecode(idToken);
    console.log("Decoded Google Token:", decodedToken);

    const googleUserData = {
      email: decodedToken.email,
      first_name: decodedToken.given_name || "",
      last_name: decodedToken.family_name || "",
      phone_number: decodedToken.phone_number || null, // Google might not provide phone_number directly
      google_id_token: idToken,
    };

    try {
      const url = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const { data, status } = await axios.post(
        `${url}/google-signup-login`,
        googleUserData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (status === 200) {
        login(data.access_token, {
          first_name: data.first_name,
          is_admin: data.is_admin,
        });
        navigate(from, { replace: true }); // Redirect to previous page
      } else {
        setError(data.detail || "Google login failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setError(
        "An error occurred during Google login. Please try again later."
      );
    }
  };

  const handleGoogleLoginError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div className='login-container'>
      <form className='login-form' onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className='error-message'>{error}</p>}
        <div className='form-group'>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            id='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type='submit' className='btn-primary'>
          Login
        </button>
        <div className='google-login-button-container'>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            useOneTap
          />
        </div>
        <p className='signup-link-container'>
          Don't have an account? <Link to='/signup'>Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
