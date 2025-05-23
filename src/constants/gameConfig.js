// Window and tile settings
export const WINDOW_WIDTH = 1280; // Width of the game window in pixels
export const WINDOW_HEIGHT = 720; // Height of the game window in pixels
export const TILE_SIZE = 64; // Each map tile is 64x64 pixels (classic Wolf3D size[2]) also can be called map_scale

// Field of view (in radians)
// 60 degrees is standard FOV for classic raycasting games.
// To convert degrees to radians, we multiply by π/180. So 60° becomes (60 * π) / 180.
// Radians are JS's unit of measurement for measuring angles
export const FOV_ANGLE = Math.PI / 3;

// Map grid size
export const MAP_NUM_ROWS = 15; // Number of rows in our map grid
export const MAP_NUM_COLS = 15; // Number of columns in our map grid
