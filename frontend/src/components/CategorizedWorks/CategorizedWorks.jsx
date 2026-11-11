import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { customAxios } from "../../utils/customAxios";
import Loader from "../Loader/Loader";
import ProjectCard from "../ProjectCard/ProjectCard";
import "./CategorizedWorks.css";

function CategorizedWorks() {
  const [worksByCategory, setWorksByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const { data } = await customAxios.get("/home/");
        setWorksByCategory(data.works_by_category);
      } catch (err) {
        console.error("Error fetching categorized works:", err);
        setError("Failed to load works. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []);

  if (loading) {
    return (
      <section className="categorized-works" aria-busy="true" style={{ minHeight: "40vh", position: "relative" }}>
        <Loader />
      </section>
    );
  }

  if (error) {
    return (
      <section className="categorized-works">
        <div className="container">
          <p className="error-message" role="alert">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="categorized-works">
      <div className="container">
        {Object.keys(worksByCategory).length === 0 ? (
          <p>No categorized works found.</p>
        ) : (
          Object.entries(worksByCategory).map(([categoryTitle, works]) => (
            <div key={categoryTitle} className="category-section">
              <h2 className="category-title">{categoryTitle}</h2>
              <div className="categorized-works-grid">
                {works.map((work) => (
                  <ProjectCard key={work.id} project={work} width={600} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default CategorizedWorks;
