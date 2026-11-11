import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./home.css";

import hero1 from "../../assets/hero-1.jpg";
import { customAxios } from "../../utils/customAxios";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import ProjectCard from "../../components/ProjectCard/ProjectCard";

// Load the Vimeo background only on capable connections / motion preferences,
// and after the poster has painted.
function useAllowVideo() {
  const [allow, setAllow] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection?.saveData;
    if (reduce || saveData) return;
    const t = setTimeout(() => setAllow(true), 800);
    return () => clearTimeout(t);
  }, []);
  return allow;
}

export default function Home() {
  const [recentProjects, setRecentProjects] = useState([]);
  const allowVideo = useAllowVideo();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await customAxios.get("/portfolio/?limit=3");
        let projectsToSet = [];
        if (Array.isArray(data.works)) {
          projectsToSet = data.works.slice(0, 3); // API returns newest first
        }
        setRecentProjects(projectsToSet);
      } catch (error) {
        console.error("Error fetching recent projects:", error);
      }
    })();
  }, []);

  return (
    <div className='home'>
      {/* New Video Hero Section */}
      <section
        className='hero-video'
        style={{ backgroundImage: `url(${hero1})` }}
        aria-label='Introduction'
      >
        {allowVideo && <VideoPlayer videoId={1130371383} />}
        <div className='hero-overlay' />
        <div className='hero-content'>
          <h1>Creative Interior Design</h1>
          <p>
            Transforming spaces with modern and elegant interior decoration
            solutions.
          </p>
          <Link to='/portfolio'>
            <button type='button' className='btn-primary btn-lg'>Check Out Our Projects</button>
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
              <p role='status'>Loading recent projects…</p>
            ) : (
              recentProjects?.map((project) => (
                <ProjectCard key={project.id} project={project} width={800} />
              ))
            )}
          </div>
          <div className='pro_btn'>
            <Link to='/portfolio'>
              <button className='btn-primary btn-lg'>View all projects</button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className='cta'>
        <div className='container'>
          <h2>Ready to Transform Your Space?</h2>
          <Link to='/contact'>
            <button className='btn-primary btn-lg'>Contact Us</button>
          </Link>
        </div>
      </section>
    </div>
  );
}
