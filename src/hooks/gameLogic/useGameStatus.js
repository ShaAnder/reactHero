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
How this file works:

This hook centralizes the current game state (main menu, playing, paused, etc.) in a single state variable.
It provides a setter to change the state and boolean flags for each possible state, making it easy to conditionally render screens or logic in your app.
Use this at the top level of your app to control which screen is visible and to manage transitions between game states.
*/
