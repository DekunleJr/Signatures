import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./WorkDetail.css";
import { customAxios } from "../../utils/customAxios";
import { useAuth } from "../../context/AuthContext";

export default function WorkDetail() {
  const { work_id } = useParams();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLikeUnlike = async () => {
    if (!user) {
      alert("You need to be logged in to like a work.");
      return;
    }

    try {
      if (work.liked_by_user) {
        // Unlike the work
        await customAxios.delete(`/like/${work_id}`);
        setWork((prevWork) => ({ ...prevWork, liked_by_user: false }));
      } else {
        // Like the work
        await customAxios.post(`/like/${work_id}`);
        setWork((prevWork) => ({ ...prevWork, liked_by_user: true }));
      }
    } catch (err) {
      console.error("Error liking/unliking work:", err);
      alert("Failed to update like status. Please try again.");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await customAxios.get(`/portfolio/${work_id}`);

        setWork(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [work_id]);

  if (loading) {
    return <div className='work-detail-container'>Loading work details...</div>;
  }

  if (error) {
    return (
      <div className='work-detail-container error-message'>Error: {error}</div>
    );
  }

  if (!work) {
    return <div className='work-detail-container'>Work not found.</div>;
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

  const isAdmin = user && user.is_admin;

  return (
    <div className='work-detail-container'>
      <div className="work-detail-header">
        <button className='back-button' onClick={handleGoBack}>
          &#8592; Back
        </button>
        {isAdmin && (
          <button
            className='edit-work-button'
            onClick={() => navigate(`/portfolio/edit/${work_id}`)}
          >
            Edit Work
          </button>
        )}
      </div>
      <h1 className='work-title'>{work.title}</h1>
      <p className='work-description'>{work.description}</p>


      <div className='slideshow-container'>
        <button className='slideshow-btn prev' onClick={goToPrevious}>
          &#10094;
        </button>
        <img
          src={allImages[currentImageIndex]}
          alt={work.title}
          className='slideshow-image'
        />
        <button className='slideshow-btn next' onClick={goToNext}>
          &#10095;
        </button>
      </div>

      <div className='thumbnail-grid'>
        {allImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Thumbnail ${index + 1}`}
            className={`thumbnail ${
              index === currentImageIndex ? "active-thumbnail" : ""
            }`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
      {user && (
        <button
          className={`like-button ${work.liked_by_user ? "liked" : ""}`}
          onClick={handleLikeUnlike}
        >
          {work.liked_by_user ? "Unlike" : "Like"}
        </button>
      )}
    </div>
  );
}
