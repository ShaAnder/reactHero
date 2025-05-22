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
export const PLAYER_ROTATION_SPEED = 500 * (Math.PI / 180);
