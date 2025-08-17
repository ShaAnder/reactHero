import React from "react";
/**
 * GameScreen
 * Displays active run: canvas, HUD (environment/level), map overlay, FPS, and menu button.
 * Stateless regarding progression; parent owns run/map/player state.
 */
import Canvas from "../components/canvas/Canvas";
import Map from "../components/canvas/Map";
import { usePlayerControls } from "../hooks/gameLogic/usePlayerControls";
import { DEFAULT_KEY_BINDINGS } from "../constants/playerControlsConfig";

const GameScreen = ({
	map,
	spawn,
	exit,
	setCanvas,
	openMap,
	toggleMap,
	showFps,
	fps,
	onToggleGameMenu,
	run, // normalized run slice
}) => {
	// Canvas DOM ref (forwarded to renderer)
	const canvasRef = React.useRef(null);
	const [canvasDimensions, setCanvasDimensions] = React.useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	// Provide canvas element upward when ready
	React.useEffect(() => {
		if (canvasRef.current) {
			setCanvas(canvasRef.current);
		}
	}, [setCanvas]);

	// Attempt to lock orientation (mobile UX)
	React.useEffect(() => {
		const lockOrientation = async () => {
			try {
				if (screen.orientation && screen.orientation.lock) {
					await screen.orientation.lock("landscape");
				}
			} catch {
				// Orientation lock may not be supported; ignore silently
			}
		};

		lockOrientation();

		// Clean up on unmount
		return () => {
			try {
				if (screen.orientation && screen.orientation.unlock) {
					screen.orientation.unlock();
				}
			} catch {
				// Ignore
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

	// Hook: attach keyboard/mouse listeners controlling map + pause
	usePlayerControls(
		canvasRef.current,
		() => {}, // setPlayer handled elsewhere
		DEFAULT_KEY_BINDINGS,
		toggleMap,
		onToggleGameMenu
	);

	return (
		<div className="game-screen" style={{ position: "relative" }}>
			{/* HUD: environment + level */}
			{run && run.environment && run.level && (
				<div
					style={{
						position: "absolute",
						top: 16,
						left: "50%",
						transform: "translateX(-50%)",
						zIndex: 20,
						background: "rgba(30,30,30,0.7)",
						color: "#fff",
						padding: "8px 18px",
						borderRadius: "8px",
						fontSize: "1.1rem",
						fontWeight: 500,
					}}
				>
					{run.environment}: {run.level}
					{/* If run finished we can show total time (rough) */}
					{run.finishedAt && run.startedAt && (
						<span style={{ marginLeft: 12, fontSize: "0.9rem", opacity: 0.8 }}>
							Time: {Math.round((run.finishedAt - run.startedAt) / 1000)}s
						</span>
					)}
				</div>
			)}

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
