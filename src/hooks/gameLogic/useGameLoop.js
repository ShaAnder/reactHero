import { useRef, useState, useEffect, useCallback } from "react";
import { FRAME_DURATION } from "../../constants/gameConfig";

/**
 * Custom React hook for a fixed-timestep game loop using requestAnimationFrame.
 *
 * - Updates game logic and rendering at a consistent rate (~60 FPS).
 * - Returns real-time frames per second (FPS) for diagnostics or display.
 * - Prevents inconsistent behavior caused by variable frame durations.
 *
 * @param {Function} updateCallback - Called with deltaTime (in seconds) to update game state.
 * @param {Function} renderCallback - Called with deltaTime (in seconds) to render a frame.
 * @returns {number} fps - The actual frames per second, updated every second.
 */
export const useGameLoop = (updateCallback, renderCallback) => {
  const [fps, setFps] = useState(0); // Actual frames rendered per second

  const requestIdRef = useRef(null); // Tracks the current animation frame ID
  const previousTimeRef = useRef(); // Timestamp of the previous frame
  const accumulatorRef = useRef(0); // Time accumulated since last update
  const fpsCounterRef = useRef(0); // Counts how many frames occurred this second
  const lastFpsUpdateRef = useRef(0); // Timestamp of last FPS counter reset

  // Game loop function: memoized to stay stable between renders
  const loop = useCallback(
    (timestamp) => {
      // On first frame: initialize timing variables
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = timestamp;
        lastFpsUpdateRef.current = timestamp;
      }

      // Calculate how much time passed since the last frame
      const deltaMs = timestamp - previousTimeRef.current;
      previousTimeRef.current = timestamp;

      // Accumulate time — we only update once enough has passed (fixed timestep)
      accumulatorRef.current += deltaMs;

      // Only proceed if enough time has accumulated to match our frame duration
      if (accumulatorRef.current >= FRAME_DURATION) {
        const deltaTime = accumulatorRef.current / 1000; // Convert to seconds

        // Count this frame for FPS tracking
        fpsCounterRef.current++;

        // Update FPS once every second
        if (timestamp - lastFpsUpdateRef.current >= 1000) {
          setFps(fpsCounterRef.current); // Push FPS to state (for display)
          fpsCounterRef.current = 0;
          lastFpsUpdateRef.current = timestamp;
        }

        // Update game state
        if (updateCallback) updateCallback(deltaTime);

        // Render the game
        if (renderCallback) renderCallback(deltaTime);

        // Reset time accumulator for the next frame cycle
        accumulatorRef.current = 0;
      }

      // Queue the next frame
      requestIdRef.current = requestAnimationFrame(loop);
    },
    [updateCallback, renderCallback]
  );

  // Start the game loop when the component mounts
  useEffect(() => {
    requestIdRef.current = requestAnimationFrame(loop);

    // Clean up on unmount (stop animation frame)
    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
  }, [loop]);

  return fps;
};
