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

/*
How this file works:

This is a simple React component that renders a <canvas> element and forwards a ref so the parent can access the DOM node directly (for drawing, pointer lock, etc).

- The useEffect ensures that whenever the width or height props change, the actual canvas DOM element's width and height properties are updated. This is important because setting width/height via props or attributes resets the canvas drawing context, so it's best to do it explicitly in JS.
- The ref is forwarded using React.forwardRef, which is necessary for hooks or parent components that want to access the canvas DOM node directly (for rendering, pointer lock, etc).
- The style prop is passed through so you can easily style the canvas from the parent.

*/
