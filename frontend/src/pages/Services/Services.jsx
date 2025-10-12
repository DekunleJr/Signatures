import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../../context/AuthContext";
import "./Services.css";
import { customAxios } from "../../utils/customAxios";
import Loader from "../../components/Loader/Loader";

function Services() {
  const [services, setServices] = useState([]);
  const { user, toast } = useAuth();
  const isAdmin = user && user.is_admin;
  const navigate = useNavigate(); // Initialize useNavigate

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
  }, [toast, navigate]); // Add navigate to dependency array

  const handleDeleteService = async (serviceId) => {
    if (!user || !user.is_admin) {
      toast.error("You are not authorized to delete this service.");
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );
    if (!isConfirmed) {
      return;
    }

    try {
      await customAxios.delete(`/services/${serviceId}`);
      toast.success("Service deleted successfully!");
      setServices((prevServices) =>
        prevServices.filter((svc) => svc.id !== serviceId)
      );
    } catch (err) {
      console.error("Error deleting service:", err);
      toast.error("Failed to delete service. Please try again.");
    }
  };

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

      <div className='services-cards' style={{ position: "relative" }}>
        {services?.length === 0 ? (
          <Loader />
        ) : (
          services?.map((svc) => (
            <div
              key={svc.id}
              className='service-card'
              style={{ backgroundImage: `url(${svc.img_url})` }}
            >
              <h3>{svc.title}</h3>
              <p>{svc.description}</p>
              {isAdmin && (
                <div className='service-actions'>
                  <button
                    className='btn edit-service-btn'
                    onClick={() => navigate(`/services/edit/${svc.id}`)}
                  >
                    {/* &#9998;  */}Edit
                  </button>
                  <button
                    className='btn delete-service-btn'
                    onClick={() => handleDeleteService(svc.id)}
                  >
                    {/*  &#128465;  */}Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Services;
