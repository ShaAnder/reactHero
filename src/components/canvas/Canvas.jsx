import { useEffect, forwardRef, useState } from "react";

// Forward the ref from parent to the actual canvas DOM element
const Canvas = forwardRef(({ width, height, style }, ref) => {
	const [canvasSize, setCanvasSize] = useState({ width, height });

	// Update canvas size when props change
	useEffect(() => {
		setCanvasSize({ width, height });

		if (ref?.current) {
			ref.current.width = width;
			ref.current.height = height;
		}
	}, [width, height, ref]);

	useEffect(() => {
		if (ref?.current) {
			ref.current.width = canvasSize.width;
			ref.current.height = canvasSize.height;
		}
	}, [canvasSize, ref]);

	useEffect(() => {
		if (ref?.current) {
			console.log(
				"[Canvas] Internal size:",
				ref.current.width,
				ref.current.height
			);
			console.log(
				"[Canvas] CSS size:",
				ref.current.style.width,
				ref.current.style.height
			);
		}
	}, [canvasSize, ref]);

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
