// IMPORTS //
import { useState, useEffect } from "react";

// Variables
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "./constants/gameConfig";
import Map from "./components/canvas/Map";
import { DEFAULT_MAP_CONFIG } from "./constants/gameConfig";
import { DEFAULT_KEY_BINDINGS } from "./constants/playerControlsConfig";

// Hooks
import { useGameLoop } from "./hooks/gameLogic/useGameLoop";
import { useGameState } from "./hooks/gameLogic/useGameState";
import { useGameStatus, GAME_STATES } from "./hooks/gameLogic/useGameStatus";
import { useGameController } from "./hooks/gameLogic/useGameController";
// import useOptionsController from "./hooks/gameLogic/useOptionsController";

// Engine
import { render as gameRender } from "./engine/renderer";

// Game screens
import GameScreen from "./gameScreens/GameScreen";
import MainMenu from "./gameScreens/MainMenu";
import PauseDialog from "./gameScreens/dialogs/PauseDialog";
import OptionsDialog from "./gameScreens/dialogs/OptionsDialog";
import LoadingScreen from "./gameScreens/LoadingScreen";
import GameOverScreen from "./gameScreens/GameOverScreen";
import LandingScreen from "./gameScreens/LandingScreen";
import RunSettingsScreen from "./gameScreens/RunSettingsScreen";
import HighscoresScreen from "./gameScreens/HighscoresScreen";
import QuitConfirmDialog from "./gameScreens/dialogs/QuitConfirmDialog";
import Modal from "./components/Modal";

const ENVIRONMENTS = Object.keys(DEFAULT_MAP_CONFIG.environmentPresets);

const App = () => {
	// Quit confirmation modal state
	const [quitConfirmOpen, setQuitConfirmOpen] = useState(false);
	//--- STATE ---//
	const [openMap, setOpenMap] = useState(false);
	const [environment, setEnvironment] = useState(
		DEFAULT_MAP_CONFIG.environment
	);
	const [regenKey, setRegenKey] = useState(0);
	const [showFps] = useState(true);
	let content;
	const [canvas, setCanvasState] = useState(null);

	// Modal state
	const [gameMenuOpen, setGameMenuOpen] = useState(false);
	const [optionsOpen, setOptionsOpen] = useState(false);

	//--- FUNCTIONS ---//
	const render = () => {
		if (!canvas) return;
		const context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		gameRender(context, player, map);
	};
	const toggleMap = () => setOpenMap((open) => !open);

	const handleToggleGameMenu = () => {
		setGameMenuOpen(true);
		setGameState(GAME_STATES.PAUSED);
		// Unlock pointer
		document.exitPointerLock?.();
		console.log(
			"[PAUSE TEST] Game paused, menu opened. gameMenuOpen:",
			gameMenuOpen,
			"gameState:",
			gameState
		);
	};

	const handleContinue = () => {
		setGameMenuOpen(false);
		setGameState(GAME_STATES.PLAYING);
		// Relock pointer (try again if canvas not set yet)
		setTimeout(() => {
			if (canvas && canvas.requestPointerLock) {
				canvas.requestPointerLock();
			}
			// Remove blur from canvas
			if (canvas) {
				canvas.classList.remove("blurred");
			}
		}, 0);
		console.log("[PAUSE TEST] Game resumed, menu closed.");
	};

	const handleOptions = () => {
		setOptionsOpen(true);
	};

	const handleCloseOptions = () => {
		setOptionsOpen(false);
	};

	const handleQuit = () => {
		setGameMenuOpen(false);
		setOptionsOpen(false);
		// Reset run and go to main menu
		setGameState(GAME_STATES.MAIN_MENU);
		// Optionally clear map/state here if needed
	};

	//--- HOOKS ---//
	const { gameState, setGameState } = useGameStatus();
	const { map, spawn, exit, loading, error, loadNextLevel } = useGameController(
		{
			environment,
			regenKey,
		}
	);
	// const { options, setOption } = useOptionsController();
	const { player, updateGameState, setCanvas } = useGameState(
		map,
		spawn,
		DEFAULT_KEY_BINDINGS,
		toggleMap,
		handleToggleGameMenu,
		gameState
	);
	const fps = useGameLoop((deltaTime) => {
		if (gameState === GAME_STATES.PLAYING) {
			updateGameState(deltaTime, gameState);
			// Future: updateEnemies(deltaTime, gameState), updateProjectiles(deltaTime, gameState), etc.
		}
		render(); // Always render, even if paused
	}, render);

	// Open modal when pointer lock is lost during gameplay
	useEffect(() => {
		if (gameState !== GAME_STATES.PLAYING) return;
		const handlePointerLockChange = () => {
			const isLocked = document.pointerLockElement !== null;
			if (!isLocked && !gameMenuOpen) {
				setGameMenuOpen(true);
			}
		};
		document.addEventListener("pointerlockchange", handlePointerLockChange);
		return () => {
			document.removeEventListener(
				"pointerlockchange",
				handlePointerLockChange
			);
		};
	}, [gameState, gameMenuOpen]);

	// Call loadNextLevel when entering LOADING state
	useEffect(() => {
		if (gameState === GAME_STATES.LOADING) {
			loadNextLevel();
		}
	}, [gameState, loadNextLevel]);

	// Transition from LOADING to PLAYING when map, spawn, and exit are valid and not loading
	useEffect(() => {
		if (
			gameState === GAME_STATES.LOADING &&
			!loading &&
			map &&
			spawn &&
			exit &&
			!error
		) {
			setGameState(GAME_STATES.PLAYING);
		}
	}, [gameState, loading, map, spawn, exit, error, setGameState]);

	// --- GAME STATUS RENDERING ---//
	switch (gameState) {
		case GAME_STATES.LANDING:
			content = <LandingScreen setGameState={setGameState} />;
			break;
		case GAME_STATES.MAIN_MENU:
			content = <MainMenu setGameState={setGameState} />;
			break;
		case GAME_STATES.RUN_SETTINGS:
			content = (
				<RunSettingsScreen
					setGameState={setGameState}
					environment={environment}
					setEnvironment={setEnvironment}
					setRegenKey={setRegenKey}
				/>
			);
			break;
		case GAME_STATES.SETTINGS:
			content = <SettingsScreen setGameState={setGameState} />;
			break;
		case GAME_STATES.HIGHSCORES:
			content = <HighscoresScreen setGameState={setGameState} />;
			break;
		case GAME_STATES.QUIT_CONFIRM:
			content = (
				<QuitConfirmModal
					onConfirm={() => setGameState(GAME_STATES.MAIN_MENU)}
					onCancel={() => setGameState(GAME_STATES.PAUSED)}
				/>
			);
			break;
		case GAME_STATES.LOADING:
			content = <LoadingScreen error={error} loading={loading} />;
			break;
		case GAME_STATES.PLAYING:
		case GAME_STATES.PAUSED:
			// Add or remove blur to canvas depending on state
			if (canvas) {
				if (gameState === GAME_STATES.PAUSED) {
					canvas.classList.add("blurred");
				} else {
					canvas.classList.remove("blurred");
				}
			}
			content = (
				<>
					<GameScreen
						player={player}
						map={map}
						spawn={spawn}
						exit={exit}
						setCanvas={(node) => {
							setCanvas(node);
							setCanvasState(node);
							if (node && gameState !== GAME_STATES.PAUSED)
								node.classList.remove("blurred");
						}}
						openMap={openMap}
						toggleMap={toggleMap}
						showFps={showFps}
						fps={fps}
						onToggleGameMenu={handleToggleGameMenu}
					/>
					{/* Overlay Modal only if paused */}
					{gameState === GAME_STATES.PAUSED && !quitConfirmOpen && (
						<Modal open={true} onClose={handleContinue}>
							<h2>Game Paused</h2>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "16px",
									alignItems: "stretch",
									marginTop: 24,
								}}
							>
								<button className="screen-button" onClick={handleContinue}>
									Continue
								</button>
								<button className="screen-button" onClick={handleOptions}>
									Options
								</button>
								<button
									className="screen-button"
									onClick={() => setQuitConfirmOpen(true)}
								>
									Quit
								</button>
							</div>
						</Modal>
					)}
					{/* Quit confirmation modal */}
					{gameState === GAME_STATES.PAUSED && quitConfirmOpen && (
						<Modal open={true} onClose={() => setQuitConfirmOpen(false)}>
							<QuitConfirmDialog
								onConfirm={() => {
									setQuitConfirmOpen(false);
									setGameMenuOpen(false);
									setOptionsOpen(false);
									setGameState(GAME_STATES.MAIN_MENU);
								}}
								onCancel={() => setQuitConfirmOpen(false)}
							/>
						</Modal>
					)}
				   {/* Options modal (can be open in both states) */}
				   {optionsOpen && (
					   <Modal open={optionsOpen} onClose={handleCloseOptions}>
						   <OptionsDialog onClose={handleCloseOptions} />
					   </Modal>
				   )}
				</>
			);
			break;
		case GAME_STATES.WIN:
			content = <GameOverScreen result="win" setGameState={setGameState} />;
			break;
		case GAME_STATES.LOSS:
			content = <GameOverScreen result="loss" setGameState={setGameState} />;
			break;
		default:
			content = null;
	}
	return content;
};

export default App;

/*
How this file works:

This is the main React app for your raycasting game. It wires together all the core hooks and components:

- useGameController handles map generation, level state, and loading transitions.
- useGameState manages the player's position, movement, and camera logic.
- useGameLoop runs the fixed-timestep game loop, calling updateGameState and render each frame, and tracks FPS.
- The Canvas component is where the game is drawn. The canvasRef is passed down for direct drawing.
- The render function clears the canvas and calls the main game renderer to draw the 3D view and minimap.
- While the map is loading, a LoadingScreen is displayed.
- An FPS counter is shown in the corner if showFps is true.

*/
