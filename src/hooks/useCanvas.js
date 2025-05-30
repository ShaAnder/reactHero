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
  // Holds a reference to the <canvas> DOM element
  const ref = useRef();

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext("2d");

    let frameCount = 0;
    let animationID;

    // The main rendering loop — runs once per animation frame (~60fps)
    const renderLoop = () => {
      // Track how many frames have passed
      frameCount++;
      draw(context, frameCount);
      // Schedule next frame
      animationID = window.requestAnimationFrame(renderLoop);
    };
    // Kick off the loop when component mounts
    renderLoop();

    // Stop the animation when the component unmounts or draw function changes
    return () => window.cancelAnimationFrame(animationID);
    // Re-run this setup if the draw function changes
  }, [draw]);

  return ref;
};

export default useCanvas;

/**
 *
 * This hook is a lightweight, reusable way to animate a <canvas> in React. You pass in a draw(context, frameCount
 * function that contains your drawing logic. The hook gives you back a ref, which you attach to your <canvas> tag in
 * JSX.
 *
 * When the component mounts, it:
 *
 * Grabs the canvas and its 2D context.
 * Starts a rendering loop using requestAnimationFrame.
 * On each frame, it increments a counter and calls your draw() function.
 *
 * When the component unmounts (or your draw function changes), it cancels the animation loop to prevent memory leaks.
 *
 */
