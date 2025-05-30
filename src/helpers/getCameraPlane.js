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
export const getCameraPlane = (angle, fovRadians, aspectRatio) => {
  // Get the player's direction as a unit vector
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  // Rotate the direction vector 90° to get a perpendicular camera plane vector.
  // In 2D, rotating (x, y) by 90° counter-clockwise gives you (-y, x).
  // This vector "fans out" rays sideways from the player's view.
  //
  // Scale the plane by tan(FOV/2) to control the width of the FOV.
  // Multiplying planeX by aspectRatio keeps the FOV consistent on all screen shapes.
  const fovScale = Math.tan(fovRadians / 2);

  return {
    planeX: -dirY * fovScale * aspectRatio,
    planeY: dirX * fovScale,
  };
};

/*
How this file works:

This function calculates the 2D camera plane vector for a raycasting renderer. The camera plane is always perpendicular to the direction the player is facing, and its length is set so the rays spread out to match the desired field of view (FOV). By using tan(FOV/2), the math matches real-world projection, ensuring the view looks correct and not distorted. The aspect ratio scaling makes sure the FOV remains visually consistent even on wide or tall screens.

Math summary:
- The player's direction is (cos(angle), sin(angle)).
- Rotating that by 90° gives (-sin(angle), cos(angle)), which is perpendicular.
- The FOV is set by scaling this perpendicular vector by tan(FOV/2)[1][5][6].
- The aspect ratio is applied to the X component to prevent stretching or squishing on non-square screens.

*/
