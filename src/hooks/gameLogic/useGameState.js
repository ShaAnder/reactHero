import { useState, useCallback, useRef } from "react";
import { usePlayerControls } from "./usePlayerControls";
import {
  PLAYER_START_X,
  PLAYER_START_Y,
  PLAYER_SPEED,
  PLAYER_ROTATION_SPEED,
} from "../../constants/playerConfig";
import { getIsWall } from "../../helpers/getIsWall";
import { MAP } from "../../constants/map";
import { FOV_ANGLE } from "../../constants/gameConfig";
import { getCameraPlane } from "../../helpers/getCameraPlane";

/**
 * useGameState
 *
 * This hook manages everything related to the player's game state:
 * - Position
 * - Angle/direction
 * - Movement logic (WASD, rotation, strafing)
 * - Collision with walls
 * - Mouse/keyboard input
 * - Camera plane math for raycasting (using external helper)
 *
 * It keeps your player logic clean, centralized, and reactive.
 */
export const useGameState = (aspectRatio) => {
  // --- Player State ---
  // This state tracks the player's X/Y position, direction (angle),
  // and their movement/rotation speed.
  const [player, setPlayer] = useState({
    // Horizontal position in world pixels
    x: PLAYER_START_X,
    // Vertical position in world pixels
    y: PLAYER_START_Y,
    // Angle the player is facing, in radians
    angle: 0,
    // How fast they walk (pixels per second)
    moveSpeed: PLAYER_SPEED,
    // How fast they turn (radians per second)
    rotationSpeed: PLAYER_ROTATION_SPEED,
  });

  // --- Canvas Ref ---
  // This ref is used to attach to the actual <canvas> element in your scene.
  // Needed so we can request pointer lock and read mouse movement.
  const canvasRef = useRef(null);

  // --- Input Handling ---
  // usePlayerControls sets up key/mouse listeners and returns a `keys` ref
  // that tells us which movement inputs are currently active (WASD, etc).
  const keys = usePlayerControls(canvasRef, setPlayer);

  /**
   * updateGameState
   *
   * This function is called every frame from the game loop.
   * It moves the player based on input and deltaTime,
   * while checking for walls to avoid clipping through.
   */
  const updateGameState = useCallback(
    (deltaTime) => {
      setPlayer((prevPlayer) => {
        let { x, y, angle, moveSpeed, rotationSpeed } = prevPlayer;

        // --- Handle Rotation ---
        // Rotate left/right with arrow keys or mouse movement
        if (keys.current.left) angle -= rotationSpeed * deltaTime;
        if (keys.current.right) angle += rotationSpeed * deltaTime;

        // --- Movement Calculation ---
        // moveStepX and moveStepY track how far we want to move this frame
        let moveStepX = 0;
        let moveStepY = 0;

        // Move forward (W key or up arrow)
        if (keys.current.up) {
          moveStepX += Math.cos(angle) * moveSpeed * deltaTime;
          moveStepY += Math.sin(angle) * moveSpeed * deltaTime;
        }

        // Move backward (S key or down arrow)
        if (keys.current.down) {
          moveStepX -= Math.cos(angle) * moveSpeed * deltaTime;
          moveStepY -= Math.sin(angle) * moveSpeed * deltaTime;
        }

        // Strafe left (A key)
        if (keys.current.strafeLeft) {
          moveStepX += Math.cos(angle - Math.PI / 2) * moveSpeed * deltaTime;
          moveStepY += Math.sin(angle - Math.PI / 2) * moveSpeed * deltaTime;
        }

        // Strafe right (D key)
        if (keys.current.strafeRight) {
          moveStepX += Math.cos(angle + Math.PI / 2) * moveSpeed * deltaTime;
          moveStepY += Math.sin(angle + Math.PI / 2) * moveSpeed * deltaTime;
        }

        // --- Wall Collision Detection ---
        // Before actually updating the position, make sure we're not
        // walking into a wall. Check X and Y separately for smoother sliding.
        if (!getIsWall(x + moveStepX, y, MAP)) x += moveStepX;
        if (!getIsWall(x, y + moveStepY, MAP)) y += moveStepY;

        // --- Angle Wrapping ---
        // Keep the player's angle between 0 and 2π (circle range).
        if (angle < 0) angle += Math.PI * 2;
        if (angle >= Math.PI * 2) angle -= Math.PI * 2;

        // Return updated player state
        return { ...prevPlayer, x, y, angle };
      });
    },
    [keys] // Depend on the keys ref from input listener
  );

  // --- Use external helper to get camera plane ---
  // Pass player.angle, FOV_ANGLE, and screen aspect ratio
  const { planeX, planeY } = getCameraPlane(
    player.angle,
    FOV_ANGLE,
    aspectRatio
  );

  // --- Expose all game state values needed by the render and update loop ---
  return {
    player, // Player's current position and direction
    planeX, // Camera plane X component (for raycasting)
    planeY, // Camera plane Y component (for raycasting)
    updateGameState, // Main update function called every frame
    canvasRef, // Ref for attaching to the <canvas> to read mouse input
  };
};

/**
 * How These Functions Work:
 *
 * - useGameState initializes and manages the player's position, direction, and movement speed using React state.
 * - It uses a custom hook, usePlayerControls, to track keyboard and mouse inputs, storing active keys in a ref.
 * - The updateGameState function is called every frame with the time elapsed (deltaTime).
 *   It updates the player's angle (rotation) and position based on which keys are pressed, factoring in speed and deltaTime.
 * - Before moving, updateGameState checks for collisions with walls separately on the X and Y axes to allow smooth sliding along walls.
 * - The angle is wrapped between 0 and 2π to keep rotation values consistent.
 * - getCameraPlane (external) calculates a vector perpendicular to the player’s direction, scaled by the field of view and adjusted for aspect ratio,
 *   which is essential for raycasting to determine the player's visible area.
 * - The hook returns the current player state, camera plane vectors, the update function, and a canvas ref for mouse input handling.
 */
