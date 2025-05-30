import { useRef, useEffect } from "react";
import { MOUSE_SENSITIVITY } from "../../constants/playerConfig";

/**
 * usePlayerControls
 *
 * This hook handles all the player's input:
 * - Keyboard movement (WASD + arrow keys)
 * - Mouse look (rotating view with pointer lock)
 *
 * It sets up event listeners and returns a `keys` ref that tracks which keys are held down.
 */
export const usePlayerControls = (canvasRef, setPlayer) => {
  // --- Track pressed keys ---
  const keys = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    strafeLeft: false,
    strafeRight: false,
  });

  // --- Keyboard Controls ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
          keys.current.up = true;
          break;
        case "ArrowDown":
        case "s":
          keys.current.down = true;
          break;
        case "ArrowLeft":
          keys.current.left = true;
          break;
        case "ArrowRight":
          keys.current.right = true;
          break;
        case "a":
          keys.current.strafeLeft = true;
          break;
        case "d":
          keys.current.strafeRight = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
          keys.current.up = false;
          break;
        case "ArrowDown":
        case "s":
          keys.current.down = false;
          break;
        case "ArrowLeft":
          keys.current.left = false;
          break;
        case "ArrowRight":
          keys.current.right = false;
          break;
        case "a":
          keys.current.strafeLeft = false;
          break;
        case "d":
          keys.current.strafeRight = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // --- Mouse Controls ---
  useEffect(() => {
    const canvas = canvasRef.current;
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
  }, [canvasRef, setPlayer]);

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
