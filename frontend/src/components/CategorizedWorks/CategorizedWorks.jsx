import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { customAxios } from "../../utils/customAxios";
import Loader from "../Loader/Loader";
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
    return <Loader />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
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
                  <div
                    key={work.id}
                    className="categorized-work-item"
                    style={{ backgroundImage: `url(${work.img_url})` }}
                  >
                    <div className="categorized-work-info">
                      <h3>{work.title}</h3>
                      <p>{work.description}</p>
                    </div>
                  </div>
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
