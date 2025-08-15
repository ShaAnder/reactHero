/*
HOW THIS FILE WORKS
Central tuning knobs for player feel. Adjust here; the movement / camera
hooks consume these so gameplay stays consistent.
*/
// Minimap marker radius (purely visual)
export const PLAYER_RADIUS = 5;

// Forward/back & strafe speed in pixels / second
export const PLAYER_SPEED = 180;

// Rotation speed in radians / second (≈250°/s for snappy but controllable turns)
export const PLAYER_ROTATION_SPEED = 250 * (Math.PI / 180);

// Mouse look sensitivity scalar (movementX * this -> radians)
export const MOUSE_SENSITIVITY = 0.002;
