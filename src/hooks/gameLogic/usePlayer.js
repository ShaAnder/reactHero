import { useState, useEffect, useCallback } from "react";
import {
	PLAYER_SPEED,
	PLAYER_ROTATION_SPEED,
} from "../../constants/playerConfig";
import { TILE_SIZE } from "../../../gameConfig";
import { getIsWall } from "../../helpers/getIsWall";
import { setPlayerFacingInward } from "../../helpers/setPlayerFacingCenter";

/**
 * usePlayer
 * Keeps track of player position + angle and moves them based on a keys ref.
 * No event listeners here (input hook handles that). Just math & collision.
 *
 * Inputs: map (for walls), spawn ([x,y] tile), keysRef.current booleans.
 * Returns: { player, setPlayer, updatePlayer(dt) }.
 *
 * Reset: whenever spawn or map changes we drop the player at spawn and face
 * roughly toward the center (same rule for level change and reroll for now).
 *
 * Notes: angle is wrapped into [0, 2π); collision is simple per‑axis so you
 * can slide along walls.
 */
export function usePlayer(map, spawn, keysRef) {
	const [player, setPlayer] = useState(() => ({
		x: spawn ? spawn[0] * TILE_SIZE + TILE_SIZE / 2 : 1.5 * TILE_SIZE,
		y: spawn ? spawn[1] * TILE_SIZE + TILE_SIZE / 2 : 1.5 * TILE_SIZE,
		angle: setPlayerFacingInward(spawn, map),
		moveSpeed: PLAYER_SPEED,
		rotationSpeed: PLAYER_ROTATION_SPEED,
	}));

	// New spawn/map -> reposition & face inward
	useEffect(() => {
		if (!spawn) return;
		setPlayer((p) => ({
			...p,
			x: spawn[0] * TILE_SIZE + TILE_SIZE / 2,
			y: spawn[1] * TILE_SIZE + TILE_SIZE / 2,
			angle: setPlayerFacingInward(spawn, map),
		}));
	}, [spawn, map]);

	const updatePlayer = useCallback(
		(deltaTime) => {
			if (!keysRef?.current) return;
			setPlayer((prev) => {
				let { x, y, angle, moveSpeed, rotationSpeed } = prev;
				const k = keysRef.current;
				if (k.left) angle -= rotationSpeed * deltaTime;
				if (k.right) angle += rotationSpeed * deltaTime;

				let moveStepX = 0,
					moveStepY = 0;
				if (k.up) {
					moveStepX += Math.cos(angle) * moveSpeed * deltaTime;
					moveStepY += Math.sin(angle) * moveSpeed * deltaTime;
				}
				if (k.down) {
					moveStepX -= Math.cos(angle) * moveSpeed * deltaTime;
					moveStepY -= Math.sin(angle) * moveSpeed * deltaTime;
				}
				if (k.strafeLeft) {
					moveStepX += Math.cos(angle - Math.PI / 2) * moveSpeed * deltaTime;
					moveStepY += Math.sin(angle - Math.PI / 2) * moveSpeed * deltaTime;
				}
				if (k.strafeRight) {
					moveStepX += Math.cos(angle + Math.PI / 2) * moveSpeed * deltaTime;
					moveStepY += Math.sin(angle + Math.PI / 2) * moveSpeed * deltaTime;
				}

				if (map && !getIsWall(x + moveStepX, y, map)) x += moveStepX;
				if (map && !getIsWall(x, y + moveStepY, map)) y += moveStepY;

				if (angle < 0) angle += Math.PI * 2;
				if (angle >= Math.PI * 2) angle -= Math.PI * 2;

				return { ...prev, x, y, angle };
			});
		},
		[keysRef, map]
	);

	return { player, setPlayer, updatePlayer };
}

/*
HOW THIS HOOK WORKS

Per frame when updatePlayer runs:
1. Read ephemeral input booleans from keysRef.current.
2. Adjust angle first (so movement uses the new facing immediately).
3. Build a movement vector from forward/back + strafe components.
4. Attempt X move then Y move separately for simple wall sliding.
5. Normalize angle into [0, 2π) so it never drifts out of range.

Collision: test X then Y separately for cheap wall sliding.

Why state not only a ref? Easier to inspect in devtools / maybe show on HUD.
If it gets hot we can switch to a ref + snapshot later.
*/
