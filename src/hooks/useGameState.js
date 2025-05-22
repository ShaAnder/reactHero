import { useState, useCallback, useRef, useEffect } from "react";
import {
  PLAYER_START_X,
  PLAYER_START_Y,
  PLAYER_SPEED,
  PLAYER_ROTATION_SPEED,
} from "../constants/playerConfig";

const MOUSE_SENSITIVITY = 0.002; // Tweak this value for faster/slower mouse turning

export const useGameState = () => {
  // Player state: position, angle, speed, etc.
  const [player, setPlayer] = useState({
    x: PLAYER_START_X,
    y: PLAYER_START_Y,
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
    strafeLeft: false,
    strafeRight: false,
  });

  // Reference to your canvas for pointer lock
  const canvasRef = useRef(null);

  // --- Keyboard controls ---
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case "ArrowUp":
      case "w":
        keys.current.up = true;
        break;
      case "ArrowDown":
      case "s":
        keys.current.down = true;
        break;
      case "ArrowLeft":
        // Turn left
        keys.current.left = true;
        break;
      case "ArrowRight":
        // Turn right
        keys.current.right = true;
        break;
      case "a":
        // Strafe left
        keys.current.strafeLeft = true;
        break;
      case "d":
        // Strafe right
        keys.current.strafeRight = true;
        break;
      default:
        break;
    }
  }, []);

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
        keys.current.left = false;
        break;
      case "ArrowRight":
        keys.current.right = false;
        break;
      case "a":
        keys.current.strafeLeft = false;
        break;
      case "d":
        keys.current.strafeRight = false;
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

  // --- Mouse look support ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Request pointer lock on click
    const handleCanvasClick = () => {
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    };

    // Mouse move handler: update player angle
    const handleMouseMove = (e) => {
      if (document.pointerLockElement === canvas) {
        setPlayer((prev) => ({
          ...prev,
          angle: prev.angle + e.movementX * MOUSE_SENSITIVITY,
        }));
      }
    };

    canvas.addEventListener("click", handleCanvasClick);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // --- Game loop update ---
  const updateGameState = useCallback((deltaTime) => {
    setPlayer((prevPlayer) => {
      // we get the stats of our prev player angle
      let { x, y, angle, moveSpeed, rotationSpeed } = prevPlayer;

      // Rotation (arrow keys)
      if (keys.current.left) angle -= rotationSpeed * deltaTime;
      if (keys.current.right) angle += rotationSpeed * deltaTime;

      // Forward/back movement
      if (keys.current.up) {
        x += Math.cos(angle) * moveSpeed * deltaTime;
        y += Math.sin(angle) * moveSpeed * deltaTime;
      }
      if (keys.current.down) {
        x -= Math.cos(angle) * moveSpeed * deltaTime;
        y -= Math.sin(angle) * moveSpeed * deltaTime;
      }

      // Strafing (A/D)
      if (keys.current.strafeLeft) {
        // Move perpendicular to facing direction (left)
        x += Math.cos(angle - Math.PI / 2) * moveSpeed * deltaTime;
        y += Math.sin(angle - Math.PI / 2) * moveSpeed * deltaTime;
      }
      if (keys.current.strafeRight) {
        // Move perpendicular to facing direction (right)
        x += Math.cos(angle + Math.PI / 2) * moveSpeed * deltaTime;
        y += Math.sin(angle + Math.PI / 2) * moveSpeed * deltaTime;
      }

      // Normalize angle
      if (angle < 0) angle += Math.PI * 2;
      if (angle >= Math.PI * 2) angle -= Math.PI * 2;

      return { ...prevPlayer, x, y, angle };
    });
  }, []);

  // --- Return state, updater, and canvasRef for use in your component ---
  return {
    player,
    updateGameState,
    canvasRef, // Use this ref for your <canvas ref={canvasRef} />
  };
};
