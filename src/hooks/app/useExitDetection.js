import { useEffect, useRef } from "react";

// Detects when player steps onto/away from the exit tile and dispatches reducer actions.
// Optionally triggers a delve modal via actions.setActiveModal('delve') when not on final level.
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
		if (debug)
			console.log("[EXIT DETECT] effect tick", {
				gameState,
				level: state.run.level,
				length: state.run.length,
				status: state.run.status,
				activeModal: state.ui.activeModal,
			});

		const TILE_SIZE = 64; // TODO: lift to shared constant
		const playerTileX = Math.floor(player.x / TILE_SIZE);
		const playerTileY = Math.floor(player.y / TILE_SIZE);
		const exitX = Array.isArray(exit) ? exit[0] : exit.x;
		const exitY = Array.isArray(exit) ? exit[1] : exit.y;
		const isOnExit = playerTileX === exitX && playerTileY === exitY;

		if (isOnExit && !wasOnExitRef.current) {
			wasOnExitRef.current = true;
			if (debug)
				console.log("[EXIT DETECT] stepping ON exit", {
					playerTileX,
					playerTileY,
					exitX,
					exitY,
				});
			actions.playerSteppedOnExit();
			const isFinalLevel =
				state.run.level != null &&
				state.run.length != null &&
				state.run.level === state.run.length;
			if (debug) {
				console.log("[EXIT DETECT] Player entered exit tile", {
					playerTileX,
					playerTileY,
					exitX,
					exitY,
					level: state.run.level,
					length: state.run.length,
					isFinalLevel,
				});
			}
			if (isFinalLevel) {
				// Immediate win condition: keep pointer lock to avoid pause race, clear any modal
				if (state.ui.activeModal) actions.setActiveModal(null);
				actions.win();
				setGameState(GAME_STATES.WIN);
				if (debug) console.log("[EXIT DETECT] Final level => WIN state");
			} else if (
				autoOpenDelve &&
				state.run.status === "inProgress" &&
				state.run.level != null &&
				state.run.length != null &&
				state.run.level < state.run.length
			) {
				if (debug) console.log("[EXIT DETECT] opening delve modal");
				actions.setActiveModal("delve");
				document.exitPointerLock?.();
			}
		} else if (!isOnExit && wasOnExitRef.current) {
			wasOnExitRef.current = false;
			if (debug) console.log("[EXIT DETECT] stepping OFF exit");
			actions.playerLeftExit();
			if (state.ui.activeModal === "delve") {
				if (debug) console.log("[EXIT DETECT] closing delve on leave");
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
