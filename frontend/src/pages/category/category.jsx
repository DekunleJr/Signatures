import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { customAxios, customFormAxios } from "../../utils/customAxios";
import Loader from "../../components/Loader/Loader";
import "../ServiceForm/ServiceForm.css";

export default function CategoryForm() {
  const { category_id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const { toast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isEditMode = !!category_id;

  useEffect(() => {
    if (isEditMode) {
      const fetchCategory = async () => {
        setLoading(true);
        try {
          const { data } = await customAxios.get(
            `/portfolio/category/${category_id}`
          );
          setTitle(data.title);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCategory();
    }
  }, [category_id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("title", title);

    try {
      await (isEditMode
        ? customFormAxios.put(`/portfolio/category/${category_id}`, formData)
        : customAxios.post("/portfolio/categories", null, {
            params: { title },
          }));

      setSuccess(
        `Category ${isEditMode ? "updated" : "added"} successfully!`
      );
      toast.success(
        `Category ${isEditMode ? "updated" : "added"} successfully!`
      );
      setTimeout(() => {
        navigate("/admin");
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
    <div className='service-form-container' style={{ position: "relative" }}>
      <h1>{isEditMode ? "Edit Category" : "Add New Category"}</h1>
      {loading && <Loader />}
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

        <div className='form-buttons'>
          <button
            type='button'
            className='btn-secondary'
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button type='submit' className='btn-service' disabled={loading}>
            {loading
              ? "Submitting..."
              : isEditMode
              ? "Update Category"
              : "Add Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
