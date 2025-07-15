import React from "react";
import Canvas from "../components/canvas/Canvas";
import Map from "../components/canvas/Map";

const GameScreen = ({
	map,
	spawn,
	exit,
	setCanvas,
	openMap,
	toggleMap,
	showFps,
	fps,
}) => {
	// Use a ref object for compatibility with Canvas's forwardRef
	const canvasRef = React.useRef(null);
	const [canvasDimensions, setCanvasDimensions] = React.useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	// Attach the canvas DOM node to parent state on mount
	React.useEffect(() => {
		if (canvasRef.current) {
			setCanvas(canvasRef.current);
		}
	}, [setCanvas]);

	// Lock orientation to landscape on mobile
	React.useEffect(() => {
		const lockOrientation = async () => {
			try {
				if (screen.orientation && screen.orientation.lock) {
					await screen.orientation.lock("landscape");
				}
			} catch (error) {
				console.log("Orientation lock not supported or failed:", error);
			}
		};

		lockOrientation();

		// Clean up on unmount
		return () => {
			try {
				if (screen.orientation && screen.orientation.unlock) {
					screen.orientation.unlock();
				}
			} catch (error) {
				console.log("Orientation unlock failed:", error);
			}
		};
	}, []);

	React.useEffect(() => {
		const updateDimensions = () => {
			setCanvasDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};
		window.addEventListener("resize", updateDimensions);
		window.addEventListener("orientationchange", updateDimensions);
		updateDimensions();
		return () => {
			window.removeEventListener("resize", updateDimensions);
			window.removeEventListener("orientationchange", updateDimensions);
		};
	}, []);

	return (
		<div className="game-screen">
			{/* Canvas and game UI */}
			<Canvas
				ref={canvasRef}
				width={canvasDimensions.width}
				height={canvasDimensions.height}
				className="game-canvas"
				style={{
					width: `${canvasDimensions.width}px`,
					height: `${canvasDimensions.height}px`,
				}}
			/>

			{openMap && (
				<div className="game-map-overlay" onClick={toggleMap}>
					<Map map={map} spawn={spawn} exit={exit} />
				</div>
			)}
			{showFps && <div className="game-fps-counter">FPS: {fps}</div>}
		</div>
	);
};

export default GameScreen;
