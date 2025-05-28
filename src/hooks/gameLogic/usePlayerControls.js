import { useRef, useEffect } from "react";

const MOUSE_SENSITIVITY = 0.002;

export const usePlayerControls = (canvasRef, setPlayer) => {
  const keys = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    strafeLeft: false,
    strafeRight: false,
  });

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
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
          keys.current.left = true;
          break;
        case "ArrowRight":
          keys.current.right = true;
          break;
        case "a":
          keys.current.strafeLeft = true;
          break;
        case "d":
          keys.current.strafeRight = true;
          break;
      }
    };

    const handleKeyUp = (e) => {
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Mouse look
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = () => {
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    };

    const handleMouseMove = (e) => {
      if (document.pointerLockElement === canvas) {
        setPlayer((prev) => ({
          ...prev,
          angle: prev.angle + e.movementX * MOUSE_SENSITIVITY,
        }));
      }
    };

    canvas.addEventListener("click", handleClick);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("click", handleClick);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [canvasRef, setPlayer]);

  return keys;
};
