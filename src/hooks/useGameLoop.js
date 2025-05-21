// hooks/useGameLoop.js
import { useRef, useState, useEffect, useCallback } from "react";

export const useGameLoop = (updateCallback, renderCallback) => {
  const [fps, setFps] = useState(0);
  const requestIdRef = useRef(null);
  const previousTimeRef = useRef(0);
  const fpsCounterRef = useRef(0);
  const lastFpsUpdateRef = useRef(0);

  const loop = useCallback(
    (timestamp) => {
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = timestamp;
        lastFpsUpdateRef.current = timestamp;
      }

      const deltaTime = (timestamp - previousTimeRef.current) / 1000; // Convert to seconds
      previousTimeRef.current = timestamp;

      // Update FPS counter
      fpsCounterRef.current++;
      if (timestamp - lastFpsUpdateRef.current >= 1000) {
        // Update FPS every second
        setFps(fpsCounterRef.current);
        fpsCounterRef.current = 0;
        lastFpsUpdateRef.current = timestamp;
      }

      // Update game state
      if (updateCallback) {
        updateCallback(deltaTime);
      }

      // Render the frame
      if (renderCallback) {
        renderCallback(deltaTime);
      }

      // Schedule the next frame
      requestIdRef.current = requestAnimationFrame(loop);
    },
    [updateCallback, renderCallback]
  );

  useEffect(() => {
    requestIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
  }, [loop]);

  return fps;
};
