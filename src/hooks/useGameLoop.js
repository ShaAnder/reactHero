// hooks/useGameLoop.js
import { useRef, useState, useEffect, useCallback } from "react";

export const useGameLoop = (updateCallback, renderCallback) => {
  // Set UI FPS
  const [fps, setFps] = useState(0);
  // Holds the animation frame ID
  const requestIdRef = useRef(null);
  // Last frame's timestamp
  const previousTimeRef = useRef(0);
  // Counts frames for FPS
  const fpsCounterRef = useRef(0);
  // When we last updated FPS
  const lastFpsUpdateRef = useRef(0);

  // This is our main loop, runs every frame
  const loop = useCallback(
    (timestamp) => {
      // On the very first frame, just set up our timers
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = timestamp;
        lastFpsUpdateRef.current = timestamp;
      }

      // Delta time is the time (in seconds) since the last frame.
      // This makes movement and animation smooth, regardless of FPS.
      const deltaTime = (timestamp - previousTimeRef.current) / 1000;
      previousTimeRef.current = timestamp;

      // FPS logic: count frames, update FPS once a second
      fpsCounterRef.current++;
      if (timestamp - lastFpsUpdateRef.current >= 1000) {
        setFps(fpsCounterRef.current);
        fpsCounterRef.current = 0;
        lastFpsUpdateRef.current = timestamp;
      }

      // Update the game state (move player, handle logic, etc)
      if (updateCallback) {
        updateCallback(deltaTime);
      }

      // Draw the current frame
      if (renderCallback) {
        renderCallback(deltaTime);
      }

      // Keep the loop going!
      requestIdRef.current = requestAnimationFrame(loop);
    },
    [updateCallback, renderCallback]
  );

  useEffect(() => {
    // Start the loop when the hook is used
    requestIdRef.current = requestAnimationFrame(loop);

    // Clean up the loop if the component unmounts or loop changes
    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
  }, [loop]);
  // Return the current FPS so we can display on ui/canvas
  return fps;
};
