/**
 * Calculates the camera plane vector used in raycasting.
 *
 * In a raycasting engine, the camera plane defines the width of the player's vision,
 * spreading out rays across the screen to simulate perspective.
 *
 * This vector is perpendicular (90 degrees rotated) to the player's direction,
 * and its length determines how "wide" the player's field of view appears.
 *
 * @param {number} angle - The player's viewing angle in radians.
 * @param {number} fovRadians - Field of view in radians (typically ~1.05 for 60°).
 * @param {number} aspectRatio - Screen's width divided by height.
 * @returns {Object} planeX and planeY - the 2D vector representing the camera plane.
 */
export function getCameraPlane(angle, fovRadians, aspectRatio) {
  // Forward-facing direction of the player as a unit vector
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  // The camera plane is perpendicular to the view direction.
  //
  // We compute it by rotating the direction vector 90° counter-clockwise,
  // then scaling it by tan(FOV / 2), which determines how far out to the side rays should fan.
  //
  // We also multiply the X component by the aspect ratio to ensure the horizontal field of view
  // doesn’t look squished or stretched depending on screen dimensions.
  return {
    planeX: -dirY * Math.tan(fovRadians / 2) * aspectRatio,
    planeY: dirX * Math.tan(fovRadians / 2),
  };
}
