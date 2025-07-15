import { useRef, useEffect } from "react";
import { MOUSE_SENSITIVITY } from "../../constants/playerConfig";
import { DEFAULT_KEY_BINDINGS } from "../../constants/playerControlsConfig";

/**
 * usePlayerControls
 *
 * This hook handles all the player's input:
 * - Keyboard movement (WASD + arrow keys)
 * - Mouse look (rotating view with pointer lock)
 *
 * It sets up event listeners and returns a `keys` ref that tracks which keys are held down.
 */
export const usePlayerControls = (
	canvas,
	setPlayer,
	keyBindings,
	onToggleMap,
	onToggleGameMenu,
	gameState
) => {
	// --- Track pressed keys ---
	const keys = useRef({
		up: false,
		down: false,
		left: false,
		right: false,
		strafeLeft: false,
		strafeRight: false,
		map: false,
		pause: false,
	});

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
					console.log("[DEBUG] Pause keydown detected");
					keys.current.pause = true;
					if (onToggleGameMenu) {
						console.log("[DEBUG] Calling onToggleGameMenu from pause key");
						onToggleGameMenu();
					}
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
				console.log("[DEBUG] Pause keyup detected");
				keys.current.pause = false;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
		};
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
	}, [gameState]);

	// --- Mouse Controls ---
	useEffect(() => {
		if (!canvas) return; // Defensive guard: only attach if canvas is mounted

		const handleClick = () => {
			if (canvas.requestPointerLock) {
				canvas.requestPointerLock();
			}
		};

		const handleMouseMove = (e) => {
			if (document.pointerLockElement === canvas) {
				setPlayer((prev) => ({
					...prev,
					angle: prev.angle + e.movementX * MOUSE_SENSITIVITY,
				}));
			}
		};

		canvas.addEventListener("click", handleClick);
		document.addEventListener("mousemove", handleMouseMove);

		return () => {
			canvas.removeEventListener("click", handleClick);
			document.removeEventListener("mousemove", handleMouseMove);
		};
	}, [canvas, setPlayer]);

	return keys;
};

/*
How this hook works:

- usePlayerControls tracks player input by managing keyboard and mouse events.
- It sets up listeners for keydown and keyup on the window to know which keys are currently pressed.
- The `keys` ref stores this state and is read by the game loop to decide movement every frame.
- For mouse input, it requests pointer lock on the canvas click to capture raw mouse movement.
- While pointer lock is active, mouse movements update the player's angle smoothly based on sensitivity.
- Cleanup handlers ensure event listeners are properly removed when the component using this hook unmounts.
- Returning `keys` as a ref allows other hooks or components to read real-time input without causing extra renders.

- The mouse controls effect now depends on `canvasRef.current`, so it always attaches to the correct canvas element, even after remounts.
- The defensive guard (`if (!canvas) return;`) ensures listeners are only attached when the canvas is mounted.
*/
