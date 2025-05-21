import { useRef, useEffect } from "react";

const Canvas = ({ width, height, style }) => {
  const canvasRef = useRef(null); // We'll use this to get the actual canvas DOM node

  useEffect(() => {
    // Set the canvas width and height directly so drawing is crisp
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
  }, [width, height]); // Only run this when width or height changes

  // Render the canvas element and attach our ref
  return <canvas ref={canvasRef} style={style} />;
};

export default Canvas;
