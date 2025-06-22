// Tries to generate a random room somewhere inside the map boundaries,
// making sure it doesn't overlap any existing rooms or floors.
// Returns the room's details if it fits, or null if it can't find a spot after several tries.

export const generateRandomRoom = (
  map,
  minRoomSize,
  maxRoomSize,
  maxAttempts = 20
) => {
  // Get the map's dimensions
  const rows = map.length;
  const cols = map[0].length;

  // Helper to pick a random room size between min and max (inclusive)
  const randomRoom = (minRoomSize, maxRoomSize) => {
    return (
      minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1))
    );
  };

  // Try up to maxAttempts to find a non-overlapping spot for the room
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Pick a random width and height for the room
    const width = randomRoom(minRoomSize, maxRoomSize);
    const height = randomRoom(minRoomSize, maxRoomSize);

    // Pick a random center position, making sure the room stays inside the map and leaves a 1-tile border
    const centerX = 1 + Math.floor(Math.random() * (cols - width - 2));
    const centerY = 1 + Math.floor(Math.random() * (rows - height - 2));

    // Check if the area (plus a 1-tile buffer) overlaps any existing floor tiles
    let overlap = false;
    for (
      let row = Math.max(0, centerY - 1);
      row < Math.min(rows, centerY + height + 1);
      row++
    ) {
      for (
        let col = Math.max(0, centerX - 1);
        col < Math.min(cols, centerX + width + 1);
        col++
      ) {
        if (map[row][col] === 0) {
          // Found an overlap with an existing floor
          overlap = true;
          break;
        }
      }
      if (overlap) break;
    }

    // If no overlap, we've found a valid spot—return the room details
    if (!overlap) {
      return { centerX, centerY, width, height };
    }
  }

  // Couldn’t find a valid spot after all attempts
  return null;
};

/*
How this file works:

This function tries to randomly generate a room inside the dungeon map. You give it the map, the min/max room sizes, and how many times it should try before giving up. For each attempt, it picks a random width and height, then a random center position that keeps the whole room (plus a 1-tile buffer) inside the map boundaries. It checks every tile in the proposed area (including the buffer) to make sure there’s no overlap with any existing floor tiles—so rooms never touch or overlap. If it finds a valid spot, it returns the coordinates and size so you can carve the room out later. If not, it returns null.

Math summary:
- Room size is picked randomly between min and max using Math.random and Math.floor.
- The center position is also random, but clamped so the room never pokes out of the map or touches the edge.
- The overlap check uses a simple nested loop to scan the area the room would occupy, plus a 1-tile border, to make sure it’s all walls.

*/
