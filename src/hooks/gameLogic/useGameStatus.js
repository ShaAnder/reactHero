// Import React's useState for managing local state
import { useState } from "react";

// Constants object for all possible game states
// Used throughout the app to manage which screen or logic is active
// e.g. main menu, playing, paused, options, win, loss, loading
export const GAME_STATES = {
	LANDING: "landing",
	MAIN_MENU: "main_menu",
	RUN_SETTINGS: "run_settings",
	SETTINGS: "settings",
	HIGHSCORES: "highscores",
	QUIT_CONFIRM: "quit_confirm",
	PLAYING: "playing",
	PAUSED: "paused",
	WIN: "win",
	LOSS: "loss",
	LOADING: "loading",
};

/**
 * useGameStatus
 *
 * Custom React hook to manage the current game state/screen.
 * - Stores the current game state in local state
 * - Provides a setter to change state
 * - Exposes boolean flags for each state for easy conditional rendering
 * - Use this at the top level to control which screen/component is shown
 */
export const useGameStatus = (initialState = GAME_STATES.LANDING) => {
	const [gameState, setGameState] = useState(initialState);

	return {
		gameState,
		setGameState,
		isLanding: gameState === GAME_STATES.LANDING,
		isMainMenu: gameState === GAME_STATES.MAIN_MENU,
		isRunSettings: gameState === GAME_STATES.RUN_SETTINGS,
		isSettings: gameState === GAME_STATES.SETTINGS,
		isHighscores: gameState === GAME_STATES.HIGHSCORES,
		isQuitConfirm: gameState === GAME_STATES.QUIT_CONFIRM,
		isPlaying: gameState === GAME_STATES.PLAYING,
		isPaused: gameState === GAME_STATES.PAUSED,
		isWin: gameState === GAME_STATES.WIN,
		isLoss: gameState === GAME_STATES.LOSS,
		isLoading: gameState === GAME_STATES.LOADING,
	};
};

/*
HOW THIS FILE WORKS

Single useState drives which major screen / mode shows. We expose booleans so
render code can stay very readable instead of lots of === checks.

Why a hook instead of inline state in App?
- Encapsulates the canonical list of states in one export (GAME_STATES).
- Easy to replace with a reducer or state machine later without touching callers.

API
gameState: current token (string)
setGameState(token): transition to a new state
isX flags: ergonomic helpers for JSX conditions

Extending
Add new token to GAME_STATES and optionally add a matching isFlag convenience.
*/
