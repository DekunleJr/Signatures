import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { customAxios } from "../../utils/customAxios";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader/Loader";
import "./VerifyEmail.css"; // Assuming a new CSS file for this page

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState("pending"); // pending, success, error
  const [message, setMessage] = useState("");
  const hasVerified = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setVerificationStatus("error");
      setMessage("No verification token found.");
      return;
    }

    const verifyAccount = async () => {
      if (hasVerified.current) {
        return;
      }
      hasVerified.current = true;

      try {
        const url = import.meta.env.VITE_API_URL;
        const { data } = await customAxios.get(`/verify-email?token=${token}`);
        
        login(data.access_token, {
          first_name: data.first_name,
          is_admin: data.is_admin,
          status: data.status,
        });
        setVerificationStatus("success");
        setMessage("Your account has been successfully verified! You are now logged in.");
        setTimeout(() => {
          navigate("/");
        }, 8000);
      } catch (err) {
        console.error("Email verification failed:", err);
        setVerificationStatus("error");
        setMessage(err.response?.data?.detail || "Account verification failed. Please try again or request a new link.");
      }
    };

    verifyAccount();
  }, [searchParams, navigate, login]);

  return (
    <div className="verify-email-container">
      {verificationStatus === "pending" && (
        <>
          <Loader />
          <p>Verifying your account...</p>
        </>
      )}
      {verificationStatus === "success" && (
        <div className="success-message">
          <h2>Verification Successful!</h2>
          <p>{message}</p>
          <button onClick={() => navigate("/")}>Go to Dashboard</button>
        </div>
      )}
      {verificationStatus === "error" && (
        <div className="error-message">
          <h2>Verification Failed</h2>
          <p>{message}</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      )}
    </div>
  );
}
