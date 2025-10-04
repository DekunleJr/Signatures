import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Services.css";
import { customAxios } from "../../utils/customAxios";

function Services() {
  const [services, setServices] = useState([]);
  const { user, toast } = useAuth();
  const isAdmin = user && user.is_admin;

  useEffect(() => {
    // Fetch from your backend
    (async () => {
      try {
        const { data } = await customAxios.get(`/services`);
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast.error(error.message);
      }
    })();
  }, [toast]);

  return (
    <section className='services-section'>
      <div className='services-hero'>
        <h2>Our Services</h2>
        <p>
          We offer you tailored interior design services that blend aesthetics
          and function.
        </p>
      </div>

      {isAdmin && (
        <div className='add-service-button-container'>
          <Link to='/services/add'>
            <button className='btn add-new-service-btn'>Add New Service</button>
          </Link>
        </div>
      )}

      <div className='services-cards'>
        {services?.length === 0 ? (
          <p>Loading services...</p>
        ) : (
          services?.map((svc) => (
            <div key={svc.id} className='service-card'>
              <div
                className='service-icon'
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
