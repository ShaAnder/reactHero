import React, { useRef, useEffect } from "react";

// A handy hook for running a callback every animation frame (like a mini game loop!)
export const useFrameLoop = (callback) => {
  const requestID = useRef(); // Holds the ID for requestAnimationFrame so we can cancel it
  const previousTime = useRef(); // Stores the timestamp of the last frame

  // This function runs every frame
  const loop = (time) => {
    if (previousTime.current !== undefined) {
      // Figure out how much time has passed since the last frame
      const deltaTime = time - previousTime.current;
      callback(time, deltaTime); // Call your function with both timestamps
    }
    previousTime.current = time; // Update for the next frame
    requestID.current = requestAnimationFrame(loop); // Keep the loop going
  };

  useEffect(() => {
    // Start the loop when the component mounts
    requestID.current = requestAnimationFrame(loop);
    // Clean up the loop if the component unmounts
    return () => cancelAnimationFrame(requestID.current);
  }, []);
};
