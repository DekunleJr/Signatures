import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import useAuth
import "./WorkForm.css"; // Will create this CSS file next
import { customAxios, customFormAxios } from "../../utils/customAxios";

export default function WorkForm() {
  const { work_id } = useParams(); // Will be undefined for 'add' mode
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const { toast } = useAuth(); // Get token from AuthContext
  const [description, setDescription] = useState("");
  const [mainImage, setMainImage] = useState(null); // File object
  const [otherImages, setOtherImages] = useState([]); // List of File objects
  const [existingMainImageUrl, setExistingMainImageUrl] = useState(""); // For edit mode
  const [existingOtherImageUrls, setExistingOtherImageUrls] = useState([]); // For edit mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // const { token } = useAuth(); // Get token from AuthContext

  const isEditMode = !!work_id;

  useEffect(() => {
    if (isEditMode) {
      const fetchWork = async () => {
        setLoading(true);
        try {
          const response = await customAxios.get(`/portfolio/${work_id}`);
          const data = response.data;

          setTitle(data.title);
          setDescription(data.description);
          setExistingMainImageUrl(data.img_url);
          setExistingOtherImageUrls(data.other_image_urls || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchWork();
    }
  }, [work_id, isEditMode]);

  const handleMainImageChange = (e) => {
    setMainImage(e.target.files[0]);
  };

  const handleOtherImagesChange = (e) => {
    setOtherImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    if (mainImage) {
      formData.append("img_url", mainImage);
    } else if (isEditMode && existingMainImageUrl) {
      // If in edit mode and no new main image is selected, but an old one exists,
      // we might need a way to signal to the backend to keep the old one.
      // For now, if no new file, it won't be in formData, backend should handle this.
    }

    otherImages.forEach((file) => {
      formData.append("other_images", file);
    });
    // If in edit mode and no new other images are selected, but old ones exist,
    // backend should handle keeping them or clearing if an empty array is sent.

    try {
      await (isEditMode
        ? customFormAxios.put(`/portfolio/${work_id}`, formData)
        : customFormAxios.post("/portfolio", formData));

      setSuccess(`Work ${isEditMode ? "updated" : "added"} successfully!`);
      toast.success(`Work ${isEditMode ? "updated" : "added"} successfully!`);
      setTimeout(() => {
        navigate("/portfolio"); // Redirect to portfolio page
      }, 1500);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.message);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='work-form-container'>
      <h1>{isEditMode ? "Edit Work" : "Add New Work"}</h1>
      {loading && <p>Loading...</p>}
      {error && <p className='error-message'>{error}</p>}
      {success && <p className='success-message'>{success}</p>}

      <form onSubmit={handleSubmit} className='work-form'>
        <div className='form-group'>
          <label htmlFor='title'>Title</label>
          <input
            type='text'
            id='title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='description'>Description</label>
          <textarea
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div className='form-group'>
          <label htmlFor='mainImage'>Main Image</label>
          <input
            type='file'
            id='mainImage'
            onChange={handleMainImageChange}
            required={!isEditMode} // Required only for new work
          />
          {isEditMode && existingMainImageUrl && (
            <div>
              <p>Current main image:</p>
              <img
                src={existingMainImageUrl}
                alt="Current Work Main Image"
                className="current-main-image-thumbnail"
              />
            </div>
          )}
        </div>

        <div className='form-group'>
          <label htmlFor='otherImages'>Other Images (optional)</label>
          <input
            type='file'
            id='otherImages'
            multiple
            onChange={handleOtherImagesChange}
          />
          {isEditMode && existingOtherImageUrls.length > 0 && (
            <div>
              <p>Current other images:</p>
              <div className='existing-thumbnails'>
                {existingOtherImageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Existing other image ${index + 1}`}
                    className='existing-thumbnail'
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='form-buttons'>
          <button
            type='button'
            className='btn btn-secondary'
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button type='submit' className='btn-primary' disabled={loading}>
            {loading
              ? "Submitting..."
              : isEditMode
              ? "Update Work"
              : "Add Work"}
          </button>
        </div>
      </form>
    </div>
  );
}
