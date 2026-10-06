import { useEffect, useRef, useState, useCallback } from 'react';

interface AutoScrollOptions {
  initialSpeed?: number; // Pixels per second (typical range 15 to 120)
}

export function useAutoScroll({ initialSpeed = 30 }: AutoScrollOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const subPixelRef = useRef<number>(0);

  const stopScrolling = useCallback(() => {
    setIsPlaying(false);
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    lastTimeRef.current = null;
  }, []);

  const startScrolling = useCallback(() => {
    setIsPlaying(true);
    lastTimeRef.current = null;
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopScrolling();
    } else {
      startScrolling();
    }
  }, [isPlaying, startScrolling, stopScrolling]);

  const resetToTop = useCallback(() => {
    const el = scrollContainerRef.current || document.documentElement;
    el.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const delta = (timestamp - lastTimeRef.current) / 1000; // in seconds
      lastTimeRef.current = timestamp;

      // Accumulate sub-pixels for sub-frame smoothness
      subPixelRef.current += speed * delta;
      const pixelsToScroll = Math.floor(subPixelRef.current);

      if (pixelsToScroll > 0) {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += pixelsToScroll;
        } else {
          window.scrollBy(0, pixelsToScroll);
        }
        subPixelRef.current -= pixelsToScroll;
      }

      // Check if reached bottom
      const container = scrollContainerRef.current;
      if (container) {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight - 2) {
          stopScrolling();
          return;
        }
      } else {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
          stopScrolling();
          return;
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, speed, stopScrolling]);

  return {
    isPlaying,
    speed,
    setSpeed,
    togglePlay,
    startScrolling,
    stopScrolling,
    resetToTop,
    scrollContainerRef,
  };
}
