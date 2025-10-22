import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { customAxios } from "../../utils/customAxios";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const url = import.meta.env.VITE_API_URL;
      await customAxios.post(`${url}/api/forgot-password`, { email });
      setSuccess("OTP sent to your email address.");
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Failed to send OTP. Please check the email address and try again.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const url = import.meta.env.VITE_API_URL;
      await customAxios.post(`${url}/api/reset-password`, {
        email,
        otp,
        new_password: newPassword,
      });
      setSuccess("Password has been reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setError("Failed to reset password. The OTP may be incorrect or expired.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={otpSent ? handleResetPassword : handleSendOtp}>
        <h2>Reset Password</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        
        {!otpSent ? (
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="otp">OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}
        
        <button type="submit" className="btn-primary">
          {otpSent ? "Reset Password" : "Send OTP"}
        </button>
        <p className="signup-link-container">
          <Link to="/login">Back to Login</Link>
        </p>
      </form>
    </div>
  );
}
