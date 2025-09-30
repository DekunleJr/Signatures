import { useState, useEffect } from "react";
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
            <div key={project.id} className="portfolio-item">
              <img src={project.image} alt={project.title} />
              <div className="portfolio-info">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Portfolio;
