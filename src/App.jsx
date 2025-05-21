import { useRef, useEffect, useState } from "react";
import Canvas from "./components/canvas/Canvas";
import { useGameLoop } from "./hooks/useGameLoop";
import { useGameState } from "./hooks/useGameState";
import { renderMinimap, renderRaycaster } from "./utils/renderer";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "./constants/gameConfig";

function App() {
  const canvasRef = useRef(null);
  const { player, updateGameState } = useGameState();
  const [showFps, setShowFps] = useState(true);

  // Set up rendering function
  const render = (deltaTime) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Render the game
    renderMinimap(context, player);
    renderRaycaster(context, player);
  };

  // Use our game loop
  const fps = useGameLoop(updateGameState, render);

  // Get reference to the canvas element
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
      <Canvas
        width={WINDOW_WIDTH}
        height={WINDOW_HEIGHT}
        style={{
          border: "1px solid black",
        }}
      />
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
