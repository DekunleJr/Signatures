import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./home.css";

import hero1 from "../../assets/hero-1.jpg";
import hero2 from "../../assets/hero-2.jpg";
import hero3 from "../../assets/hero-3.jpg";
import { customAxios } from "../../utils/customAxios";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import CategorizedWorks from "../../components/CategorizedWorks/CategorizedWorks";

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
        <VideoPlayer videoSrc="/static/signature.mp4" /* videoId={1130371383} */ />
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

      {/* Categorized Works Section */}
      <CategorizedWorks />


      {/* Portfolio Section */}
      {/* <section className='portfolio'>
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
      </section> */}
    </div>
  );
}
