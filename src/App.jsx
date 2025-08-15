import SettingsScreen from "./gameScreens/SettingsScreen";
// IMPORTS //
import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStateMachine, RUN_STATUS } from "./hooks/app/useAppStateMachine";
import { useLoadingTransition } from "./hooks/app/useLoadingTransition";
import { useExitDetection } from "./hooks/app/useExitDetection";

// Variables
import { DEFAULT_MAP_CONFIG } from "../gameConfig";
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
import DelveDeeperDialog from "./gameScreens/dialogs/DelveDeeperDialog";
import OptionsDialog from "./gameScreens/dialogs/OptionsDialog";
import LoadingScreen from "./gameScreens/LoadingScreen";
import GameOverScreen from "./gameScreens/GameOverScreen";
import LandingScreen from "./gameScreens/LandingScreen";
import RunSettingsScreen from "./gameScreens/RunSettingsScreen";
import HighscoresScreen from "./gameScreens/HighscoresScreen";
import QuitConfirmDialog from "./gameScreens/dialogs/QuitConfirmDialog";
import Modal from "./components/Modal";

const App = () => {
	// Level chaining config (adventure length selection stored outside reducer until confirmed start)
	const [adventureLength, setAdventureLength] = useState(2);
	// App state machine
	const { state, actions, isFinalLevel } = useAppStateMachine();
	//--- STATE ---//
	const [openMap, setOpenMap] = useState(false);
	const [environment, setEnvironment] = useState(
		DEFAULT_MAP_CONFIG.environment
	);
	const [regenKey, setRegenKey] = useState(0);
	const [showFps] = useState(true);
	let content;
	const [canvas, setCanvasState] = useState(null);

	// Local derived UI flags from state machine
	const activeModal = state.ui.activeModal; // 'pause' | 'options' | 'quit' | 'delve' | null
	const pausedAtRef = useRef(null);

	// Obtain global game state early (needed by handlers below)
	const { gameState, setGameState } = useGameStatus();

	//--- FUNCTIONS ---//
	const render = () => {
		if (!canvas) return;
		const context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		gameRender(context, player, map);
	};
	const toggleMap = () => setOpenMap((open) => !open);

	const handleToggleGameMenu = () => {
		if (gameState === GAME_STATES.PLAYING) {
			setGameState(GAME_STATES.PAUSED);
			actions.setActiveModal("pause");
			pausedAtRef.current = Date.now();
			document.exitPointerLock?.();
		}
	};

	const handleContinue = useCallback(() => {
		actions.setActiveModal(null);
		setGameState(GAME_STATES.PLAYING);
		setTimeout(() => {
			if (canvas && canvas.requestPointerLock) canvas.requestPointerLock();
			canvas?.classList.remove("blurred");
		}, 0);
	}, [actions, canvas, setGameState]);

	const handleOptions = () => actions.setActiveModal("options");
	const handleCloseOptions = () => actions.setActiveModal(null);

	//--- HOOKS ---//
	const { map, spawn, exit, loading, error, loadNextLevel } = useGameController(
		{ environment: state.run.environment || environment, regenKey }
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

	// Removed auto-pause on pointer lock loss (pause now only via ESC/menu button)

	// Allow pressing P while paused to resume (since movement listeners detach in pause)
	useEffect(() => {
		if (gameState !== GAME_STATES.PAUSED) return;
		const handleKey = (e) => {
			if (e.key.toLowerCase() === DEFAULT_KEY_BINDINGS.pause) {
				if (e.repeat) return;
				// Cooldown to avoid immediate unpause from same physical press
				const sincePause = pausedAtRef.current
					? Date.now() - pausedAtRef.current
					: Infinity;
				if (state.ui.activeModal === "pause" && sincePause > 150) {
					e.preventDefault();
					handleContinue();
				}
			}
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [gameState, state.ui.activeModal, handleContinue]);

	// Loading transition + run start/level advance
	useLoadingTransition({
		gameState,
		setGameState,
		GAME_STATES,
		environmentSelection: environment,
		adventureLength,
		loadNextLevel,
		loading,
		map,
		spawn,
		exit,
		error,
		canvas,
		state,
		actions,
		minDuration: 2000,
	});

	// Exit detection & optional delve modal
	useExitDetection({
		player,
		exit,
		gameState,
		GAME_STATES,
		setGameState,
		state,
		actions,
		autoOpenDelve: true,
		debug: false,
	});

	// Transition from LOADING to PLAYING when map, spawn, and exit are valid and not loading
	useEffect(() => {
		// Minimum loading screen duration logic
		if (
			gameState === GAME_STATES.LOADING &&
			!loading &&
			map &&
			spawn &&
			exit &&
			!error
		) {
			// Show loading screen for at least 2 seconds
			if (!window._loadingScreenShownAt) {
				window._loadingScreenShownAt = Date.now();
			}
			const elapsed = Date.now() - window._loadingScreenShownAt;
			const doPlay = () => {
				setGameState(GAME_STATES.PLAYING);
				window._loadingScreenShownAt = null;
				// Relock pointer after delving deeper/loading new level
				setTimeout(() => {
					if (canvas && canvas.requestPointerLock) {
						canvas.requestPointerLock();
					}
				}, 0);
			};
			if (elapsed >= 2000) {
				doPlay();
			} else {
				setTimeout(doPlay, 2000 - elapsed);
			}
		}
	}, [gameState, loading, map, spawn, exit, error, setGameState, canvas]);

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
					adventureLength={adventureLength}
					setAdventureLength={setAdventureLength}
					runLengthOptions={[
						{ label: "Extra Short", value: 2 },
						{ label: "Short", value: 3 },
						{ label: "Medium", value: 5 },
						{ label: "Long", value: 10 },
					]}
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
				<QuitConfirmDialog
					onConfirm={() => setGameState(GAME_STATES.MAIN_MENU)}
					onCancel={() => setGameState(GAME_STATES.PAUSED)}
				/>
			);
			break;
		case GAME_STATES.LOADING:
			// Always show loading screen
			content = <LoadingScreen error={error} />;
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
						runData={
							state.run.level && state.run.environment
								? {
										environment: state.run.environment,
										currentLevel: state.run.level,
										adventureLength,
								  }
								: null
						}
					/>
					{/* Delve Deeper Modal */}
					{activeModal === "delve" && (
						<Modal open={true} onClose={() => actions.setActiveModal(null)}>
							<DelveDeeperDialog
								isFinalLevel={isFinalLevel}
								onYes={() => {
									if (!isFinalLevel) {
										actions.setActiveModal(null);
										actions.advanceLevel();
										setGameState(GAME_STATES.LOADING);
									} else {
										setGameState(GAME_STATES.WIN);
									}
								}}
								onNo={() => actions.setActiveModal(null)}
							/>
						</Modal>
					)}
					{/* Pause Modal */}
					{gameState === GAME_STATES.PAUSED && activeModal === "pause" && (
						<Modal open={true} onClose={handleContinue}>
							<h2>Game Paused</h2>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: 16,
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
									onClick={() => actions.setActiveModal("quit")}
								>
									Quit
								</button>
							</div>
						</Modal>
					)}
					{/* Quit confirmation */}
					{gameState === GAME_STATES.PAUSED && activeModal === "quit" && (
						<Modal open={true} onClose={() => actions.setActiveModal("pause")}>
							<QuitConfirmDialog
								onConfirm={() => {
									actions.setActiveModal(null);
									setGameState(GAME_STATES.MAIN_MENU);
								}}
								onCancel={() => actions.setActiveModal("pause")}
							/>
						</Modal>
					)}
					{/* Options modal */}
					{activeModal === "options" && (
						<Modal open={true} onClose={handleCloseOptions}>
							<OptionsDialog onClose={handleCloseOptions} />
						</Modal>
					)}
				</>
			);
			break;
		case GAME_STATES.WIN:
			content = (
				<GameOverScreen
					result="win"
					setGameState={(next) => {
						if (next === GAME_STATES.RUN_SETTINGS) {
							// Reset run configuration for a new selection
							setAdventureLength(3);
							setEnvironment(DEFAULT_MAP_CONFIG.environment);
							actions.resetRun();
						}
						setGameState(next);
					}}
				/>
			);
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
