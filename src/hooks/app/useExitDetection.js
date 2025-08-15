import { useEffect, useRef } from "react";

// Watches player tile vs exit tile. When you step on the exit it either:
// - Wins the run (final level)
// - Opens a “delve deeper?” modal (earlier levels) and releases pointer lock
// Leaving the tile reverses those effects.
export function useExitDetection({
	player,
	exit,
	gameState,
	GAME_STATES,
	setGameState,
	state,
	actions,
	autoOpenDelve = true,
	debug = false,
}) {
	const wasOnExitRef = useRef(false);
	useEffect(() => {
		if (gameState !== GAME_STATES.PLAYING) return;
		if (!player || !exit) return;
		if (debug) {
			/* effect tick diagnostic removed for production cleanliness */
		}

		// TODO: lift to shared constant
		const TILE_SIZE = 64;
		const playerTileX = Math.floor(player.x / TILE_SIZE);
		const playerTileY = Math.floor(player.y / TILE_SIZE);
		const exitX = Array.isArray(exit) ? exit[0] : exit.x;
		const exitY = Array.isArray(exit) ? exit[1] : exit.y;
		const isOnExit = playerTileX === exitX && playerTileY === exitY;

		if (isOnExit && !wasOnExitRef.current) {
			wasOnExitRef.current = true;
			if (debug) {
				/* stepping ON exit */
			}
			actions.playerSteppedOnExit();
			const isFinalLevel =
				state.run.level != null &&
				state.run.length != null &&
				state.run.level === state.run.length;
			// detailed log removed
			if (isFinalLevel) {
				// Immediate win condition: keep pointer lock to avoid pause race, clear any modal
				if (state.ui.activeModal) actions.setActiveModal(null);
				actions.win();
				setGameState(GAME_STATES.WIN);
				if (debug) {
					/* final level win */
				}
			} else if (
				autoOpenDelve &&
				state.run.status === "inProgress" &&
				state.run.level != null &&
				state.run.length != null &&
				state.run.level < state.run.length
			) {
				if (debug) {
					/* opening delve modal */
				}
				actions.setActiveModal("delve");
				document.exitPointerLock?.();
			}
		} else if (!isOnExit && wasOnExitRef.current) {
			wasOnExitRef.current = false;
			if (debug) {
				/* stepping OFF exit */
			}
			actions.playerLeftExit();
			if (state.ui.activeModal === "delve") {
				if (debug) {
					/* closing delve on leave */
				}
				actions.setActiveModal(null);
			}
		}
	}, [
		player,
		exit,
		gameState,
		GAME_STATES.PLAYING,
		GAME_STATES.WIN,
		state.run.status,
		state.run.level,
		state.run.length,
		state.ui.activeModal,
		actions,
		autoOpenDelve,
		setGameState,
		debug,
	]);
}
