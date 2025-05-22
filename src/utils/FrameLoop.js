import React, { useRef, useEffect } from "react";

// Hook for running callback on every loop
export const useFrameLoop = (callback) => {
  // Holds the ID for requestAnimationFrame so we can cancel it
  const requestID = useRef();
  // Stores the timestamp of the last frame
  const previousTime = useRef();

  // This function runs every frame
  const loop = (time) => {
    if (previousTime.current !== undefined) {
      // Figure out how much time has passed since the last frame
      const deltaTime = time - previousTime.current;
      // Call function with timestamps
      callback(time, deltaTime);
    }
    // Update for the next frame
    previousTime.current = time;
    // Keep the loop going
    requestID.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    // Start the loop when the component mounts
    requestID.current = requestAnimationFrame(loop);
    // Clean up the loop if the component unmounts
    return () => cancelAnimationFrame(requestID.current);
  }, []);
};
