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
  // Step 1: Get the player's view direction as a unit vector
  const dirX = Math.cos(angle); // Facing horizontally
  const dirY = Math.sin(angle); // Facing vertically

  // Step 2: Rotate the direction vector 90 degrees to get a perpendicular plane vector
  //
  // In 2D:
  //   Rotating (x, y) counter-clockwise by 90° gives you (-y, x)
  //   This gives you a vector that "fans out" sideways from the player's view.
  //
  // Step 3: Scale it by the FOV to control how wide the camera plane is.
  //   - We use tan(FOV / 2) because it defines how far off-center the edge rays go.
  //   - We multiply planeX by aspectRatio to account for screen shape (so things don’t look squished).
  const fovScale = Math.tan(fovRadians / 2);

  return {
    planeX: -dirY * fovScale * aspectRatio,
    planeY: dirX * fovScale,
  };
};

/** how this works:
 *
 * Imagine the player is standing at the center of the screen, looking forward.
 * The camera plane is like the "view window" in front of them.
 *
 * If the player is looking north (up), the view direction is (0, -1),
 * and the camera plane would stretch horizontally from left to right.
 *
 * By rotating the direction 90°, we get a side-facing vector that defines the edges of vision.
 * The longer this vector is, the wider the FOV. We scale it using `tan(FOV / 2)` to match real-world projection math.
 *
 * Finally, we apply the screen’s aspect ratio to make sure things don’t look distorted on widescreens.
 *
 * This camera plane is then added (in small steps) to the direction vector to cast individual rays
 * per column on screen.
 */
