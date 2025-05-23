import { renderMinimap } from "./rendering/miniMapRenderer";
import { rayCaster } from "./rendering/raycaster";

import { FOV_ANGLE } from "../constants/gameConfig";
import { MAP } from "../constants/map";

import { getCameraPlane } from "../helpers/getCameraPlane";

// Our raycaster setup, we call this in app, pass the variables to our Raycaster
// which then does our RayCasting / DDA
export const renderRaycaster = (context, player) => {
  const screenWidth = context.canvas.width;
  const screenHeight = context.canvas.height;
  const aspectRatio = screenWidth / screenHeight;
  const FOV = (60 * Math.PI) / 180;

  const { planeX, planeY } = getCameraPlane(player.angle, FOV, aspectRatio);

  rayCaster({
    player,
    planeX,
    planeY,
    screenWidth,
    screenHeight,
    map: MAP,
    context,
  });
};

export const render = (context, player) => {
  renderRaycaster(context, player);
  // we render minimap AFTER we render the space so it stays on top
  renderMinimap(context, player);
};
