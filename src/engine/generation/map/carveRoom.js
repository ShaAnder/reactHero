// Tries to carve out a rectangular room on the dungeon map at the given center position.
// This makes a big open space (not just a tunnel) by setting a block of tiles to floor.
//
// map: 2D array where 1 = wall, 0 = floor
// centerX, centerY: where the room should be centered (in tile coordinates)
// width, height: how big the room should be (in tiles)
// Returns: [row, col] of the actual room center, or null if the room can't fit there

export const carveRoom = (map, centerX, centerY, width, height) => {
  // Figure out the size of the map
  const rows = map.length;
  const cols = map[0].length;

  // Calculate the top-left and bottom-right corners of the room,
  // but make sure we don't go outside the map (leave a 1-tile border)
  const startX = Math.max(1, centerX - Math.floor(width / 2));
  const endX = Math.min(cols - 2, centerX + Math.floor(width / 2));
  const startY = Math.max(1, centerY - Math.floor(height / 2));
  const endY = Math.min(rows - 2, centerY + Math.floor(height / 2));

  // If the calculated area is too small or out of bounds, bail out
  if (endX <= startX || endY <= startY) return null;
  if (endX - startX < 2 || endY - startY < 2) return null;

  // Loop over every tile in the rectangle and set it to floor (0)
  for (let row = startY; row <= endY; row++) {
    for (let col = startX; col <= endX; col++) {
      map[row][col] = 0;
    }
  }

  // Return the actual center of the carved room (in case it got clamped)
  const finalCenterY = Math.floor((startY + endY) / 2);
  const finalCenterX = Math.floor((startX + endX) / 2);
  return [finalCenterY, finalCenterX];
};

/*
How this file works:

This function is used to carve out a rectangular room in a grid-based dungeon map. You give it the map, the center point, and the desired room size. It checks the bounds so you don’t accidentally carve off the edge of the map, then sets all the tiles in the rectangle to 0 (which means “floor” or “walkable area”). The math for the bounds uses Math.max and Math.min to clamp the room inside the map and leaves a 1-tile border of walls around the whole map. If the room can’t fit, it just returns null. Otherwise, you get back the actual center of the room as [row, col] so you can use it for connecting corridors or placing stuff.

Math summary:
- The room’s start and end positions are calculated by centering the rectangle on (centerX, centerY) and clamping to the map edges.
- The function uses Math.floor to make sure the room dimensions are whole tiles.
- The final center is recalculated in case the room got shifted by the clamping.

You’d use this as part of a procedural dungeon generator, often combined with other algorithms to connect the rooms with corridors and fill out the map[4][5][7].
*/
