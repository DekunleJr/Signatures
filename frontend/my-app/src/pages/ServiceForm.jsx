import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import './ServiceForm.css'; // Will create this CSS file next

export default function ServiceForm() {
  const { service_id } = useParams(); // Will be undefined for 'add' mode
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState(null); // File object for img_url
  const [existingMainImageUrl, setExistingMainImageUrl] = useState(''); // For edit mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { token } = useAuth(); // Get token from AuthContext

  const isEditMode = !!service_id;

  useEffect(() => {
    if (isEditMode) {
      const fetchService = async () => {
        setLoading(true);
        try {
          const url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const response = await fetch(`${url}/api/services/${service_id}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setTitle(data.title);
          setDescription(data.description);
          setExistingMainImageUrl(data.img_url);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchService();
    }
  }, [service_id, isEditMode]);

  const handleMainImageChange = (e) => {
    setMainImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    if (mainImage) {
      formData.append('img_url', mainImage);
    } else if (isEditMode && existingMainImageUrl) {
      // In edit mode, if no new file is selected, the backend expects a string URL.
      // However, the current backend update_service endpoint expects a schemas.ServiceCreate
      // which has img_url as a string. But we are sending FormData.
      // This is a known discrepancy as per user's instruction not to change backend.
      // For now, if no new file, we won't append img_url to formData for PUT.
      // The backend PUT endpoint will need to be adjusted to handle this, or it will fail.
      // To make it work without backend change, we would need to send JSON with existing URL.
      // But user explicitly chose file input for both.
    }

    try {
      const url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const endpoint = isEditMode ? `${url}/api/services/${service_id}` : `${url}/api/services/`;
      const method = isEditMode ? 'PUT' : 'POST';

      const headers = {
        // 'Content-Type': 'multipart/form-data' is automatically set by browser when using FormData
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method: method,
        headers: headers,
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Service ${isEditMode ? 'updated' : 'added'} successfully!`);
        setTimeout(() => {
          navigate('/services'); // Redirect to services page
        }, 1500);
      } else {
        setError(data.detail || `Failed to ${isEditMode ? 'update' : 'add'} service.`);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-form-container">
      <h1>{isEditMode ? 'Edit Service' : 'Add New Service'}</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="service-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="mainImage">Main Image</label>
          <input
            type="file"
            id="mainImage"
            onChange={handleMainImageChange}
            required={!isEditMode} // Required only for new service
          />
          {isEditMode && existingMainImageUrl && (
            <p>Current main image: <a href={existingMainImageUrl} target="_blank" rel="noopener noreferrer">View</a></p>
          )}
        </div>

        <div className="form-buttons">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : (isEditMode ? 'Update Service' : 'Add Service')}
          </button>
        </div>
      </form>
    </div>
  );
}
