import SettingsScreen from "./gameScreens/SettingsScreen";
// IMPORTS //
import { useState, useCallback, useRef } from "react";
import { useAppStateMachine, RUN_STATUS } from "./hooks/app/useAppStateMachine";
import { useLoadingTransition } from "./hooks/app/useLoadingTransition";
import { useExitDetection } from "./hooks/app/useExitDetection";

// Variables
import { DEFAULT_MAP_CONFIG } from "../gameConfig";
import { DEFAULT_KEY_BINDINGS } from "./constants/playerControlsConfig";

// Hooks
import { useGameLoop } from "./hooks/gameLogic/useGameLoop";
import { usePlayerControls } from "./hooks/gameLogic/usePlayerControls";
import { usePlayer } from "./hooks/gameLogic/usePlayer";
import { useCamera } from "./hooks/gameLogic/useCamera";
import { usePauseControl } from "./hooks/app/usePauseControl";
import { useCanvasBlur } from "./hooks/app/useCanvasBlur";
import { useGameStatus, GAME_STATES } from "./hooks/gameLogic/useGameStatus";
import { useGameController } from "./hooks/gameLogic/useGameController";
// import useOptionsController from "./hooks/gameLogic/useOptionsController";

// Engine
import { render as gameRender } from "./engine/renderer";

// Game screens
import GameScreen from "./gameScreens/GameScreen";
import MainMenu from "./gameScreens/MainMenu";
import { DelveModal } from "./components/modals/DelveModal";
import { OptionsModal } from "./components/modals/OptionsModal";
import LoadingScreen from "./gameScreens/LoadingScreen";
import GameOverScreen from "./gameScreens/GameOverScreen";
import LandingScreen from "./gameScreens/LandingScreen";
import RunSettingsScreen from "./gameScreens/RunSettingsScreen";
import HighscoresScreen from "./gameScreens/HighscoresScreen";
import { PauseMenu } from "./components/modals/PauseMenu";
import { QuitModal } from "./components/modals/QuitModal";

const App = () => {
	// App state machine (now also stores pre-run config while IDLE)
	const { state, actions, isFinalLevel } = useAppStateMachine();

	// Local UI state still outside machine (map open toggle)
	//--- STATE ---//
	const [openMap, setOpenMap] = useState(false);
	const [showFps] = useState(true);
	let content;
	const [canvas, setCanvasState] = useState(null);

	// Local derived UI flags from state machine
	const activeModal = state.ui.activeModal; // 'pause' | 'options' | 'quit' | 'delve' | null

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

	const { pause, resume } = usePauseControl({
		gameState,
		setGameState,
		GAME_STATES,
		actions,
		canvas,
		pauseKey: DEFAULT_KEY_BINDINGS.pause,
	});

	const handleToggleGameMenu = () => pause();
	const handleContinue = useCallback(() => resume(), [resume]);

	const handleOptions = () => actions.setActiveModal("options");
	const handleCloseOptions = () => actions.setActiveModal(null);

	//--- HOOKS ---//
	const { map, spawn, exit, loading, error, loadNextLevel } = useGameController(
		{
			environment: state.run.environment || DEFAULT_MAP_CONFIG.environment,
		}
	);

	// Input + player split
	const [internalCanvas, setCanvas] = useState(null);
	const keysRef = useRef({
		up: false,
		down: false,
		left: false,
		right: false,
		strafeLeft: false,
		strafeRight: false,
		map: false,
		pause: false,
	});
	const { player, setPlayer, updatePlayer } = usePlayer(map, spawn, keysRef);
	usePlayerControls(
		internalCanvas,
		setPlayer,
		DEFAULT_KEY_BINDINGS,
		toggleMap,
		handleToggleGameMenu,
		gameState,
		keysRef
	);
	// camera plane (currently unused directly but kept for renderer parity if needed)
	useCamera(player.angle, 1);
	// canvas blur effect
	useCanvasBlur(canvas, gameState, GAME_STATES.PAUSED);
	const fps = useGameLoop((deltaTime) => {
		if (gameState === GAME_STATES.PLAYING) {
			updatePlayer(deltaTime);
			// Future: updateEnemies(deltaTime), updateProjectiles(deltaTime), etc.
		}
		render();
	}, render);

	// Removed auto-pause on pointer lock loss (pause now only via ESC/menu button)

	// Pause/resume hotkey handling moved into usePauseControl

	// Loading transition + run start/level advance
	useLoadingTransition({
		gameState,
		setGameState,
		GAME_STATES,
		environmentSelection:
			state.run.environment || DEFAULT_MAP_CONFIG.environment,
		adventureLength: state.run.length || 2,
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

	// (Legacy manual LOADING->PLAYING timing effect removed; handled by useLoadingTransition reducer meta timestamps)

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
					environment={state.run.environment || DEFAULT_MAP_CONFIG.environment}
					setEnvironment={(env) => actions.setRunEnvironment(env)}
					adventureLength={state.run.length || 2}
					setAdventureLength={(len) => actions.setRunLength(len)}
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
										adventureLength: state.run.length,
								  }
								: null
						}
					/>
					<DelveModal
						open={activeModal === "delve"}
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
					<PauseMenu
						open={gameState === GAME_STATES.PAUSED && activeModal === "pause"}
						onContinue={handleContinue}
						onOptions={handleOptions}
						onQuit={() => actions.setActiveModal("quit")}
					/>
					<QuitModal
						open={gameState === GAME_STATES.PAUSED && activeModal === "quit"}
						onConfirm={() => {
							actions.setActiveModal(null);
							setGameState(GAME_STATES.MAIN_MENU);
						}}
						onCancel={() => actions.setActiveModal("pause")}
					/>
					<OptionsModal
						open={activeModal === "options"}
						onClose={handleCloseOptions}
					/>
				</>
			);
			break;
		case GAME_STATES.WIN:
			content = (
				<GameOverScreen
					result="win"
					setGameState={(next) => {
						if (next === GAME_STATES.RUN_SETTINGS) {
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
- usePlayerControls + usePlayer manage input and the player's transform; useCamera derives the camera plane.
- useGameLoop runs the fixed-timestep game loop, updating player/world each frame then rendering.
- The Canvas component is where the game is drawn. The canvas ref is passed down for direct drawing.
- The render function clears the canvas and calls the main game renderer to draw the 3D view and minimap.
- Loading flow & minimum duration are handled via useLoadingTransition.
- An FPS counter is shown in the corner if showFps is true.

*/
