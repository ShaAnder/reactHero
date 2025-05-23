// Window and tile settings
export const WINDOW_WIDTH = 1280; // Width of the game window in pixels
export const WINDOW_HEIGHT = 720; // Height of the game window in pixels
export const TILE_SIZE = 64; // Each map tile is 64x64 pixels (classic Wolf3D size[2]) also can be called map_scale

// Field of view (in radians)
// 60 degrees is standard FOV for classic raycasting games.
// To convert degrees to radians, we multiply by π/180. So 60° becomes (60 * π) / 180.
// Radians are JS's unit of measurement for measuring angles
export const FOV_ANGLE = (60 * Math.PI) / 180;

// Map grid size
export const MAP_NUM_ROWS = 15; // Number of rows in our map grid
export const MAP_NUM_COLS = 15; // Number of columns in our map grid

// 🎯 MATHS Breakdown: Field of View (FOV) Angle

// In JavaScript (and most programming languages), angles are measured in **radians**, not degrees.
// If you're more familiar with degrees (like 90° or 180°), think of radians as a different unit
// for describing angles — one that's much more natural for circular math.

// 🔢 So what *is* a radian?

// A full circle is:
// - 360 degrees
// - OR 2π radians (roughly 6.283)

// So, 1 radian is the angle created when you walk around an arc of a circle where the arc length
// is equal to the radius of the circle. It's a natural way to measure movement along curves.

// 🧠 In raycasting games like this one, we want a specific Field of View (FOV):
// - Classic FOV for raycasting games = 60 degrees
// - We need to convert that to radians for JavaScript to understand it

// Here’s the conversion formula:
// (60 * Math.PI) / 180

// Which simplifies to:
// Math.PI / 3

// ✅ Why convert degrees to radians?
// JavaScript's trigonometric functions (like Math.sin and Math.cos) only work with radians.
// Since our FOV and all rotation calculations rely on those trig functions, we must work in radians.

// 🛠️ Where do we use this value?
// - Casting rays across the screen
// - Rotating the player’s view
// - Figuring out how "wide" the visible cone of vision should be

// TL;DR:
// Degrees = human friendly
// Radians = math and code friendly
// 60 degrees → π/3 radians (aka ~1.047)
