import { useEffect, useState } from "react";
import Canvas from "./components/canvas/Canvas";
import { useGameLoop } from "./hooks/useGameLoop";
import { useGameState } from "./hooks/useGameState";
import { render as gameRender } from "./engine/renderer";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "./constants/gameConfig";

function App() {
  // Handles player movement and state
  const { player, updateGameState, canvasRef } = useGameState();
  // Toggle FPS counter
  const [showFps, setShowFps] = useState(true);

  // This function draws everything each frame
  const render = (deltaTime) => {
    // Bail if canvas isn't ready
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    // Wipe the canvas clean before drawing
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the minimap and (eventually) the 3D view
    gameRender(context, player);
  };

  // This hook keeps the game loop running and returns the FPS
  const fps = useGameLoop(updateGameState, render);

  // Grab the actual canvas element from the DOM after it mounts
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = document.querySelector("canvas");
      canvasRef.current = canvas;
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {/* The main game canvas */}
      <Canvas
        ref={canvasRef}
        width={WINDOW_WIDTH}
        height={WINDOW_HEIGHT}
        style={{
          border: "1px solid black",
        }}
      />
      {/* Show FPS in the corner if enabled */}
      {showFps && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            color: "white",
          }}
        >
          FPS: {fps}
        </div>
      )}
    </div>
  );
}

export default App;
