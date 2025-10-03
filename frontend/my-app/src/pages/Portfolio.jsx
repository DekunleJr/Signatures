import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Portfolio.css";

function Portfolio() {
  const [projects, setProjects] = useState([]);

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
