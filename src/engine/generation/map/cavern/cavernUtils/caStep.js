import { getBlankMap } from "../../utils/getBlankMap";

// Our CAStep Helper function
export const caStep = (map) => {
  const rows = map.length,
    cols = map[0].length;
  const newMap = getBlankMap(1, rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let wallCount = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx === 0) continue;
          const ny = y + dy,
            nx = x + dx;
          if (ny < 0 || ny >= rows || nx < 0 || nx >= cols || map[ny][nx] === 1)
            wallCount++;
        }
      }
      newMap[y][x] = wallCount > 4 ? 1 : 0;
    }
  }
  return newMap;
};

/*
How this function works:

This function performs one iteration (step) of cellular automata smoothing on a cave map.

- Accepts a 2D array (`map`) representing the current cave state, where 1 = wall and 0 = floor.
- Creates a new blank map of the same size to store the updated state.
- For each cell, counts the number of wall tiles in its 8 neighboring positions.
- Applies the classic "4-5 rule": 
  - If a cell is surrounded by more than 4 wall neighbors, it becomes a wall (1); otherwise, it becomes a floor (0).
- This process is repeated for each cell, ensuring each update is based only on the previous map's state.
- Returns the new map, which can then be used for further CA steps or as the final cave layout.

This approach ensures that the cave evolves smoothly and organically, producing natural-looking cavernous spaces after several iterations
*/
