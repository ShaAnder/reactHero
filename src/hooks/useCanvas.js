import { useRef, useEffect } from "react";

const useCanvas = (draw) => {
  const ref = useRef(); // This holds our canvas DOM node

  useEffect(() => {
    const canvas = ref.current;
    // Grab the 2D drawing context so we can actually draw stuff
    const context = canvas.getContext("2d");
    let count = 0; // Just a frame counter for fun or debugging
    let animationID;

    // This function runs every frame
    const renderer = () => {
      count++; // Count how many frames have passed
      draw(context, count); // Call the draw function you passed in
      animationID = window.requestAnimationFrame(renderer); // Loop!
    };

    renderer(); // Start the animation loop

    // Clean up the animation loop if the component unmounts or draw changes
    return () => window.cancelAnimationFrame(animationID);
  }, [draw]); // Re-run if the draw function changes

  return ref; // Give the canvas ref back to the component
};

export default useCanvas;
