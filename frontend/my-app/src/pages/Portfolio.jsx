import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import "./Portfolio.css";

function Portfolio() {
  const [projects, setProjects] = useState([]);
  const { user } = useAuth();
  const isAdmin = user && user.is_admin;

  useEffect(() => {
    fetch("http://localhost:8000/api/portfolio")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error fetching portfolio:", err));
  }, []);

  return (
    <section className="page portfolio">
      <h2>Our Work</h2>
      <p className="intro">
        Explore some of our recent interior decoration projects, each designed
        with precision, creativity, and elegance.
      </p>

      {isAdmin && (
        <div className="add-work-button-container">
          <Link to="/portfolio/add">
            <button className="btn add-new-work-btn">Add New Work</button>
          </Link>
        </div>
      )}

      <div className="portfolio-grid">
        {projects.length === 0 ? (
          <p>Loading projects...</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="portfolio-item"
              style={{ backgroundImage: `url(${project.img_url})` }}
            >
              
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <Link to={`/portfolio/${project.id}`}>
                <button className="btn view-details-btn">View Details</button>
              </Link>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Portfolio;
