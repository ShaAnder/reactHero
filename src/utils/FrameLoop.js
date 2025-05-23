import React, { useRef, useEffect } from "react";

/**
 * Custom React hook for running a callback on every animation frame.
 * Calls your callback with the current timestamp and the time elapsed since the last frame.
 *
 * @param {Function} callback - Function to call every frame (receives time and deltaTime in ms).
 */
export const useFrameLoop = (callback) => {
  // Holds the ID for requestAnimationFrame so we can cancel it on cleanup
  const requestID = useRef();
  // Stores the timestamp of the previous frame
  const previousTime = useRef();

  // The main loop function, called every animation frame
  const loop = (time) => {
    if (previousTime.current !== undefined) {
      // Calculate the time difference (deltaTime) since the last frame
      const deltaTime = time - previousTime.current;
      // Call the callback with the current timestamp and deltaTime
      callback(time, deltaTime);
    }
    // Update the previousTime for the next frame
    previousTime.current = time;
    // Schedule the next frame
    requestID.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    // Start the animation loop when the component mounts
    requestID.current = requestAnimationFrame(loop);
    // Cleanup: cancel the animation frame when the component unmounts
    return () => cancelAnimationFrame(requestID.current);
  }, []);
};

/*

Summary Notes
What does this hook do?
Runs a provided callback function on every animation frame (using requestAnimationFrame).

Passes the current timestamp and the elapsed time since the last frame (deltaTime) to your callback.

Handles setup and cleanup automatically when the component mounts/unmounts.

How does it work?
References:

requestID keeps track of the animation frame request so it can be cancelled later.

previousTime stores the timestamp of the last frame to compute deltaTime.

Frame Loop:

On each frame, calculates how much time has passed since the previous frame.

Calls your callback with the current time and deltaTime.

Schedules the next frame using requestAnimationFrame.

Effect Hook:

Starts the loop when the component mounts.

Cleans up (cancels the animation frame) when the component unmounts to prevent memory leaks.

Why is this useful?
Great for smooth, time-based animations, games, or any visual updates that need to run in sync with the browser’s refresh rate.

Separates animation logic from React’s render cycle, improving performance and code clarity.

*/
