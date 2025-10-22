import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css"; // Using signup-specific CSS
import { customAxios } from "../../utils/customAxios";
import Loader from "../../components/Loader/Loader";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    // Basic phone number validation (e.g., 10-15 digits, optional + at the beginning)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number (10-15 digits, optional +).");
      setLoading(false);
      return;
    }

    const userData = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      password,
    };

    try {
      const url = import.meta.env.VITE_API_URL;
      await customAxios.post(`${url}/api/signup`, userData);

      setSuccess("Signup successful! Please check your email for a verification link to activate your account.");
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (error) {
      console.error("Error during signup:", error);
      setError(error.response?.data?.detail || "An error occurred during signup. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-container'>
      {" "}
      {/* Reusing login-container class */}
      <form className='signup-form' onSubmit={handleSubmit}>
        {" "}
        {/* Reusing login-form class */}
        <h2>Sign Up</h2>
        {error && <p className='error-message'>{error}</p>}
        {success && <p className='success-message'>{success}</p>}
        <div className='form-row'>
          <div className='form-group'>
            <label htmlFor='firstName'>First Name</label>
            <input
              type='text'
              id='firstName'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className='form-group'>
            <label htmlFor='lastName'>Last Name</label>
            <input
              type='text'
              id='lastName'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className='form-row'>
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
            <label htmlFor='phoneNumber'>Phone Number</label>
            <input
              type='text'
              id='phoneNumber'
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
        </div>
        <div className='form-row'>
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
          <div className='form-group'>
            <label htmlFor='confirmPassword'>Confirm Password</label>
            <input
              type='password'
              id='confirmPassword'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <button type='submit' className='btn-primary' disabled={loading}>
          {loading ? <Loader loaderType='Pulse' size={10} /> : "Sign Up"}
        </button>
        <p className='signup-link-container'>
          Already have an account? <Link to='/login'>Login</Link>
        </p>
      </form>
    </div>
  );
}
