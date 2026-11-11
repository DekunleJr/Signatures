import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./home.css";

import hero1 from "../../assets/hero-1.jpg";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import CategorizedWorks from "../../components/CategorizedWorks/CategorizedWorks";

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
  const allowVideo = useAllowVideo();

  return (
    <div className='home'>
      {/* Video hero: the poster paints instantly, the video fades in over it */}
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

      {/* Works grouped by category (Living Room Design, Bedroom Design, ...) */}
      <CategorizedWorks />
    </div>
  );
}
