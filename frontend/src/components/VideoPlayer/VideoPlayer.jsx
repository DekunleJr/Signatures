import { useRef, useEffect, useState } from "react";
import "./VideoPlayer.css";

// Vimeo's SDK is loaded on demand so it stays out of the Home critical path.
const VideoPlayer = ({ videoId }) => {
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let player;
    let observer;
    let cancelled = false;

    import("@vimeo/player").then(({ default: Player }) => {
      if (cancelled) return;
      player = new Player(el, {
        id: videoId,
        loop: true,
        autoplay: true,
        muted: true,
        background: true,
      });
      player.on("playing", () => setPlaying(true));

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!player) return;
          (entry.isIntersecting ? player.play() : player.pause()).catch(() => {});
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      player?.destroy().catch(() => {});
    };
  }, [videoId]);

  return (
    <div
      ref={containerRef}
      className={`video-container ${playing ? "is-playing" : ""}`}
      aria-hidden='true'
    />
  );
};

export default VideoPlayer;
