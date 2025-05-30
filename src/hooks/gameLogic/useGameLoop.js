import { useRef, useState, useEffect, useCallback } from "react";
import { FRAME_DURATION } from "../../constants/gameConfig";

/**
 * Custom React hook for a fixed-timestep game loop using requestAnimationFrame.
 *
 * Features:
 * - Ensures game updates and renders happen consistently (~60 times per second).
 * - Separates logic (update) and visual rendering (draw).
 * - Tracks actual FPS for debugging/performance UI.
 *
 * @param {Function} updateCallback - Updates game logic (e.g., player movement, AI).
 * @param {Function} renderCallback - Draws current game frame (e.g., canvas render).
 * @returns {number} fps - The real number of frames per second.
 */
export const useGameLoop = (updateCallback, renderCallback) => {
  // Current FPS to expose to UI
  const [fps, setFps] = useState(0);

  // Animation frame ID (so we can cancel it on cleanup)
  const requestIdRef = useRef(null);

  // Last timestamp from RAF
  const previousTimeRef = useRef();

  // Tracks leftover time between frames
  const accumulatorRef = useRef(0);

  // Frames counted within the current second
  const fpsCounterRef = useRef(0);

  // Last time FPS was updated
  const lastFpsUpdateRef = useRef(0);

  // Core loop (stable reference thanks to useCallback)
  const loop = useCallback(
    (timestamp) => {
      // First frame: setup timestamps
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = timestamp;
        lastFpsUpdateRef.current = timestamp;
      }

      // Time difference from last frame
      const deltaMs = timestamp - previousTimeRef.current;

      // Update previousTimeRef for next frame
      previousTimeRef.current = timestamp;

      // Add this time to our accumulator
      accumulatorRef.current += deltaMs;

      // Cap accumulator to avoid spiral of death (too much lag = one massive update)
      if (accumulatorRef.current > 3 * FRAME_DURATION) {
        accumulatorRef.current = FRAME_DURATION;
      }

      // Proceed only if we’ve accumulated enough time to simulate a new frame
      if (accumulatorRef.current >= FRAME_DURATION) {
        // Fixed update step in seconds
        const deltaTime = FRAME_DURATION / 1000;

        // Count this frame for FPS calculation
        fpsCounterRef.current++;

        // Update FPS once per second
        if (timestamp - lastFpsUpdateRef.current >= 1000) {
          setFps(fpsCounterRef.current);
          fpsCounterRef.current = 0;
          lastFpsUpdateRef.current = timestamp;
        }

        // Update game state logic
        if (updateCallback) updateCallback(deltaTime);

        // Render the current frame
        if (renderCallback) renderCallback(deltaTime);

        // Subtract only one frame's worth of time
        // (we don’t reset to 0 in case of lag buildup)
        accumulatorRef.current -= FRAME_DURATION;
      }

      // Schedule the next frame
      requestIdRef.current = requestAnimationFrame(loop);
    },
    [updateCallback, renderCallback]
  );

  // Start loop on mount, stop on unmount
  useEffect(() => {
    requestIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
  }, [loop]);

  // Return current FPS to caller
  return fps;
};

/*
How this file works:

This custom React hook sets up a fixed-timestep game loop using requestAnimationFrame, which is perfect for games that need consistent updates and smooth rendering. The hook uses an accumulator to keep track of leftover time between frames, ensuring that game logic updates (updateCallback) and rendering (renderCallback) happen at a stable rate (typically 60fps). FPS is tracked and updated every second for performance monitoring. On mount, the loop starts automatically, and it cleans up on unmount to prevent memory leaks.

Math summary:
- FRAME_DURATION is the fixed time step (e.g., 16.67ms for 60fps).
- The accumulator pattern ensures that even if a frame is delayed, logic updates catch up smoothly.
- FPS is calculated by counting frames within each second.

*/
