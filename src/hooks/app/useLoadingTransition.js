import { useEffect } from "react";
import { RUN_STATUS } from "./useAppStateMachine";

// Handles: starting a run, advancing levels, enforcing minimum loading screen duration,
// and transitioning to PLAYING while relocking pointer.
export function useLoadingTransition({
	gameState,
	setGameState,
	GAME_STATES,
	environmentSelection, // environment chosen pre-run
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
	minDuration = 2000,
}) {
	// Kick off generation or next level when entering LOADING.
	useEffect(() => {
		if (gameState !== GAME_STATES.LOADING) return;
		console.log("[LOAD] Enter LOADING", {
			status: state.run.status,
			env: environmentSelection,
			length: adventureLength,
		});

		// Record loading start timestamp in reducer meta if not already set.
		if (!state.meta.loadingStartAt) {
			actions.setLoadingStart(Date.now());
		}

		if (state.run.status === RUN_STATUS.IDLE) {
			console.log("[LOAD] START_RUN dispatch");
			// First time: start the run.
			actions.startRun(environmentSelection, adventureLength);
		} else if (state.run.status === RUN_STATUS.IN_PROGRESS) {
			// Subsequent levels: trigger level load.
			console.log("[LOAD] loadNextLevel dispatch");
			loadNextLevel();
		}
	}, [
		gameState,
		state.run.status,
		environmentSelection,
		adventureLength,
		loadNextLevel,
		actions,
		GAME_STATES.LOADING,
		state.meta.loadingStartAt,
	]);

	// Transition from LOADING -> PLAYING after conditions + minimum duration.
	useEffect(() => {
		if (gameState !== GAME_STATES.LOADING) return;
		if (loading || !map || !spawn || !exit || error) return;
		if (!state.meta.loadingStartAt) return; // safety
		console.log("[LOAD] Ready to transition to PLAYING", {
			elapsed: Date.now() - state.meta.loadingStartAt,
		});

		const elapsed = Date.now() - state.meta.loadingStartAt;
		const doPlay = () => {
			console.log("[LOAD] Transition -> PLAYING");
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
