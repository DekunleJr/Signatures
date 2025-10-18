import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./Login.css";
import axios from "axios";
import Loader from "../../components/Loader/Loader";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, toast } = useAuth();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setShowVerificationMessage(false); // Clear previous verification messages
    setLoading(true);

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const url = import.meta.env.VITE_API_URL;
      const { data } = await axios.post(`${url}/login`, formData.toString(), {
        "Content-Type": "application/x-www-form-urlencoded",
      });
      login(data.access_token, {
        first_name: data.first_name,
        is_admin: data.is_admin,
        status: data.status, // Assuming status is returned in the token payload
      });
      navigate(from, { replace: true }); // Redirect to previous page
    } catch (error) {
      console.error("Error during login:", error);
      if (error.response?.data?.detail === "Account not verified. Please check your email for a verification link.") {
        setError("Your account is pending verification. Please verify your email.");
        setShowVerificationMessage(true);
        setPendingVerificationEmail(email); // Store email to resend link
      } else if (error.response?.data?.detail === "Account blocked. Please contact support.") {
        setError("Your account is blocked. Please contact support.");
      } else {
        setError("Invalid Credentials. Please check your email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const url = import.meta.env.VITE_API_URL;
      await axios.post(`${url}/resend-verification`, { email: pendingVerificationEmail }, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      toast.success("New verification link sent to your email!");
      setError("");
      setShowVerificationMessage(false);
    } catch (error) {
      console.error("Error resending verification link:", error);
      toast.error(error.response?.data?.detail || "Failed to resend verification link. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    const decodedToken = jwtDecode(idToken);

    const googleUserData = {
      email: decodedToken.email,
      first_name: decodedToken.given_name || "",
      last_name: decodedToken.family_name || "",
      phone_number: decodedToken.phone_number || null,
      google_id_token: idToken,
    };

    try {
      const url = import.meta.env.VITE_API_URL;

      const { data } = await axios.post(
        `${url}/google-signup-login`,
        googleUserData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      login(data.access_token, {
        first_name: data.first_name,
        is_admin: data.is_admin,
      });
      navigate(from, { replace: true }); // Redirect to previous page
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
        <button type='submit' className='btn-primary' disabled={loading}>
          {loading ? <Loader loaderType='Pulse' size={10} /> : "Login"}
        </button>
        {showVerificationMessage && (
          <div className="verification-message-container">
            <p className="info-message">
              Your account is pending verification. Please check your email for a verification link.
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading ? <Loader loaderType='Pulse' size={10} /> : "Resend Verification Link"}
            </button>
          </div>
        )}
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
        <p className='signup-link-container'>
          <Link to='/forgot-password'>Forgot Password?</Link>
        </p>
      </form>
    </div>
  );
}
