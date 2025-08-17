import { useEffect } from "react";
import { RUN_STATUS } from "./useAppStateMachine";
/**
 * useLoadingTransition
 * Controls LOADING phase: kicks off initial run or subsequent level generation, enforces minimum display time,
 * and transitions to PLAYING (attempting to restore pointer lock). Uses reducer meta timestamps for timing.
 */

// Handles: starting a run, advancing levels, minimum duration, pointer relock.
export function useLoadingTransition({
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
	state,
	actions,
	minDuration = 2000,
}) {
	// Entering LOADING: start run (if idle) or load next level (if already running)
	useEffect(() => {
		if (gameState !== GAME_STATES.LOADING) return;

		// Record loading start timestamp in reducer meta if not already set.
		if (!state.meta.loadingStartAt) {
			actions.setLoadingStart(Date.now());
		}

		if (state.run.status === RUN_STATUS.IDLE) {
			// First time: start the run. Fallback defaults if null.
			const env = state.run.environment ?? "forest";
			const len = state.run.length ?? 2;
			actions.startRun(env, len);
		} else if (state.run.status === RUN_STATUS.IN_PROGRESS) {
			// Subsequent levels: trigger level load.
			loadNextLevel();
		}
	}, [
		gameState,
		state.run.status,
		state.run.environment,
		state.run.length,
		loadNextLevel,
		actions,
		GAME_STATES.LOADING,
		state.meta.loadingStartAt,
	]);

	// LOADING -> PLAYING once assets ready + minimum duration elapsed
	useEffect(() => {
		if (gameState !== GAME_STATES.LOADING) return;
		if (loading || !map || !spawn || !exit || error) return;
		if (!state.meta.loadingStartAt) return; // safety

		const elapsed = Date.now() - state.meta.loadingStartAt;
		const doPlay = () => {
			actions.clearLoadingStart();
			setGameState(GAME_STATES.PLAYING);
			// Attempt to relock pointer after React paints.
			setTimeout(() => {
				if (canvas && canvas.requestPointerLock) {
					canvas.requestPointerLock();
				}
			}, 0);
		};
		if (elapsed >= minDuration) {
			doPlay();
		} else {
			const timeout = setTimeout(doPlay, minDuration - elapsed);
			return () => clearTimeout(timeout);
		}
	}, [
		gameState,
		loading,
		map,
		spawn,
		exit,
		error,
		state.meta.loadingStartAt,
		canvas,
		actions,
		setGameState,
		GAME_STATES.LOADING,
		GAME_STATES.PLAYING,
		minDuration,
	]);
}
