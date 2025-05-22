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
  });

  // Reference to your canvas for pointer lock
  const canvasRef = useRef(null);

  // --- Keyboard controls (unchanged) ---
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
      case "a":
        keys.current.left = true;
        break;
      case "ArrowRight":
      case "d":
        keys.current.right = true;
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
      let newX = prevPlayer.x;
      let newY = prevPlayer.y;
      let newAngle = prevPlayer.angle;

      // Keyboard rotation (left/right keys)
      if (keys.current.left) {
        newAngle -= prevPlayer.rotationSpeed * deltaTime;
      }
      if (keys.current.right) {
        newAngle += prevPlayer.rotationSpeed * deltaTime;
      }

      // Normalize angle to 0...2π (optional but tidy)
      if (newAngle < 0) newAngle += Math.PI * 2;
      if (newAngle >= Math.PI * 2) newAngle -= Math.PI * 2;

      // Forward/back movement
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

  // --- Return state, updater, and canvasRef for use in your component ---
  return {
    player,
    updateGameState,
    canvasRef, // Use this ref for your <canvas ref={canvasRef} />
  };
};
