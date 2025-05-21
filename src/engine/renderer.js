import { TILE_SIZE, MAP_NUM_ROWS, MAP_NUM_COLS } from "../constants/gameConfig";
import { MAP } from "../constants/map";

export const renderMinimap = (context, player) => {
  // Paint the whole canvas black to clear previous frame
  context.fillStyle = "black";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  // Draw each tile of the minimap
  for (let row = 0; row < MAP_NUM_ROWS; row++) {
    for (let col = 0; col < MAP_NUM_COLS; col++) {
      const tileX = col * TILE_SIZE; // Where this tile starts (left)
      const tileY = row * TILE_SIZE; // Where this tile starts (top)
      // Walls are dark, open space is white
      const tileColor = MAP[row][col] === 1 ? "#222" : "#fff";

      context.fillStyle = tileColor;
      context.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
    }
  }

  // Draw the player as a red dot
  context.fillStyle = "red";
  context.beginPath();
  context.arc(player.x, player.y, 5, 0, Math.PI * 2);
  context.fill();

  // Draw a line showing which way the player is facing
  // Math explanation:
  //   To show the direction, we use the player's angle and draw a line 20 pixels long.
  //   cos(angle) gives us the x direction, sin(angle) gives us the y direction.
  //   So, the line starts at the player and points "forward" based on their angle.
  context.strokeStyle = "red";
  context.beginPath();
  context.moveTo(player.x, player.y);
  context.lineTo(
    player.x + Math.cos(player.angle) * 20,
    player.y + Math.sin(player.angle) * 20
  );
  context.stroke();
};

export const renderRaycaster = (context, player) => {
  // This is where the 3D magic will happen later!
  // For now, just logging so we know it's being called
  console.log(context, player);
};
