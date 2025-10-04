import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css"; // Using signup-specific CSS
import { customAxios } from "../../utils/customAxios";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Basic phone number validation (e.g., 10-15 digits, optional + at the beginning)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number (10-15 digits, optional +).");
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
      const { data, status } = customAxios.post(`${url}/signup`, userData);

      if (status === 200) {
        setSuccess("Signup successful! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.detail || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError("An error occurred during signup. Please try again later.");
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
        <button type='submit' className='btn-primary'>
          Sign Up
        </button>
        <p className='signup-link-container'>
          Already have an account? <Link to='/login'>Login</Link>
        </p>
      </form>
    </div>
  );
}
