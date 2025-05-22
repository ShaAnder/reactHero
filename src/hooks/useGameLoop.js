import { useRef, useState, useEffect, useCallback } from "react";

const TARGET_FPS = 60;
const FRAME_DURATION = 1000 / TARGET_FPS; // ms per frame

export const useGameLoop = (updateCallback, renderCallback) => {
  const [fps, setFps] = useState(0);
  const requestIdRef = useRef(null);
  const previousTimeRef = useRef();
  const fpsCounterRef = useRef(0);
  const lastFpsUpdateRef = useRef(0);
  const accumulatorRef = useRef(0);

  const loop = useCallback(
    (timestamp) => {
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = timestamp;
        lastFpsUpdateRef.current = timestamp;
      }

      // Calculate time since last frame in ms
      const deltaMs = timestamp - previousTimeRef.current;
      previousTimeRef.current = timestamp;

      accumulatorRef.current += deltaMs;

      // Only update/render if enough time has passed for our target FPS
      if (accumulatorRef.current >= FRAME_DURATION) {
        // Delta time in seconds for update/render
        const deltaTime = accumulatorRef.current / 1000;

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

        accumulatorRef.current = 0;
      }

      // Keep the loop going!
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
