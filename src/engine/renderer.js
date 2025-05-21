import { TILE_SIZE, MAP_NUM_ROWS, MAP_NUM_COLS } from "../constants/gameConfig";
import { MAP } from "../constants/map";

export const renderMinimap = (context, player) => {
  // Clear the canvas
  context.fillStyle = "black";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  // Draw the minimap
  for (let row = 0; row < MAP_NUM_ROWS; row++) {
    for (let col = 0; col < MAP_NUM_COLS; col++) {
      const tileX = col * TILE_SIZE;
      const tileY = row * TILE_SIZE;
      const tileColor = MAP[row][col] === 1 ? "#222" : "#fff";

      context.fillStyle = tileColor;
      context.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
    }
  }

  // Draw the player
  context.fillStyle = "red";
  context.beginPath();
  context.arc(player.x, player.y, 5, 0, Math.PI * 2);
  context.fill();

  // Draw player direction line
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
  // Implementation of the raycaster rendering will go here
  // for now just log it
  console.log(context, player);
};
