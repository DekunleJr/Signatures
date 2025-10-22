import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./home.css";

import hero1 from "../../assets/hero-1.jpg";
import hero2 from "../../assets/hero-2.jpg";
import hero3 from "../../assets/hero-3.jpg";
import { customAxios } from "../../utils/customAxios";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";

const heroImages = [hero1, hero2, hero3];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await customAxios.get("/portfolio/");
        let projectsToSet = [];
        if (Array.isArray(data.works)) {
          projectsToSet = data.works
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
        }
        setRecentProjects(projectsToSet);
      } catch (error) {
        console.error("Error fetching recent projects:", error);
      }
    })();
  }, []);

  return (
    <div className='home'>
      {/* Old Hero Section (commented out) */}
      {/*
      <section className='hero'>
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`hero-slide ${
              index === currentImageIndex ? "active" : ""
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className='hero-overlay' />
        <div className='hero-content'>
          <h1>Creative Interior Design</h1>
          <p>
            Transforming spaces with modern and elegant interior decoration
            solutions.
          </p>
          <Link to='/portfolio'>
            <button className='btn-primary'>Check Out Our Projects</button>
          </Link>
        </div>
      </section>
      */}

      {/* New Video Hero Section */}
      <section className='hero-video'>
        <VideoPlayer videoId={1128426647} />
        <div className='hero-overlay' />
        <div className='hero-content'>
          <h1>Creative Interior Design</h1>
          <p>
            Transforming spaces with modern and elegant interior decoration
            solutions.
          </p>
          <Link to='/portfolio'>
            <button className='btn-primary'>Check Out Our Projects</button>
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className='services'>
        <div className='container'>
          <h2>Our Services</h2>
          <div className='service-grid'>
            <div className='service-card'>
              <i className='fas fa-home'></i>
              <h3>Residential Design</h3>
              <p>
                We create beautiful and functional living spaces that reflect
                your personal style. From concept to completion, we handle
                everything.
              </p>
            </div>
            <div className='service-card'>
              <i className='fas fa-building'></i>
              <h3>Commercial Design</h3>
              <p>
                Our commercial design solutions create inspiring environments
                that enhance productivity and brand identity.
              </p>
            </div>
            <div className='service-card'>
              <i className='fas fa-comments'></i>
              <h3>Consultation</h3>
              <p>
                Get expert advice on your design projects. We help you make the
                right decisions to bring your vision to life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Philosophy Section */}
      <section className='brand-philosophy'>
        <div className='container'>
          <h2>Our Brand Philosophy</h2>
          <p>
            At Signatures, we believe that great design is about more than just
            aesthetics. It's about creating spaces that are a true reflection of
            your personality and lifestyle. Our philosophy is centered around
            three core principles: creativity, quality, and sustainability. We
            are passionate about crafting unique and timeless interiors that you
            will love for years to come.
          </p>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className='portfolio'>
        <div className='container'>
          <h2>Recent Projects</h2>
          <div className='portfolio-grid'>
            {recentProjects?.length === 0 ? (
              <p>Loading recent projects...</p>
            ) : (
              recentProjects?.map((project) => (
                <div
                  key={project.id}
                  className='portfolio-item'
                  style={{ backgroundImage: `url(${project.img_url})` }}
                >
                  <div className='portfolio-info'>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className='pro_btn'>
            <Link to='/portfolio'>
              <button className='btn-primary'>View More...</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className='cta'>
        <div className='container'>
          <h2>Ready to Transform Your Space?</h2>
          <Link to='/contact'>
            <button className='btn-primary'>Contact Us</button>
          </Link>
        </div>
      </section>
    </div>
  );
}
