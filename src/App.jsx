import SettingsScreen from "./gameScreens/SettingsScreen";
// Root app: wires state machine, generation, loop, input, screens.
// IMPORTS //
import { useState, useCallback, useRef, useEffect } from "react";
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
import { ModalIds } from "./constants/modalIds"; // Normalized modal IDs
// import useOptionsController from "./hooks/gameLogic/useOptionsController";

// Engine
import { renderWorld } from "./engine/rendering/renderWorld"; // main frame renderer
import { DEBUG_FLAGS } from "./constants/debugConfig"; // debug toggles

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
	// State machine (run config + ui)
	const { state, actions, isFinalLevel } = useAppStateMachine();

	// Local UI flags
	const [openMap, setOpenMap] = useState(false);
	const [showFps] = useState(true);
	const [showMinimap, setShowMinimap] = useState(
		DEBUG_FLAGS.SHOW_MINIMAP_DEFAULT
	); // initial minimap visibility
	const [showHUD, setShowHUD] = useState(DEBUG_FLAGS.SHOW_HUD_DEFAULT);
	const elapsedRef = useRef(0); // seconds since run start
	let content;
	const [canvas, setCanvasState] = useState(null);

	const activeModal = state.ui.activeModal;

	// Game state enum wrapper
	const { gameState, setGameState } = useGameStatus();

	// Render callback
	const render = (deltaTime) => {
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// Build world payload with clocks
		const worldRender = {
			...world,
			player,
			time: elapsedRef.current,
			delta: deltaTime,
		};
		renderWorld(ctx, worldRender, { showMinimap, showHUD, fps });
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

	const handleOptions = () => actions.setActiveModal(ModalIds.OPTIONS);
	const handleCloseOptions = () => actions.setActiveModal(null);

	// Controllers & data
	const { map, spawn, exit, loading, error, loadNextLevel, world, meta } =
		useGameController({
			environment: state.run.environment || DEFAULT_MAP_CONFIG.environment,
			level: state.run.level, // fed into world bundle
		});

	// Input + player
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
	// Camera plane (kept for possible future use)
	useCamera(player.angle, 1);
	// Blur canvas when paused
	useCanvasBlur(canvas, gameState, GAME_STATES.PAUSED);
	const fps = useGameLoop((deltaTime) => {
		if (gameState === GAME_STATES.PLAYING) {
			updatePlayer(deltaTime);
			// Future: enemy updates etc.
			elapsedRef.current += deltaTime;
			// (Possible future: hold key to show map)
		}
		render(deltaTime);
	}, render);

	// Pointer lock loss no longer auto-pauses

	// Pause hotkey lives in usePauseControl

	// Loading transition + run advance
	useLoadingTransition({
		gameState,
		setGameState,
		GAME_STATES,
		loadNextLevel,
		loading,
		map,
		spawn,
		exit,
		error,
		canvas,
		meta, // pass world meta
		state,
		actions,
		minDuration: 2000,
	});

	// Debug toggles (N minimap, H HUD)
	useEffect(() => {
		const handler = (e) => {
			if (e.key === "n" || e.key === "N") setShowMinimap((v) => !v);
			if (e.key === "h" || e.key === "H") setShowHUD((v) => !v);
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	// If map revision changes, reload level
	const lastMapRevisionRef = useRef(0);
	useEffect(() => {
		if (state.run.status !== RUN_STATUS.IN_PROGRESS) return;
		if (
			state.run.mapRevision != null &&
			state.run.mapRevision !== lastMapRevisionRef.current
		) {
			lastMapRevisionRef.current = state.run.mapRevision;
			setGameState(GAME_STATES.LOADING);
		}
	}, [state.run.mapRevision, state.run.status, setGameState]); // GAME_STATES.LOADING is static enum

	// Exit detection + optional delve modal
	useExitDetection({
		player,
		exit: world.exit,
		gameState,
		GAME_STATES,
		setGameState,
		state,
		actions,
		autoOpenDelve: true,
		debug: false,
	});

	// Old manual loading timing removed

	// Screen routing
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
					length={state.run.length || 2}
					setLength={(len) => actions.setRunLength(len)}
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
						run={state.run}
					/>
					<DelveModal
						open={activeModal === ModalIds.DELVE}
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
						open={
							gameState === GAME_STATES.PAUSED && activeModal === ModalIds.PAUSE
						}
						onContinue={handleContinue}
						onOptions={handleOptions}
						onQuit={() => actions.setActiveModal(ModalIds.QUIT)}
					/>
					<QuitModal
						open={
							gameState === GAME_STATES.PAUSED && activeModal === ModalIds.QUIT
						}
						onConfirm={() => {
							actions.setActiveModal(null);
							setGameState(GAME_STATES.MAIN_MENU);
						}}
						onCancel={() => actions.setActiveModal(ModalIds.PAUSE)}
					/>
					<OptionsModal
						open={activeModal === ModalIds.OPTIONS}
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
						if (
							next === GAME_STATES.RUN_SETTINGS ||
							next === GAME_STATES.MAIN_MENU
						) {
							actions.resetRun();
						}
						setGameState(next);
					}}
				/>
			);
			break;
		case GAME_STATES.LOSS:
			content = (
				<GameOverScreen
					result="loss"
					setGameState={(next) => {
						if (
							next === GAME_STATES.RUN_SETTINGS ||
							next === GAME_STATES.MAIN_MENU
						) {
							actions.resetRun();
						}
						setGameState(next);
					}}
				/>
			);
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
