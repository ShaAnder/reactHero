/* Utility function to create a randomized dungeon map */

import { getMap } from "../helpers/getBlankMap";

export const createMap = () => {
  let dimensions = 25,
    maxLength = 8,
    maxTunnels = 40;

  // initializer our map with 1's based on the dimensions
  let MAP = getMap(1, dimensions);

  // we set our current row and columb based on our dimensions
  let currentRow = Math.floor(Math.random() * dimensions),
    currentColumn = Math.floor(Math.random() * dimensions);

  // we want to capture the last directions as well as initialize the current random
  // direction variable, old directions are stores inside lastDirection to cross
  // reference against the current randomDirection later
  let lastDirection = [],
    randomDirection;

  // now we set a random tunnel length for the walkers to carve
  let randomLength = Math.ceil(Math.random() * maxLength),
    tunnelLength = 0;

  // set our directions for the walkers
  let directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  do {
    randomDirection = directions[Math.floor(Math.random() * directions.length)];
  } while (
    (randomDirection[0] === -lastDirection[0] &&
      randomDirection[1] === -lastDirection[1]) ||
    (randomDirection[0] === lastDirection[0] &&
      randomDirection[1] === lastDirection[1])
  );

  // Begin tunneling, this turns the value of cells from one to zero while
  // the tunnelLength is smaller than randomLength. If within the loop the tunnel
  // hits the edges of the map, the loop should break.

  while (maxTunnels > 0) {
    // Choose a new direction (not the same or opposite of the last one)
    do {
      randomDirection =
        directions[Math.floor(Math.random() * directions.length)];
    } while (
      (randomDirection[0] === -lastDirection[0] &&
        randomDirection[1] === -lastDirection[1]) ||
      (randomDirection[0] === lastDirection[0] &&
        randomDirection[1] === lastDirection[1])
    );

    // Choose a new random length
    let randomLength = Math.ceil(Math.random() * maxLength);
    let tunnelLength = 0;

    // Carve out the tunnel
    while (tunnelLength < randomLength) {
      if (
        (currentRow === 0 && randomDirection[0] === -1) ||
        (currentColumn === 0 && randomDirection[1] === -1) ||
        (currentRow === dimensions - 1 && randomDirection[0] === 1) ||
        (currentColumn === dimensions - 1 && randomDirection[1] === 1)
      ) {
        break;
      } else {
        MAP[currentRow][currentColumn] = 0;
        currentRow += randomDirection[0];
        currentColumn += randomDirection[1];
        tunnelLength++;
      }
    }

    if (tunnelLength) {
      lastDirection = randomDirection;
      maxTunnels--;
    }
  }

  return MAP; // Make sure to return something!
};
