// Rendering-related constants.

export const MIN_ENTITY_SIZE_PX = 4; // clamp to keep tiny entities visible
export const TILE_CENTER_OFFSET = 0.5; // convert from tile index to tile center
export const MIN_PERP_DISTANCE = 0.01; // avoid extreme slice heights
export const RAY_STEP = 1; // columns per step in raycaster (bigger = faster/rougher)

/*
HOW THIS FILE WORKS
Numbers that describe how we draw things (sizes, offsets). Avoid adding values
that are obviously local math (like width / 2); keep those inline.
*/
