import { useRef, useCallback, useEffect } from "react";

// Consolidated pause system: handles state swap, modal activation, pointer
// lock release / reacquire, and a small key cooldown so a single key press
// doesn’t instantly pause then unpause.
/*
HOW THIS HOOK WORKS
Exports two callbacks: pause() and resume(). When pausing we set the game
state to PAUSED, show the pause modal via reducer action, timestamp the
moment (for cooldown), and release pointer lock. While paused we listen for
the pause key again; after a short cooldown we allow resume to prevent a
single key press from toggling twice due to key repeat or fast event order.
Resuming hides modal, flips state to PLAYING, and tries to re-lock pointer
on the next tick (timeout 0 so the DOM is ready).

Edge cases handled:
- Ignores pause() calls if already paused.
- Ignores resume() if not paused.
- Cooldown stops immediate unpause on accidental long press.
*/
export function usePauseControl({
	gameState,
	setGameState,
	GAME_STATES,
	actions, // from state machine
	canvas,
	pauseKey = "p",
	cooldownMs = 150,
}) {
	const pausedAtRef = useRef(null);

	const pause = useCallback(() => {
		if (gameState !== GAME_STATES.PLAYING) return;
		setGameState(GAME_STATES.PAUSED);
		actions.setActiveModal("pause");
		pausedAtRef.current = Date.now();
		document.exitPointerLock?.();
	}, [
		gameState,
		GAME_STATES.PLAYING,
		GAME_STATES.PAUSED,
		setGameState,
		actions,
	]);

	const resume = useCallback(() => {
		if (gameState !== GAME_STATES.PAUSED) return;
		actions.setActiveModal(null);
		setGameState(GAME_STATES.PLAYING);
		setTimeout(() => {
			if (canvas && canvas.requestPointerLock) canvas.requestPointerLock();
			canvas?.classList.remove("blurred");
		}, 0);
	}, [
		gameState,
		actions,
		setGameState,
		canvas,
		GAME_STATES.PAUSED,
		GAME_STATES.PLAYING,
	]);

	// Allow pressing pause key again while paused to resume (cooldown protected)
	useEffect(() => {
		if (gameState !== GAME_STATES.PAUSED) return;
		const handler = (e) => {
			if (e.key.toLowerCase() !== pauseKey) return;
			if (e.repeat) return;
			const sincePause = pausedAtRef.current
				? Date.now() - pausedAtRef.current
				: Infinity;
			if (actions && sincePause > cooldownMs) {
				e.preventDefault();
				resume();
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [gameState, resume, pauseKey, cooldownMs, GAME_STATES.PAUSED, actions]);

	return { pause, resume };
}
