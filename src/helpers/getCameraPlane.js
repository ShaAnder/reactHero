/**
 * Calculates the sideways (perpendicular) vector that defines how wide the
 * player can see – the “camera plane”. Rays will fan out along this plane.
 *
 * Thinkof it like this:
 * Picture the player looking forward. Now rotate that forward arrow 90° to
 * get a sideways arrow. Scale that sideways arrow so that when we sweep from
 * the far left of the screen to the far right we cover the intended field of
 * view. That scaled perpendicular vector is what we return here.
 *
 * @param {number} angle       Player viewing angle in radians
 * @param {number} fovRadians  Desired field of view in radians (≈1.047 for 60°)
 * @param {number} aspectRatio Screen width / height (used to keep horizontal FOV stable)
 * @returns {{planeX:number, planeY:number}}
 */
export const getCameraPlane = (angle, fovRadians, aspectRatio) => {
	// Get the player's direction as a unit vector
	const dirX = Math.cos(angle);
	const dirY = Math.sin(angle);

	// Rotate the forward direction 90° counter‑clockwise: (x,y) -> (-y,x)
	// Scale by tan(FOV/2) so edges of the screen align to FOV limits.
	// Stretch X by aspect ratio so wide screens don’t widen the true FOV.
	const fovScale = Math.tan(fovRadians / 2);

	return {
		planeX: -dirY * fovScale * aspectRatio,
		planeY: dirX * fovScale,
	};
};

/*
HOW THIS FILE WORKS / WHY IT EXISTS

Raycasting projects a 3D illusion by sending out a bundle of rays. We need a
stable way to turn a screen X coordinate (left to right) into a direction in
the world. The “camera plane” forms the sideways basis vector for that. The
forward vector + plane vector span a little 2D slice; each ray direction is
forward + plane * cameraX where cameraX runs from -1 → +1.

Key points:
- Forward direction = (cos(angle), sin(angle)).
- Perpendicular = rotate 90° → (-sin(angle), cos(angle)).
- Length = tan(FOV / 2) so the extreme rays sit exactly at the FOV edges.
- Aspect ratio only scales X so wide monitors don’t artificially zoom out.
*/
