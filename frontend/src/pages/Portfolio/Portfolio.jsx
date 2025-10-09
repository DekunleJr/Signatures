import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Portfolio.css";
import { customAxios } from "../../utils/customAxios";

function Portfolio() {
  const [projects, setProjects] = useState([]);
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
      setProjects(prevProjects =>
        prevProjects.map(project => {
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
        const { data } = await customAxios.get("/portfolio");
        const sortedProjects = data
          ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setProjects(sortedProjects);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      }
    })();
  }, [user]); // Re-fetch if user changes (e.g., login/logout)

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

      <div className='portfolio-grid'>
        {projects.length === 0 ? (
          <p>Loading projects...</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className='portfolio-item'
              style={{ backgroundImage: `url(${project.img_url})` }}
            >
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="portfolio-actions" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div style={{ flexGrow: 1, textAlign: 'center' }}> {/* Wrapper for centering */}
                  <Link to={`/portfolio/${project.id}`}>
                    <button className='btn view-details-btn'>View Details</button>
                  </Link>
                </div>
                {user && ( // Only show like icon if user is logged in
                  <span
                    className={`like-icon ${project.liked_by_user ? 'liked' : ''}`}
                    onClick={() => handleLikeToggle(project.id, project.liked_by_user)}
                    style={{ cursor: 'pointer', fontSize: '1.8em', marginLeft: 'auto' }} // Increased size and pushed to the right
                  >
                    {project.liked_by_user ? '❤️' : '♡'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Portfolio;
