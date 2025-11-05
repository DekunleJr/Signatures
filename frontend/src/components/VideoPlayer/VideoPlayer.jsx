import React, { useRef, useEffect } from 'react';
// import Player from '@vimeo/player'; // Commented out Vimeo Player import
import './VideoPlayer.css';

const VideoPlayer = ({ videoId, videoSrc }) => {
  const videoRef = useRef(null);
  const localVideoRef = useRef(null); // Ref for local video element
  // const playerRef = useRef(null); // Commented out Vimeo Player ref

  useEffect(() => {
    // Commented out Vimeo Player initialization and logic
    /*
    if (videoRef.current && videoId) {
      playerRef.current = new Player(videoRef.current, {
        id: videoId,
        loop: true,
        autoplay: true,
        muted: true,
        background: true,
      });
    }
    */

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const callback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (videoSrc && localVideoRef.current) {
            localVideoRef.current.play();
          }
          /*
          else if (videoId && playerRef.current) {
            playerRef.current.play();
          }
          */
        } else {
          if (videoSrc && localVideoRef.current) {
            localVideoRef.current.pause();
          }
          /*
          else if (videoId && playerRef.current) {
            playerRef.current.pause();
          }
          */
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    if (localVideoRef.current) {
      observer.observe(localVideoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
      if (localVideoRef.current) {
        observer.unobserve(localVideoRef.current);
      }
    };
  }, [videoId, videoSrc]);

  return (
    <>
      {videoSrc ? (
        <video
          ref={localVideoRef}
          className="video-container"
          src={videoSrc}
          loop
          autoPlay
          muted
          playsInline // Added for better mobile compatibility
          onLoadedData={() => console.log('Local video loaded successfully!')}
          onError={(e) => console.error('Error loading local video:', e)}
        />
      ) : (
        // Commented out Vimeo Player rendering
        /*
        <div ref={videoRef} className="video-container" />
        */
        <div className="video-container">
          <p>No video source provided.</p>
        </div>
      )}
    </>
  );
};

export default VideoPlayer;
