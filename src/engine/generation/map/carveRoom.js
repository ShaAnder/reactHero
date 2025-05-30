/**
 * Attempts to carve a rectangular room at a given location.
 * This creates large open spaces instead of just narrow tunnels.
 *
 * @param {number[][]} map - 2D array representing the dungeon (1 = wall, 0 = floor)
 * @param {number} centerX - Column coordinate of the room center
 * @param {number} centerY - Row coordinate of the room center
 * @param {number} width - Room width in tiles
 * @param {number} height - Room height in tiles
 * @returns {[number, number] | null} - The center [y, x] of the room or null if failed
 */
export const carveRoom = (map, centerX, centerY, width, height) => {
  const rows = map.length;
  const cols = map[0].length;

  const startX = Math.max(1, centerX - Math.floor(width / 2));
  const endX = Math.min(cols - 2, centerX + Math.floor(width / 2));
  const startY = Math.max(1, centerY - Math.floor(height / 2));
  const endY = Math.min(rows - 2, centerY + Math.floor(height / 2));

  // Room too small or out of bounds
  if (endX <= startX || endY <= startY) return null;

  for (let row = startY; row <= endY; row++) {
    for (let col = startX; col <= endX; col++) {
      map[row][col] = 0;
    }
  }

  // Return the final (possibly clamped) center coordinates
  const finalCenterY = Math.floor((startY + endY) / 2);
  const finalCenterX = Math.floor((startX + endX) / 2);
  return [finalCenterY, finalCenterX];
};

/** how this function works:
 *
 * This function carves a rectangular room into the dungeon map.
 *
 * - First it calculates the bounds of the room based on its center (x, y)
 * - Ensures the room doesn’t go out of bounds by clamping to 1 and map size - 2
 * - Then it loops through every tile within that rectangular area
 * - Each tile in the range is set to `0` to mark it as floor (walkable)
 *
 * Example of how carving works:
 * If x=10, y=10 and width=5, height=3, it would carve:
 *
 * Row range: 9 to 11 (3 tiles tall)
 * Col range: 8 to 12 (5 tiles wide)
 *
 * So you get a 5x3 open room centered on (10, 10)
 *
 */
