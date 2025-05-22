import { useEffect, forwardRef } from "react";

// Forward the ref from parent to the actual canvas DOM element
const Canvas = forwardRef(({ width, height, style }, ref) => {
  useEffect(() => {
    if (ref?.current) {
      ref.current.width = width;
      ref.current.height = height;
    }
  }, [width, height, ref]);

  return <canvas ref={ref} style={style} />;
});

export default Canvas;
