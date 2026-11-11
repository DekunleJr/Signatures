import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Portfolio.css";
import { customAxios } from "../../utils/customAxios";
import Loader from "../../components/Loader/Loader";
import ProjectCard from "../../components/ProjectCard/ProjectCard";

const ITEMS_PER_PAGE = 12; // Maximum of 12 products at a time

function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalWorks, setTotalWorks] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loadingWorks, setLoadingWorks] = useState(true);
  const { user } = useAuth();
  const isAdmin = user && user.is_admin;

  // Function to handle liking/unliking a work
  const handleLikeToggle = async (workId, isLiked) => {
    if (!user) return; // Do nothing if no user is logged in

    try {
      let response;
      if (isLiked) {
        // Unlike the work
        response = await customAxios.delete(`/like/${workId}`);
      } else {
        // Like the work
        response = await customAxios.post(`/like/${workId}`);
      }

      // Update the projects state to reflect the change
      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.id === workId) {
            return {
              ...project,
              liked_by_user: !isLiked, // Toggle the liked status
            };
          }
          return project;
        })
      );
      console.log(response.data.message);
    } catch (error) {
      console.error("Error toggling like:", error);
      // Optionally, show an error message to the user
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await customAxios.get("/portfolio/categories");
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchWorks = async () => {
      setLoadingWorks(true);
      try {
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;
        const limit = ITEMS_PER_PAGE;
        let url = `/portfolio/?skip=${skip}&limit=${limit}`;
        if (selectedCategory) {
          url = `/portfolio/search/${selectedCategory}?skip=${skip}&limit=${limit}`;
        }
        const { data } = await customAxios.get(url);
        if (Array.isArray(data.works)) {
          setProjects(data.works);
        } else {
          setProjects([]);
        }
        if (typeof data.total_works === "number") {
          setTotalWorks(data.total_works);
        } else {
          setTotalWorks(0);
        }
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setLoadingWorks(false);
      }
    };

    fetchWorks();
  }, [user, currentPage, selectedCategory]);

  const totalPages = Math.ceil(totalWorks / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to the first page when category changes
  };

  return (
    <section className='page portfolio'>
      <h1>Our Work</h1>
      <p className='intro'>
        Explore some of our recent interior decoration projects, each designed
        with precision, creativity, and elegance.
      </p>

      {isAdmin && (
        <div className='add-work-button-container'>
          <Link to='/portfolio/add'>
            <button className='btn add-new-work-btn'>Add New Work</button>
          </Link>
          <Link to='/category'>
            <button className='btn add-new-work-btn'>Create Category</button>
          </Link>
        </div>
      )}

      <div className='filter-container'>
        <label htmlFor='category-filter'>Filter by Category:</label>
        <select id='category-filter' onChange={handleCategoryChange} value={selectedCategory}>
          <option value=''>All</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.title}
            </option>
          ))}
        </select>
      </div>

      <div className='portfolio-grid' style={{ position: "relative" }}>
        {loadingWorks && projects.length === 0 ? (
          <Loader />
        ) : projects.length === 0 ? (
          <p role='status' style={{ gridColumn: "1 / -1" }}>No projects found in this category yet.</p>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              canLike={!!user}
              onLike={handleLikeToggle}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <nav className='pagination-controls' aria-label='Portfolio pages'>
          <button
            type='button'
            className='btn'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              type='button'
              key={index + 1}
              className={`btn ${currentPage === index + 1 ? "active" : ""}`}
              onClick={() => handlePageChange(index + 1)}
              aria-label={`Page ${index + 1}`}
              aria-current={currentPage === index + 1 ? "page" : undefined}
            >
              {index + 1}
            </button>
          ))}
          <button
            type='button'
            className='btn'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}

export default Portfolio;
