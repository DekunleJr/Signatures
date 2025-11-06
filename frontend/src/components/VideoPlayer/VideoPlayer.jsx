import React, { useRef, useEffect } from 'react';
import Player from '@vimeo/player';
import './VideoPlayer.css';

const VideoPlayer = ({ videoId }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      playerRef.current = new Player(videoRef.current, {
        id: videoId,
        loop: true,
        autoplay: true,
        muted: true,
        background: true,
      });
    }

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playerRef.current.play();
        } else {
          playerRef.current.pause();
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [videoId]);

  return <div ref={videoRef} className="video-container" />;
};

export default VideoPlayer;
