import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./WorkDetail.css";
import { customAxios } from "../../utils/customAxios";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader/Loader";
import { optimizeImage } from "../../utils/optimizeImage";
import { setSeo } from "../../utils/seo";

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
        const desc = (data.description || "").trim();
        setSeo({
          title: `${data.title} | Portfolio`,
          description: desc.length > 160 ? `${desc.slice(0, 157).trimEnd()}…` : desc || undefined,
          image: data.img_url?.replace("/image/upload/", "/image/upload/f_jpg,q_auto,w_1200/"),
          path: `/portfolio/${work_id}`,
        });
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
        <button type='button' className='back-button' onClick={handleGoBack}>
          &#8592; Back
        </button>
        {isAdmin && (
          <div className='admin-actions'>
            <button
              type='button'
              className='edit-work-button'
              onClick={() => navigate(`/portfolio/edit/${work_id}`)}
            >
              Edit
            </button>
            <button type='button' className='delete-work-button' onClick={handleDelete}>
              {/* Trash icon &#128465; */} Delete
            </button>
          </div>
        )}
      </div>
      <h1 className='work-title'>{work.title} [{work.category}]</h1>
      {/* <p className='work-description'>Category: {work.category}</p> */}
      <p className='work-description'>{work.description}</p>

      <div className="work-actions">
        <button
          type="button"
          className={`like-button ${work.liked_by_user ? "liked" : ""}`}
          onClick={handleLikeUnlike}
          aria-pressed={!!work.liked_by_user}
        >
          {work.liked_by_user ? "♥ Liked" : "♡ Like"}
        </button>
        <button type="button" className="like-button inquire-button" onClick={handleOrderNow}>
          Inquire Now
        </button>
      </div>

      <div className='slideshow-container'>
        <button type='button' className='slideshow-btn prev' onClick={goToPrevious} aria-label='Previous image'>
          <span aria-hidden='true'>&#10094;</span>
        </button>
        <img
          src={optimizeImage(allImages[currentImageIndex], 1400)}
          alt={work.title}
          className='slideshow-image'
        />
        <button type='button' className='slideshow-btn next' onClick={goToNext} aria-label='Next image'>
          <span aria-hidden='true'>&#10095;</span>
        </button>
      </div>

      <div className='thumbnail-grid'>
        {allImages.map((image, index) => (
          <button
            type='button'
            key={index}
            className={`thumbnail ${
              index === currentImageIndex ? "active-thumbnail" : ""
            }`}
            onClick={() => setCurrentImageIndex(index)}
            aria-label={`Show image ${index + 1} of ${allImages.length}`}
            aria-current={index === currentImageIndex ? "true" : undefined}
          >
            <img
              src={optimizeImage(image, 200)}
              loading='lazy'
              decoding='async'
              alt=''
              width='80'
              height='80'
            />
          </button>
        ))}
      </div>
    </div>
  );

  async function handleOrderNow() {
    if (!user) {
      toast.info("You need to be logged in to inquire about a work.");
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
