/**
 * Calculates the camera plane vector for raycasting.
 * The camera plane is perpendicular to the player's view direction and defines the width of the field of view (FOV).
 * This is used to spread rays across the screen, simulating a 3D perspective.
 *
 * @param {number} angle - The player's viewing angle in radians.
 * @param {number} fovRadians - The field of view in radians.
 * @param {number} aspectRatio - The screen's aspect ratio (width / height).
 * @returns {Object} An object containing planeX and planeY, the components of the camera plane vector.
 */
export function getCameraPlane(angle, fovRadians, aspectRatio) {
  // Calculate the player's forward direction as a unit vector
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);

  // The camera plane must be perpendicular to the direction vector
  // Its length is determined by the FOV and aspect ratio
  // Math.tan(fovRadians / 2) sets the "half-width" of the camera plane for the given FOV
  // aspectRatio scales the horizontal component so the FOV looks correct on any screen shape

  return {
    // planeX is perpendicular to dirX/dirY, and points to the "right" of the player
    planeX: -dirY * Math.tan(fovRadians / 2) * aspectRatio,
    // planeY is also perpendicular and points "up" relative to dirX/dirY
    planeY: dirX * Math.tan(fovRadians / 2),
  };
}

/*

Summary Notes
What does this function do?
Calculates the camera plane vector, which is always perpendicular to the player's current direction.

The camera plane defines the width of the player's FOV and is crucial for determining the direction of each ray cast for every screen column.

How does the math work?
dirX, dirY:

These are the X and Y components of the player's viewing direction, calculated using cosine and sine of the angle.

Perpendicular Vector:

The camera plane must be perpendicular to the direction vector. In 2D, this is achieved by swapping X and Y and negating one component.

FOV and Aspect Ratio:

The width of the camera plane is set using Math.tan(fovRadians / 2), which gives the correct half-width for the desired FOV.

The aspect ratio scales the X component, ensuring the FOV appears correct on screens of any shape.

Result:

planeX and planeY are the components of the camera plane vector, used in raycasting to calculate the direction of each ray:

text
rayDirX = dirX + planeX * cameraX
rayDirY = dirY + planeY * cameraX
This ensures rays are spread evenly across the FOV, creating a realistic 3D perspective.

Why is this important in a raycaster?
The camera plane acts as the "window" through which the player looks out into the world.

It allows the engine to compute the direction for each ray, from the far left of the screen (cameraX = -1) to the far right (cameraX = +1), relative to the player's current angle.

This is the foundation for rendering a convincing first-person 3D view using only 2D math.

In short:
This function is essential for setting up the FOV and ray directions in a raycaster, ensuring the 3D illusion is accurate and responsive to the player's angle and the screen's shape.

*/
