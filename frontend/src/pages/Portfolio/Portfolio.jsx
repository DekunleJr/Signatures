import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Portfolio.css";
import { customAxios } from "../../utils/customAxios";
import Loader from "../../components/Loader/Loader";

const ITEMS_PER_PAGE = 12; // Maximum of 12 products at a time

function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalWorks, setTotalWorks] = useState(0);
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
    (async () => {
      try {
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;
        const limit = ITEMS_PER_PAGE;
        const { data } = await customAxios.get(`/portfolio?skip=${skip}&limit=${limit}`);
        setProjects(data.works);
        setTotalWorks(data.total_works);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    })();
  }, [user, currentPage]); // Re-fetch if user or current page changes

  const totalPages = Math.ceil(totalWorks / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <section className='page portfolio'>
      <h2>Our Work</h2>
      <p className='intro'>
        Explore some of our recent interior decoration projects, each designed
        with precision, creativity, and elegance.
      </p>

      {isAdmin && (
        <div className='add-work-button-container'>
          <Link to='/portfolio/add'>
            <button className='btn add-new-work-btn'>Add New Work</button>
          </Link>
        </div>
      )}

      <div className='portfolio-grid' style={{ position: "relative" }}>
        {projects.length === 0 && totalWorks === 0 ? (
          <Loader />
        ) : projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className='portfolio-item'
              style={{ backgroundImage: `url(${project.img_url})` }}
            >
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div
                className='portfolio-actions'
                style={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <div style={{ flexGrow: 1, textAlign: "center" }}>
                  {" "}
                  {/* Wrapper for centering */}
                  <Link to={`/portfolio/${project.id}`}>
                    <button className='btn view-details-btn'>
                      View Details
                    </button>
                  </Link>
                </div>
                {user && ( // Only show like icon if user is logged in
                  <span
                    className={`like-icon ${
                      project.liked_by_user ? "liked" : ""
                    }`}
                    onClick={() =>
                      handleLikeToggle(project.id, project.liked_by_user)
                    }
                    style={{
                      cursor: "pointer",
                      fontSize: "1.8em",
                      marginLeft: "auto",
                    }} // Increased size and pushed to the right
                  >
                    {project.liked_by_user ? "❤️" : "♡"}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className='pagination-controls'>
          <button
            className='btn'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`btn ${currentPage === index + 1 ? "active" : ""}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className='btn'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

export default Portfolio;
