import { useState, useCallback, useRef } from "react";
import { usePlayerControls } from "./usePlayerControls"; // Custom hook for handling keyboard & mouse input
import {
  PLAYER_START_X,
  PLAYER_START_Y,
  PLAYER_SPEED,
  PLAYER_ROTATION_SPEED,
  MOUSE_SENSITIVITY,
} from "../../constants/playerConfig";
import { getIsWall } from "../../helpers/getIsWall"; // Utility for collision checking
import { MAP } from "../../constants/map"; // Current game map (2D grid)
import { FOV_ANGLE } from "../../constants/gameConfig"; // Used to compute the camera plane

/**
 * useGameState
 * This hook manages the player’s position, angle, movement, and camera info for the game loop.
 * It acts as the central source of truth for anything player-related.
 */
export const useGameState = () => {
  // --- Player State ---
  // This holds the current player position, facing angle, and movement/rotation speeds.
  const [player, setPlayer] = useState({
    x: PLAYER_START_X,
    y: PLAYER_START_Y,
    angle: 0, // Angle is in radians, starts at 0 (facing right on screen)
    moveSpeed: PLAYER_SPEED,
    rotationSpeed: PLAYER_ROTATION_SPEED,
  });

  // --- Canvas Ref ---
  // We attach this to the canvas DOM element so we can use it for pointer lock and mouse movement
  const canvasRef = useRef(null);

  // --- Input Handling ---
  // We delegate keyboard + mouse input to a custom hook.
  // This returns a `keys` ref with current input state and internally handles event listeners.
  const keys = usePlayerControls(canvasRef, setPlayer);

  /**
   * updateGameState
   * Called on each frame from the game loop (passes in deltaTime to ensure frame-rate independence)
   * Moves and rotates the player based on active input, with wall collision checking.
   */
  const updateGameState = useCallback(
    (deltaTime) => {
      setPlayer((prevPlayer) => {
        let { x, y, angle, moveSpeed, rotationSpeed } = prevPlayer;

        // --- Handle rotation via left/right arrow keys ---
        if (keys.current.left) angle -= rotationSpeed * deltaTime;
        if (keys.current.right) angle += rotationSpeed * deltaTime;

        // --- Determine how much to move in X and Y directions ---
        let moveStepX = 0;
        let moveStepY = 0;

        // Move forward/backward (W/S or up/down keys)
        if (keys.current.up) {
          moveStepX += Math.cos(angle) * moveSpeed * deltaTime;
          moveStepY += Math.sin(angle) * moveSpeed * deltaTime;
        }
        if (keys.current.down) {
          moveStepX -= Math.cos(angle) * moveSpeed * deltaTime;
          moveStepY -= Math.sin(angle) * moveSpeed * deltaTime;
        }

        // Strafe left/right (A/D keys)
        if (keys.current.strafeLeft) {
          moveStepX += Math.cos(angle - Math.PI / 2) * moveSpeed * deltaTime;
          moveStepY += Math.sin(angle - Math.PI / 2) * moveSpeed * deltaTime;
        }
        if (keys.current.strafeRight) {
          moveStepX += Math.cos(angle + Math.PI / 2) * moveSpeed * deltaTime;
          moveStepY += Math.sin(angle + Math.PI / 2) * moveSpeed * deltaTime;
        }

        // --- Wall Collision Detection ---
        // Only allow the move if there's no wall in the way
        if (!getIsWall(x + moveStepX, y, MAP)) x += moveStepX;
        if (!getIsWall(x, y + moveStepY, MAP)) y += moveStepY;

        // Keep angle within [0, 2π) to avoid it drifting forever
        if (angle < 0) angle += Math.PI * 2;
        if (angle >= Math.PI * 2) angle -= Math.PI * 2;

        return { ...prevPlayer, x, y, angle };
      });
    },
    [keys] // This hook uses the `keys` ref from input handler
  );

  /**
   * getCameraPlane
   * This is used for the raycasting step in rendering.
   * The camera plane is perpendicular to the player's direction vector and determines the view width.
   */
  const getCameraPlane = (angle) => ({
    planeX: -Math.sin(angle) * FOV_ANGLE,
    planeY: Math.cos(angle) * FOV_ANGLE,
  });

  // Get the current camera plane based on the player's angle
  const { planeX, planeY } = getCameraPlane(player.angle);

  // --- Expose everything needed by the game loop and renderers ---
  return {
    player, // Position and direction of the player
    planeX, // Horizontal component of the camera plane
    planeY, // Vertical component of the camera plane
    updateGameState, // Called every frame to update player position
    canvasRef, // To attach to your <canvas> element for mouse control
  };
};
