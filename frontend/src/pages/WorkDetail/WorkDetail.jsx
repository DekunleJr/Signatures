import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./WorkDetail.css";
import { customAxios } from "../../utils/customAxios";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader/Loader";

export default function WorkDetail() {
  const { work_id } = useParams();
  const [work, setWork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { user, toast } = useAuth(); // Destructure toast from useAuth

  const handleLikeUnlike = async () => {
    if (!user) {
      toast.info("You need to be logged in to like a work.");
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
    return (
      <div
        className='work-detail-container'
        style={{ position: "relative", marginTop: "5rem", height: "100%" }}
      >
        <Loader />
      </div>
    );
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
      <div className='work-detail-header'>
        <button className='back-button' onClick={handleGoBack}>
          &#8592; Back
        </button>
        {isAdmin && (
          <div className='admin-actions'>
            <button
              className='edit-work-button'
              onClick={() => navigate(`/portfolio/edit/${work_id}`)}
            >
              Edit
            </button>
            <button className='delete-work-button' onClick={handleDelete}>
              {/* Trash icon &#128465; */} Delete
            </button>
          </div>
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
        <div className="work-actions">
          <button
            className={`like-button ${work.liked_by_user ? "liked" : ""}`}
            onClick={handleLikeUnlike}
          >
            {work.liked_by_user ? "Unlike" : "Like"}
          </button>
          <button className="like-button" onClick={handleOrderNow}>
            Contact us about this design
          </button>
        </div>
      )}
    </div>
  );

  async function handleOrderNow() {
    if (!user) {
      toast.info("You need to be logged in to order a work.");
      return;
    }

    try {
      await customAxios.post(`/portfolio/${work_id}/order`);
      toast.success("Your request has been sent! We will contact you soon.");
    } catch (err) {
      console.error("Error sending order request:", err);
      toast.error("Failed to send order request. Please try again.");
    }
  }

  async function handleDelete() {
    if (!user || !user.is_admin) {
      toast.error("You are not authorized to delete this work.");
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this work?"
    );
    if (!isConfirmed) {
      return;
    }

    try {
      await customAxios.delete(`/portfolio/${work_id}`);
      toast.success("Work deleted successfully!");
      navigate("/portfolio"); // Redirect to portfolio page
    } catch (err) {
      console.error("Error deleting work:", err);
      toast.error("Failed to delete work. Please try again.");
    }
  }
}
