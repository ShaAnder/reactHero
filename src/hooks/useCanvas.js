import { useRef, useEffect } from "react";

/**
 * Custom React hook that sets up an HTML canvas and runs a rendering loop.
 *
 * - Provides a ref you attach to a <canvas> element.
 * - Automatically sets up and cleans up a requestAnimationFrame loop.
 * - Passes the canvas 2D context and a frame count to your custom draw function.
 *
 * @param {Function} draw - Function called each frame: (context, frameCount) => void
 * @returns {Object} ref - React ref to attach to your canvas element.
 */
const useCanvas = (draw) => {
  const ref = useRef(); // Holds a reference to the <canvas> DOM element

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext("2d");

    let frameCount = 0;
    let animationID;

    // The main rendering loop — runs once per animation frame (~60fps)
    const renderLoop = () => {
      frameCount++; // Track how many frames have passed
      draw(context, frameCount);
      animationID = window.requestAnimationFrame(renderLoop); // Schedule next frame
    };

    renderLoop(); // Kick off the loop when component mounts

    // Stop the animation when the component unmounts or draw function changes
    return () => window.cancelAnimationFrame(animationID);
  }, [draw]); // Re-run this setup if the draw function changes

  return ref;
};

export default useCanvas;
