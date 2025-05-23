import { useState, useCallback, useRef, useEffect } from "react";
import {
  PLAYER_START_X,
  PLAYER_START_Y,
  PLAYER_SPEED,
  PLAYER_ROTATION_SPEED,
} from "../constants/playerConfig";
import { getIsWall } from "../helpers/getIsWall";
import { MAP } from "../constants/map";
import { FOV_ANGLE } from "../constants/gameConfig";

// Classic Wolf3D FOV (adjust as needed)

const MOUSE_SENSITIVITY = 0.002;

export const useGameState = () => {
  // Player's state: position, angle, movement speed, rotation speed
  const [player, setPlayer] = useState({
    x: PLAYER_START_X,
    y: PLAYER_START_Y,
    angle: 0,
    moveSpeed: PLAYER_SPEED,
    rotationSpeed: PLAYER_ROTATION_SPEED,
  });

  // Tracks which movement keys are currently pressed
  const keys = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    strafeLeft: false,
    strafeRight: false,
  });

  // Reference to the canvas element (for pointer lock and mouse look)
  const canvasRef = useRef(null);

  // --- Keyboard controls ---
  // Set keys as pressed when pressed down
  const handleKeyDown = useCallback((e) => {
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
      default:
        break;
    }
  }, []);

  // Set keys as released when released
  const handleKeyUp = useCallback((e) => {
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
      default:
        break;
    }
  }, []);

  // Register/unregister key listeners on mount/unmount
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // --- Mouse look support ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Request pointer lock when the canvas is clicked
    const handleCanvasClick = () => {
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    };

    // Rotate player angle based on mouse movement (if pointer is locked)
    const handleMouseMove = (e) => {
      if (document.pointerLockElement === canvas) {
        setPlayer((prev) => ({
          ...prev,
          angle: prev.angle + e.movementX * MOUSE_SENSITIVITY,
        }));
      }
    };

    canvas.addEventListener("click", handleCanvasClick);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // --- Game loop update function ---
  // Moves and rotates the player based on input and time elapsed
  const updateGameState = useCallback((deltaTime) => {
    setPlayer((prevPlayer) => {
      let { x, y, angle, moveSpeed, rotationSpeed } = prevPlayer;

      // Handle rotation with arrow keys
      if (keys.current.left) angle -= rotationSpeed * deltaTime;
      if (keys.current.right) angle += rotationSpeed * deltaTime;

      // Calculate movement deltas
      let moveStepX = 0,
        moveStepY = 0;
      if (keys.current.up) {
        moveStepX += Math.cos(angle) * moveSpeed * deltaTime;
        moveStepY += Math.sin(angle) * moveSpeed * deltaTime;
      }
      if (keys.current.down) {
        moveStepX -= Math.cos(angle) * moveSpeed * deltaTime;
        moveStepY -= Math.sin(angle) * moveSpeed * deltaTime;
      }
      if (keys.current.strafeLeft) {
        moveStepX += Math.cos(angle - Math.PI / 2) * moveSpeed * deltaTime;
        moveStepY += Math.sin(angle - Math.PI / 2) * moveSpeed * deltaTime;
      }
      if (keys.current.strafeRight) {
        moveStepX += Math.cos(angle + Math.PI / 2) * moveSpeed * deltaTime;
        moveStepY += Math.sin(angle + Math.PI / 2) * moveSpeed * deltaTime;
      }

      // Try to move in X, then Y (allows sliding along walls)
      if (!getIsWall(x + moveStepX, y, MAP)) {
        x += moveStepX;
      }
      if (!getIsWall(x, y + moveStepY, MAP)) {
        y += moveStepY;
      }

      // Normalize angle to stay within 0 to 2π
      if (angle < 0) angle += Math.PI * 2;
      if (angle >= Math.PI * 2) angle -= Math.PI * 2;

      return { ...prevPlayer, x, y, angle };
    });
  }, []);

  // --- Camera plane calculation ---
  // Returns the camera plane vector perpendicular to the player's direction
  const getCameraPlane = (angle) => ({
    planeX: -Math.sin(angle) * FOV_ANGLE,
    planeY: Math.cos(angle) * FOV_ANGLE,
  });

  const { planeX, planeY } = getCameraPlane(player.angle);

  // --- Return all relevant state and helpers ---
  return {
    player, // Player state (x, y, angle, speeds)
    planeX, // Camera plane X component
    planeY, // Camera plane Y component
    updateGameState, // Function to update player state each frame
    canvasRef, // Ref for the canvas (for pointer lock and mouse look)
  };
};

/*

Summary Notes
What does this hook do?
Manages all player state (position, angle, movement, rotation) and input for a Wolfenstein 3D–style raycaster game.

Handles keyboard controls, mouse look, collision detection, and camera plane math.

Provides everything needed for the main game loop and rendering.

How does it work?
Player State:

Tracks position, angle, movement speed, and rotation speed.

Keyboard Input:

Listens for keydown/keyup events to update which movement keys are held.

Supports forward/back, rotate left/right, and strafe left/right.

Mouse Look:

Uses pointer lock for immersive mouse control.

Rotates the player’s angle based on horizontal mouse movement.

Game Loop Update:

Calculates intended movement based on pressed keys and elapsed time.

Uses trigonometry (cos/sin) to move in the direction the player is facing.

Checks for wall collisions before moving, allowing for smooth sliding along walls.

Keeps the player’s angle normalized between 0 and 2π radians.

Camera Plane Calculation:

Computes a vector perpendicular to the player’s direction, scaled by FOV.

This is used by the raycaster to determine the spread of rays for the 3D view.

Canvas Ref:

Provides a ref for the canvas element, used for pointer lock and mouse movement.

Why is this important for a raycaster game?
This hook centralizes all player movement, view, and control logic.

Ensures smooth, responsive controls and correct camera math for rendering the 3D scene.

Makes it easy to integrate with your game loop and rendering system.

In short:
This hook is the heart of your player and control system, handling movement, rotation, mouse look, collision, and camera math—all essential for a smooth, playable raycasting game.

*/
