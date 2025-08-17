import { useRef, useEffect } from "react";
import { MOUSE_SENSITIVITY } from "../../constants/playerConfig";
import { ModalIds } from "../../constants/modalIds";
// DEFAULT_KEY_BINDINGS import retained elsewhere; can remove if unused.

/**
 * Unified input layer: keyboard + mouse look. Returns a ref of booleans so
 * movement logic can read current intent without triggering React re-renders.
 */
export const usePlayerControls = (
	canvas,
	setPlayer,
	keyBindings,
	onToggleMap,
	onToggleGameMenu,
	gameState,
	externalKeysRef
) => {
	// --- Track pressed keys ---
	const internalKeysRef = useRef({
		up: false,
		down: false,
		left: false,
		right: false,
		strafeLeft: false,
		strafeRight: false,
		map: false,
		pause: false,
	});
	const keys = externalKeysRef || internalKeysRef;

	// --- Keyboard Controls ---

	// Add/remove event listeners only when entering/leaving PLAYING
	useEffect(() => {
		if (gameState !== "PLAYING" && gameState !== "playing") return;

		const handleKeyDown = (e) => {
			const key = e.key.toLowerCase();
			if (key === keyBindings.up) keys.current.up = true;
			else if (key === keyBindings.down) keys.current.down = true;
			else if (key === keyBindings.left) keys.current.left = true;
			else if (key === keyBindings.right) keys.current.right = true;
			else if (key === keyBindings.strafeLeft) keys.current.strafeLeft = true;
			else if (key === keyBindings.strafeRight) keys.current.strafeRight = true;
			else if (key === keyBindings.map) {
				if (!keys.current.map) {
					keys.current.map = true;
					if (onToggleMap) onToggleMap();
				}
			} else if (key === keyBindings.pause) {
				if (!keys.current.pause) {
					keys.current.pause = true;
					if (onToggleGameMenu) onToggleGameMenu();
				}
			}
		};

		const handleKeyUp = (e) => {
			const key = e.key.toLowerCase();
			if (key === keyBindings.up) keys.current.up = false;
			if (key === keyBindings.down) keys.current.down = false;
			if (key === keyBindings.left) keys.current.left = false;
			if (key === keyBindings.right) keys.current.right = false;
			if (key === keyBindings.strafeLeft) keys.current.strafeLeft = false;
			if (key === keyBindings.strafeRight) keys.current.strafeRight = false;
			if (key === keyBindings.map) keys.current.map = false;
			if (key === keyBindings.pause) {
				keys.current.pause = false;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
		};
		// NOTE: we intentionally exclude `keys` (ref stable) to avoid needless re-subscribes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [keyBindings, onToggleMap, onToggleGameMenu, gameState]);

	// Reset keys ref only when leaving PLAYING
	useEffect(() => {
		if (gameState === "playing") return;
		keys.current = {
			up: false,
			down: false,
			left: false,
			right: false,
			strafeLeft: false,
			strafeRight: false,
			map: false,
			pause: false,
		};
		// 'keys' is a ref (stable) so we intentionally omit it
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gameState]);

	// --- Mouse Controls ---
	useEffect(() => {
		if (!canvas) return; // Only attach once canvas exists

		const handleClick = () => {
			canvas.requestPointerLock?.();
		};

		// Throttle via requestAnimationFrame to avoid overwhelming React & reduce risk of cascading updates
		let framePending = false;
		const handleMouseMove = (e) => {
			if (document.pointerLockElement !== canvas) return;
			if (!setPlayer) return; // allow passing noop / undefined safely
			if (framePending) return;
			framePending = true;
			requestAnimationFrame(() => {
				framePending = false;
				setPlayer((prev) =>
					prev
						? { ...prev, angle: prev.angle + e.movementX * MOUSE_SENSITIVITY }
						: prev
				);
			});
		};

		canvas.addEventListener("click", handleClick);
		document.addEventListener("mousemove", handleMouseMove);

		return () => {
			canvas.removeEventListener("click", handleClick);
			document.removeEventListener("mousemove", handleMouseMove);
		};
		// Depend only on canvas; setPlayer (state setter) is stable and safe to omit.
		// setPlayer is a React state setter (stable identity); exhaustive-deps safe to omit
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canvas]);

	return keys;
};

/*
HOW THIS HOOK WORKS

Keyboard
- On entering PLAYING we attach keydown/keyup listeners and mutate the ref.
- On leaving PLAYING we reset all flags so stale presses don’t leak.

Mouse
- Click canvas → requestPointerLock so we get raw relative movement.
- While locked we adjust player.angle by movementX * sensitivity.

Why use a ref?
- Reading per frame without setState avoids extra component renders.

Extensibility Notes
- Add more actions (inventory, interact) by extending the ref shape.
- For configurable controls, pass a different keyBindings map.
*/
