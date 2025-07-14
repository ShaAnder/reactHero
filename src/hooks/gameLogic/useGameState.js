import { useState, useCallback, useRef, useEffect } from "react";
import { usePlayerControls } from "./usePlayerControls";
import {
	PLAYER_SPEED,
	PLAYER_ROTATION_SPEED,
} from "../../constants/playerConfig";
import { getIsWall } from "../../helpers/getIsWall";
import { FOV_ANGLE, TILE_SIZE } from "../../constants/gameConfig";
import { getCameraPlane } from "../../helpers/getCameraPlane";
import { setPlayerFacingInward } from "../../helpers/setPlayerFacingCenter";

/**
 * useGameState
 *
 * This hook manages everything related to the player's game state:
 * - Position (initialized from spawn)
 * - Angle/direction
 * - Movement logic (WASD, rotation, strafing)
 * - Collision with walls (using the current map)
 * - Mouse/keyboard input
 * - Camera plane math for raycasting (using external helper)
 */
export const useGameState = (map, spawn, keyBindings, onMapToggle) => {
	// --- Player State ---
	// Initialize player position from spawn (tile coordinates to pixel coordinates)
	const [player, setPlayer] = useState(() => ({
		x: spawn ? spawn[0] * TILE_SIZE + TILE_SIZE / 2 : 1.5 * TILE_SIZE,
		y: spawn ? spawn[1] * TILE_SIZE + TILE_SIZE / 2 : 1.5 * TILE_SIZE,
		angle: setPlayerFacingInward(spawn, map),
		moveSpeed: PLAYER_SPEED,
		rotationSpeed: PLAYER_ROTATION_SPEED,
	}));

	// If spawn changes (new level), reset player position
	useEffect(() => {
		if (spawn) {
			setPlayer((prev) => ({
				...prev,
				x: spawn[0] * TILE_SIZE + TILE_SIZE / 2,
				y: spawn[1] * TILE_SIZE + TILE_SIZE / 2,
				angle: setPlayerFacingInward(spawn, map),
			}));
		}
	}, [spawn, map]);

	// --- Canvas Ref ---
	const canvasRef = useRef(null);

	// --- Input Handling ---
	const keys = usePlayerControls(
		canvasRef,
		setPlayer,
		keyBindings,
		onMapToggle
	);

	/**
	 * updateGameState
	 *
	 * Moves the player based on input and deltaTime,
	 * while checking for walls to avoid clipping through.
	 */
	const updateGameState = useCallback(
		(deltaTime) => {
			setPlayer((prevPlayer) => {
				let { x, y, angle, moveSpeed, rotationSpeed } = prevPlayer;

				// --- Handle Rotation ---
				if (keys.current.left) angle -= rotationSpeed * deltaTime;
				if (keys.current.right) angle += rotationSpeed * deltaTime;

				// --- Movement Calculation ---
				let moveStepX = 0;
				let moveStepY = 0;

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

				// --- Wall Collision Detection using the current map ---
				if (map && !getIsWall(x + moveStepX, y, map)) x += moveStepX;
				if (map && !getIsWall(x, y + moveStepY, map)) y += moveStepY;

				// --- Angle Wrapping ---
				if (angle < 0) angle += Math.PI * 2;
				if (angle >= Math.PI * 2) angle -= Math.PI * 2;

				return { ...prevPlayer, x, y, angle };
			});
		},
		[keys, map]
	);

	// --- Use external helper to get camera plane ---
	const { planeX, planeY } = getCameraPlane(
		player.angle,
		FOV_ANGLE,
		1 // You may want to pass actual aspect ratio from your App
	);

	return {
		player,
		planeX,
		planeY,
		updateGameState,
		canvasRef,
	};
};

/*
How these functions work:

- useGameState initializes and manages the player's position, direction, and movement speed using React state.
- It uses a custom hook, usePlayerControls, to track keyboard and mouse inputs, storing active keys in a ref.
- The updateGameState function is called every frame with the time elapsed (deltaTime).
  It updates the player's angle (rotation) and position based on which keys are pressed, factoring in speed and deltaTime.
- Before moving, updateGameState checks for collisions with walls separately on the X and Y axes to allow smooth sliding along walls.
- The angle is wrapped between 0 and 2π to keep rotation values consistent.
- getCameraPlane (external) calculates a vector perpendicular to the player’s direction, scaled by the field of view and adjusted for aspect ratio,
  which is essential for raycasting to determine the player's visible area.
- The hook returns the current player state, camera plane vectors, the update function, and a canvas ref for mouse input handling.


*/
