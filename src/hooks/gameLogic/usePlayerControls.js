import { useRef, useEffect } from "react";

const MOUSE_SENSITIVITY = 0.002; // Controls how fast mouse movement rotates the player

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
  // This ref holds the current input state (which keys are pressed)
  // It's used by the game loop to decide movement each frame
  const keys = useRef({
    up: false, // W or Up Arrow
    down: false, // S or Down Arrow
    left: false, // Left Arrow (for rotation)
    right: false, // Right Arrow (for rotation)
    strafeLeft: false, // A key (strafe left)
    strafeRight: false, // D key (strafe right)
  });

  // --- Keyboard Controls ---
  // Listen for keydown/keyup to update input state
  useEffect(() => {
    // When a key is pressed, update the corresponding key state to true
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

    // When a key is released, update the corresponding key state to false
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

    // Attach listeners to the window so we catch all key presses/releases
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Cleanup listeners on unmount to avoid leaks
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // --- Mouse Controls ---
  // Handle pointer lock and mouse movement for rotating the player
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // When the canvas is clicked, request pointer lock to capture mouse input
    const handleClick = () => {
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    };

    // Listen to mouse movement while pointer is locked
    // This lets the player rotate the view with the mouse
    const handleMouseMove = (e) => {
      if (document.pointerLockElement === canvas) {
        setPlayer((prev) => ({
          ...prev,
          angle: prev.angle + e.movementX * MOUSE_SENSITIVITY,
        }));
      }
    };

    // Add event listeners for mouse control
    canvas.addEventListener("click", handleClick);
    document.addEventListener("mousemove", handleMouseMove);

    // Cleanup listeners on unmount
    return () => {
      canvas.removeEventListener("click", handleClick);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [canvasRef, setPlayer]);

  // Return the current state of the keys (which are held down)
  return keys;
};

/**
 * How This Hook Works:
 *
 * - usePlayerControls tracks player input by managing keyboard and mouse events.
 * - It sets up listeners for keydown and keyup on the window to know which keys are currently pressed.
 * - The `keys` ref stores this state and is read by the game loop to decide movement every frame.
 * - For mouse input, it requests pointer lock on the canvas click to capture raw mouse movement.
 * - While pointer lock is active, mouse movements update the player's angle smoothly based on sensitivity.
 * - Cleanup handlers ensure event listeners are properly removed when the component using this hook unmounts.
 * - Returning `keys` as a ref allows other hooks or components to read real-time input without causing extra renders.
 */
