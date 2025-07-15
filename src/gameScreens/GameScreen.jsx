import React from "react";
import Canvas from "../components/canvas/Canvas";
import Map from "../components/canvas/Map";
import { usePlayerControls } from "../hooks/gameLogic/usePlayerControls";
import { DEFAULT_KEY_BINDINGS } from "../constants/playerControlsConfig";

const GameScreen = ({
	player,
	map,
	spawn,
	exit,
	setCanvas,
	openMap,
	toggleMap,
	showFps,
	fps,
	onToggleGameMenu,
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

	usePlayerControls(
		canvasRef.current,
		() => {}, // setPlayer is handled elsewhere
		DEFAULT_KEY_BINDINGS,
		toggleMap,
		onToggleGameMenu
	);

	return (
		<div className="game-screen" style={{ position: "relative" }}>
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

			{/* Pause/Menu Button */}
			<button
				className="pause-menu-btn"
				style={{
					position: "absolute",
					bottom: 24,
					left: 24,
					zIndex: 10,
					padding: "10px 18px",
					fontSize: "1.1rem",
					borderRadius: "8px",
					background: "rgba(30,30,30,0.85)",
					color: "#fff",
					border: "none",
					cursor: "pointer",
					boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
				}}
				onClick={onToggleGameMenu}
				aria-label="Pause / Menu"
			>
				&#9776; Menu
			</button>

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
