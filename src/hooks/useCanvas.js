import { useRef, useEffect } from "react";

/**
 * Custom React hook for managing an HTML canvas with an animation loop.
 *
 * @param {Function} draw - A function that receives the 2D context and a frame count, called every animation frame.
 * @returns {Object} ref - A React ref to be attached to your <canvas> element.
 */
const useCanvas = (draw) => {
  const ref = useRef(); // Holds the canvas DOM node

  useEffect(() => {
    const canvas = ref.current; // Get the actual canvas element
    const context = canvas.getContext("2d"); // Get 2D drawing context

    let count = 0; // Frame counter for animation or debugging
    let animationID; // Stores the requestAnimationFrame ID

    // Animation loop: called every frame
    const renderer = () => {
      count++; // Increment frame count
      draw(context, count); // Call the provided draw function
      animationID = window.requestAnimationFrame(renderer); // Schedule next frame
    };

    renderer(); // Start the animation loop

    // Cleanup: stop the animation if the component unmounts or draw changes
    return () => window.cancelAnimationFrame(animationID);
  }, [draw]); // Re-run effect if the draw function changes

  return ref; // Return the ref to be attached to the canvas element
};

export default useCanvas;

/*

What does this hook do?
Sets up a canvas rendering loop inside a React component.

Provides a ref to attach to your <canvas> element.

Calls your custom draw function every animation frame, passing in the 2D context and a frame counter.

How does it work?
Canvas Reference:

Uses useRef() to keep a persistent reference to the canvas DOM node.

Effect Hook:

On mount (and whenever draw changes), grabs the canvas and its 2D context.

Initializes a frame counter.

Animation Loop:

Defines a renderer function that:

Increments the frame count.

Calls your draw function with the context and count.

Schedules itself for the next animation frame using requestAnimationFrame.

Starts the loop immediately.

Cleanup:

If the component unmounts or the draw function changes, cancels the animation loop to prevent memory leaks.

Return:

Returns the canvas ref for use in your component’s JSX.

Why is this useful?
Cleanly separates canvas rendering logic from React’s component lifecycle.

Ensures smooth animation and proper cleanup.

Makes it easy to reuse canvas logic across multiple components.

In short:
This hook abstracts away the boilerplate of setting up and cleaning up a canvas animation loop in React. You just provide a draw function, and the hook manages everything else—frame counting, context handling, and animation timing.

*/
