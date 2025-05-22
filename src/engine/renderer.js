import { renderMinimap } from "./rendering/miniMapRenderer";
import { rayCaster } from "./rendering/raycaster";

import { FOV_ANGLE } from "../constants/gameConfig";
import { MAP } from "../constants/map";

// Our raycaster setup, we call this in app, pass the variables to our Raycaster
// which then does our RayCasting / DDA
export const renderRaycaster = (context, player) => {
  const dirX = Math.cos(player.angle);
  const dirY = Math.sin(player.angle);
  const fov = FOV_ANGLE;
  const planeX = -dirY * fov;
  const planeY = dirX * fov;

  rayCaster({
    player,
    planeX,
    planeY,
    screenWidth: context.canvas.width,
    screenHeight: context.canvas.height,
    map: MAP,
    context,
  });
};

export const render = (context, player) => {
  renderRaycaster(context, player);
  // we render minimap AFTER we render the space so it stays on top
  renderMinimap(context, player);
};
