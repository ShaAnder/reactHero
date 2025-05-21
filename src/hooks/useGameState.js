import { useState, useCallback, useRef, useEffect } from "react";
import {
  PLAYER_START_X,
  PLAYER_START_Y,
  PLAYER_SPEED,
  PLAYER_ROTATION_SPEED,
} from "../constants/playerConfig";

export const useGameState = () => {
  const [player, setPlayer] = useState({
    x: PLAYER_START_X,
    y: PLAYER_START_Y,
    // Facing east initially
    angle: 0,
    moveSpeed: PLAYER_SPEED,
    rotationSpeed: PLAYER_ROTATION_SPEED,
  });

  const keys = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const handleKeyDown = useCallback(
    (e) => {
      let logged = false;
      switch (e.key) {
        case "ArrowUp":
        case "w":
          keys.current.up = true;
          logged = true;
          break;
        case "ArrowDown":
        case "s":
          keys.current.down = true;
          logged = true;
          break;
        case "ArrowLeft":
        case "a":
          keys.current.left = true;
          logged = true;
          break;
        case "ArrowRight":
        case "d":
          keys.current.right = true;
          logged = true;
          break;
        default:
          break;
      }
      if (logged) {
        // Log the current player state
        // (player state may be one frame behind, but this is usually fine for debugging)
        console.log(
          "KeyDown:",
          e.key,
          "Player position:",
          player.x,
          player.y,
          "Angle:",
          player.angle
        );
      }
    },
    [player]
  );

  const handleKeyUp = useCallback((e) => {
    switch (e.key) {
      case "ArrowUp":
      case "w":
        keys.current.up = false;
        break;
      case "ArrowDown":
      case "s":
        keys.current.down = false;
        break;
      case "ArrowLeft":
      case "a":
        keys.current.left = false;
        break;
      case "ArrowRight":
      case "d":
        keys.current.right = false;
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const updateGameState = useCallback((deltaTime) => {
    setPlayer((prevPlayer) => {
      let newX = prevPlayer.x;
      let newY = prevPlayer.y;
      let newAngle = prevPlayer.angle;

      // Handle rotation using our deltatime
      if (keys.current.left) {
        newAngle -= prevPlayer.rotationSpeed * deltaTime;
      }
      if (keys.current.right) {
        newAngle += prevPlayer.rotationSpeed * deltaTime;
      }

      // We handle movement by using trig
      if (keys.current.up) {
        newX += Math.cos(newAngle) * prevPlayer.moveSpeed * deltaTime;
        newY += Math.sin(newAngle) * prevPlayer.moveSpeed * deltaTime;
      }
      if (keys.current.down) {
        newX -= Math.cos(newAngle) * prevPlayer.moveSpeed * deltaTime;
        newY -= Math.sin(newAngle) * prevPlayer.moveSpeed * deltaTime;
      }

      // collision detection will go here

      return {
        ...prevPlayer,
        x: newX,
        y: newY,
        angle: newAngle,
      };
    });
  }, []);

  return {
    player,
    updateGameState,
  };
};
