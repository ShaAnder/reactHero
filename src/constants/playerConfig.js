// src/constants/playerConfig.js

// Where the player starts on the map (try to put them in an open space!)
export const PLAYER_START_X = 300;
export const PLAYER_START_Y = 300;

// How big the player dot is on the minimap
export const PLAYER_RADIUS = 5;

// How fast the player moves (pixels per second, so works well with deltaTime)
export const PLAYER_SPEED = 180;

// How fast the player turns (in radians per second)
// 3 degrees per frame, converted to radians (because JS trig uses radians)
export const PLAYER_ROTATION_SPEED = 300 * (Math.PI / 180);

// Information / math on rotation speed

// Much like FOV, we rotate the player based on radians. Typically, we use the player's
// current direction (the center of their FOV) as the anchor point for rotation.
// This lets us calculate the direction the player is looking over time.

// This is how most modern games handle rotation — we define a rotation speed (like a sensitivity setting),
// then multiply it by deltaTime to get the amount to rotate this frame.

// In this example:
// 500 * (Math.PI / 180);

// 500 is our degrees-per-second value (i.e. how fast the player should turn).
// Math.PI / 180 converts degrees to radians (JavaScript trig functions require radians).
// The final result is the number of **radians per second** we want the player to rotate at.

// We then use Math.sin and Math.cos to calculate the direction the player is facing
// or moving in, based on this rotation angle.

// Why use radians per second?

/*
- The player’s direction is stored as an angle in radians.
- When the player turns left or right, we add or subtract a small angle from this rotation.
- That small angle is calculated by: 

  rotationSpeed × deltaTime

- This makes rotation smooth and independent of frame rate.

- deltaTime is how much time has passed since the last frame.
  At 60 FPS, deltaTime ≈ 0.016 seconds per frame.

- So if your frame runs at time T = 1 second,
  and your last frame was at T = 0.984 seconds,
  then deltaTime = 0.016.
*/
