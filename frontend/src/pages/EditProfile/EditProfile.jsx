import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { customAxios, customFormAxios } from "../../utils/customAxios";
import "./EditProfile.css";
import "../ServiceForm/ServiceForm.css";
import Loader from "../../components/Loader/Loader";

function EditProfile() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await customAxios.get("/dashboard");
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await customFormAxios.put("/profile", formData);
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.status >= 500) {
        setError("Server error. Please try again later.");
        setTimeout(() => navigate("/dashboard"), 3000);
      } else {
        setError(
          err.response?.data?.detail || "An error occurred. Please try again."
        );
      }
    }
  };

  if (loading) {
    return (
      <div style={{ margin: "auto 0" }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className='service-form-container' style={{ position: "relative" }}>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='first_name'>First Name</label>
          <input
            type='text'
            id='first_name'
            name='first_name'
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        <div className='form-group'>
          <label htmlFor='last_name'>Last Name</label>
          <input
            type='text'
            id='last_name'
            name='last_name'
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
        <div className='form-group'>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            style={{ background: "#222", color: "#fff" }}
          />
        </div>
        <div className='form-group'>
          <label htmlFor='phone_number'>Phone Number</label>
          <input
            type='text'
            id='phone_number'
            name='phone_number'
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>
        {error && <p className='error-message'>{error}</p>}
        <div className='form-buttons'>
          <button
              type='button'
              className='btn-secondary'
              onClick={() => navigate(-1)}
              >
              Cancel
          </button>
          <button type='submit' className='btn'>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;
