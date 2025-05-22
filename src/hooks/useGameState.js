import { useState, useCallback, useRef, useEffect } from "react";
import {
  PLAYER_START_X,
  PLAYER_START_Y,
  PLAYER_SPEED,
  PLAYER_ROTATION_SPEED,
} from "../constants/playerConfig";

export const useGameState = () => {
  // Player state: position, angle, speed, etc.
  const [player, setPlayer] = useState({
    x: PLAYER_START_X,
    y: PLAYER_START_Y,
    // Player starts facing east (angle 0)
    angle: 0,
    moveSpeed: PLAYER_SPEED,
    rotationSpeed: PLAYER_ROTATION_SPEED,
  });

  // Tracks which keys are currently held down
  const keys = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // When a movement key is pressed, update the keys ref
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
        // Log player info when a movement key is pressed
        // (player state might be a frame behind, but good enough for debugging)
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

  // When a movement key is released, update the keys ref
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

  // Set up global key listeners when the component mounts
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Clean up listeners when unmounting
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // This runs every frame from the game loop
  const updateGameState = useCallback((deltaTime) => {
    setPlayer((prevPlayer) => {
      let newX = prevPlayer.x;
      let newY = prevPlayer.y;
      let newAngle = prevPlayer.angle;

      // Handle rotation (left/right keys)
      if (keys.current.left) {
        newAngle -= prevPlayer.rotationSpeed * deltaTime;
      }
      if (keys.current.right) {
        newAngle += prevPlayer.rotationSpeed * deltaTime;
      }

      // Move forward/backward using trig
      // Math note:
      //   To move in the direction the player is facing, use cosine for x and sine for y.
      //   This way, movement is always relative to the player's angle, not just the grid.
      //   Multiply by moveSpeed and deltaTime so it works the same at any frame rate.
      if (keys.current.up) {
        newX += Math.cos(newAngle) * prevPlayer.moveSpeed * deltaTime;
        newY += Math.sin(newAngle) * prevPlayer.moveSpeed * deltaTime;
      }
      if (keys.current.down) {
        newX -= Math.cos(newAngle) * prevPlayer.moveSpeed * deltaTime;
        newY -= Math.sin(newAngle) * prevPlayer.moveSpeed * deltaTime;
      }

      return {
        ...prevPlayer,
        x: newX,
        y: newY,
        angle: newAngle,
      };
    });
  }, []);

  // Return player state and the update function for the game loop to use
  return {
    player,
    updateGameState,
  };
};
