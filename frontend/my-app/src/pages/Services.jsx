import { useState, useEffect } from "react";
import "./Services.css";

function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    // Fetch from your backend
    fetch("http://localhost:8000/api/services")
      .then((res) => res.json())
      .then((data) => {
        setServices(data);
      })
      .catch((err) => {
        console.error("Error fetching services:", err);
        // Optionally fallback to static list
      });
  }, []);

  return (
    <section className="services-section">
      <div className="services-hero">
        <h2>Our Services</h2>
        <p>
          We offer you tailored interior design services that blend aesthetics and function.
        </p>
      </div>

      <div className="services-cards">
        {services.length === 0 ? (
          <p>Loading services...</p>
        ) : (
          services.map((svc) => (
            <div key={svc.id} className="service-card">
              <div
                className="service-icon"
                style={{ backgroundImage: `url(${svc.img_url})` }}
              >
                {/* Background image applied via style */}
              </div>
              <h3>{svc.title}</h3>
              <p>{svc.description}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Services;
