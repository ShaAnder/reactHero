// components/canvas/Canvas.jsx
import { useRef, useEffect } from "react";

const Canvas = ({ width, height, style }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Make sure canvas size is set properly
    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
  }, [width, height]);

  return <canvas ref={canvasRef} style={style} />;
};

export default Canvas;
