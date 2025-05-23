import { useRef, useState, useEffect, useCallback } from "react";

const TARGET_FPS = 60; // Desired frames per second
const FRAME_DURATION = 1000 / TARGET_FPS; // Milliseconds per frame

/**
 * Custom React hook for a fixed-timestep game loop.
 * Handles updating game logic and rendering at a consistent frame rate.
 * Also tracks and returns the actual FPS.
 *
 * @param {Function} updateCallback - Called to update game state each frame.
 * @param {Function} renderCallback - Called to render each frame.
 * @returns {number} fps - The current frames per second.
 */
export const useGameLoop = (updateCallback, renderCallback) => {
  const [fps, setFps] = useState(0); // Store the current FPS for display/debugging
  const requestIdRef = useRef(null); // Animation frame request ID for cleanup
  const previousTimeRef = useRef(); // Last frame's timestamp
  const fpsCounterRef = useRef(0); // Counts frames in the current second
  const lastFpsUpdateRef = useRef(0); // Timestamp of last FPS update
  const accumulatorRef = useRef(0); // Accumulates time to manage fixed timestep

  // The main loop function, memoized to avoid unnecessary re-creations
  const loop = useCallback(
    (timestamp) => {
      // Initialize timing on the first frame
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = timestamp;
        lastFpsUpdateRef.current = timestamp;
      }

      // Calculate time elapsed since last frame (in ms)
      const deltaMs = timestamp - previousTimeRef.current;
      previousTimeRef.current = timestamp;

      accumulatorRef.current += deltaMs;

      // Only update and render if enough time has passed for our target FPS
      if (accumulatorRef.current >= FRAME_DURATION) {
        // Delta time in seconds for game logic and rendering
        const deltaTime = accumulatorRef.current / 1000;

        // FPS calculation: count frames, update FPS once per second
        fpsCounterRef.current++;
        if (timestamp - lastFpsUpdateRef.current >= 1000) {
          setFps(fpsCounterRef.current);
          fpsCounterRef.current = 0;
          lastFpsUpdateRef.current = timestamp;
        }

        // Update game state (e.g., player movement, physics)
        if (updateCallback) {
          updateCallback(deltaTime);
        }

        // Render the frame (e.g., draw to canvas)
        if (renderCallback) {
          renderCallback(deltaTime);
        }

        // Reset accumulator for next frame
        accumulatorRef.current = 0;
      }

      // Schedule the next frame
      requestIdRef.current = requestAnimationFrame(loop);
    },
    [updateCallback, renderCallback]
  );

  // Start the loop when the component mounts, and clean up on unmount
  useEffect(() => {
    requestIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
  }, [loop]);

  return fps; // Return the current FPS for display
};

/*

What does this hook do?
Creates a fixed-timestep game loop for React apps, running at a target FPS (e.g., 60).

Separates game logic updates (updateCallback) from rendering (renderCallback).

Tracks and returns the actual frames per second (FPS).

How does it work?
Timing and Frame Management:

Uses requestAnimationFrame for smooth, browser-synced animation.

Calculates the time since the last frame (deltaMs).

Accumulates elapsed time to ensure updates/rendering only happen at the target frame rate.

Fixed Timestep:

Only calls update/render when enough time has passed for the target FPS (FRAME_DURATION).

Passes deltaTime (in seconds) to callbacks for smooth, time-based movement and animation.

FPS Tracking:

Counts how many frames occur each second.

Updates the FPS state once per second for display or debugging.

Cleanup:

Cancels the animation frame when the component unmounts to prevent memory leaks.

Why is this useful?
Ensures your game logic and rendering run at a consistent rate, regardless of browser speed fluctuations.

Makes movement, physics, and animation smooth and predictable.

Provides real-time FPS feedback for performance monitoring.

In short:
This hook gives you a robust, React-friendly game loop with fixed timing, separate update/render phases, and live FPS reporting—perfect for building interactive games or simulations in React!

*/
