import Canvas from "../components/canvas/Canvas";
import Map from "../components/canvas/Map";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "../constants/gameConfig";

const GameScreen = ({
	map,
	spawn,
	exit,
	canvasRef,
	openMap,
	toggleMap,
	showFps,
	fps,
}) => {
	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			{/* Canvas and game UI */}
			<Canvas
				ref={canvasRef}
				width={WINDOW_WIDTH}
				height={WINDOW_HEIGHT}
				style={{ border: "1px solid black" }}
				onClick={() => console.log("React onClick fired!")}
			/>
			{openMap && (
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						width: 250,
						height: 250,
						transform: "translate(-50%, -50%)",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						pointerEvents: "auto",
						zIndex: 100,
						background: "rgba(0,0,0,0.6)",
					}}
					onClick={toggleMap}
				>
					<Map map={map} spawn={spawn} exit={exit} />
				</div>
			)}
			{showFps && (
				<div
					style={{
						position: "absolute",
						top: "10px",
						left: "10px",
						color: "white",
						fontFamily: "monospace",
						fontSize: "14px",
					}}
				>
					FPS: {fps}
				</div>
			)}
		</div>
	);
};

export default GameScreen;
