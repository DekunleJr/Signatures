import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { customAxios, customFormAxios } from "../../utils/customAxios";
import "./AdminPage.css"; // Reusing some styles from AdminPage.css

export default function EditUser() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, toast } = useAuth();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.is_admin) {
      toast.error("You are not authorized to view this page.");
      navigate("/");
      return;
    }

    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const { data } = await customAxios.get(`/admin/${userId}`);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number || "",
        });
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError(err.message);
        toast.error(`Failed to fetch user details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, user, navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData();
    for (const key in formData) {
      if (formData[key]) { // Only append if value exists
        form.append(key, formData[key]);
      }
    }

    try {
      await customFormAxios.put(`/admin/${userId}`, form);
      toast.success("User updated successfully!");
      navigate("/admin"); // Redirect back to admin page
    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.message);
      toast.error(`Failed to update user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-page-container">Loading user details...</div>;
  }

  if (error) {
    return <div className="admin-page-container error-message">Error: {error}</div>;
  }

  if (!user || !user.is_admin) {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="admin-page-container">
      <h1>Edit User: {formData.first_name} {formData.last_name}</h1>
      <form onSubmit={handleSubmit} className="user-edit-form">
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone_number">Phone Number</label>
          <input
            type="text"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>
        <div className="form-buttons">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin")}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Updating..." : "Update User"}
          </button>
        </div>
      </form>
    </div>
  );
}
