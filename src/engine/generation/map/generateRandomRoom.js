/**
 * Try to generate a random room within map boundaries without overlapping existing floors.
 *
 * @param {number[][]} map - The dungeon grid (0=floor, 1=wall)
 * @param {number} roomMinSize - Minimum room width/height
 * @param {number} roomMaxSize - Maximum room width/height
 * @param {number} maxAttempts - How many tries before giving up (default 20)
 * @returns {{x:number,y:number,width:number,height:number} | null} Room rect or null if no fit found
 */
export const generateRandomRoom = (
  map,
  minRoomSize,
  maxRoomSize,
  maxAttempts = 20
) => {
  // get our cols and rows, for looping
  const rows = map.length;
  const cols = map[0].length;

  const randomRoom = (minRoomSize, maxRoomSize) => {
    return (
      minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1))
    );
  };

  // for each attempt loop to try and place the room
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // get a random room width and height
    const width = randomRoom(minRoomSize, maxRoomSize);
    const height = randomRoom(minRoomSize, maxRoomSize);

    // Now random center coords, but we make sure it stays full inside map border (1 tile margin)
    const centerX = 1 + Math.floor(Math.random() * (cols - width - 2));
    const centerY = 1 + Math.floor(Math.random() * (rows - height - 2));

    // now we check for overlap,: room area  + 1 border to keep them separated
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
          // floor has been found - overlap!
          overlap = true;
          break;
        }
      }
      if (overlap) break;
    }

    // if no overlap found, return this room info
    if (!overlap) {
      return { centerX, centerY, width, height };
    }
  }
  // Failed to find non overlapping spot
  return null;
};

/**
 * How this function works
 *
 * We feed in our blank map, the min and max room sizes we want followed by the amount of attempts
 * we want to algorithm to try and make a room.
 *
 * WE then:
 * - loop through each attempt
 * - create a random room
 * - try and place said room on the array
 *
 * We loop for every tile in the area the room WOULD go, and if it's found to be within 1 margin of another room
 * it will fail the attempt and try again, it also does not clip the boundary as it requires a 1 tile margin, meaning
 * that it will always add a buffer to ensure it doesn't break the map wall
 *
 * finally it returns the data with the random room for carve room to carve on the map
 *
 */
