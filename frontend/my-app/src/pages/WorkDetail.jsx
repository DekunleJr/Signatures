import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './WorkDetail.css';

export default function WorkDetail() {
  const { work_id } = useParams();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkDetail = async () => {
      try {
        const url = import.meta.env.VITE_API_URL;
        const response = await fetch(`${url}/api/portfolio/${work_id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWork(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkDetail();
  }, [work_id]);

  if (loading) {
    return <div className="work-detail-container">Loading work details...</div>;
  }

  if (error) {
    return <div className="work-detail-container error-message">Error: {error}</div>;
  }

  if (!work) {
    return <div className="work-detail-container">Work not found.</div>;
  }

  const allImages = [work.img_url, ...(work.other_image_urls || [])];

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="work-detail-container">
      <button className="back-button" onClick={handleGoBack}>&#8592; Back</button>
      <h1 className="work-title">{work.title}</h1>
      <p className="work-description">{work.description}</p>

      <div className="slideshow-container">
        <button className="slideshow-btn prev" onClick={goToPrevious}>&#10094;</button>
        <img
          src={allImages[currentImageIndex]}
          alt={work.title}
          className="slideshow-image"
        />
        <button className="slideshow-btn next" onClick={goToNext}>&#10095;</button>
      </div>

      <div className="thumbnail-grid">
        {allImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Thumbnail ${index + 1}`}
            className={`thumbnail ${index === currentImageIndex ? 'active-thumbnail' : ''}`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
