import { useState } from "react";
import Canvas from "./components/canvas/Canvas";
import { useGameLoop } from "./hooks/gameLogic/useGameLoop";
import { useGameState } from "./hooks/gameLogic/useGameState";
import { render as gameRender } from "./engine/renderer";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "./constants/gameConfig";

function App() {
  // Custom hook managing the player state and input
  const { player, updateGameState, canvasRef } = useGameState();

  // Toggle to show or hide FPS overlay
  const [showFps, setShowFps] = useState(true);

  // Frame rendering function (draws everything)
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw everything (minimap, 3D scene, etc.)
    gameRender(context, player);
  };

  // Start the game loop and receive current FPS
  const fps = useGameLoop(updateGameState, render);

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
      {/* Game canvas */}
      <Canvas
        ref={canvasRef}
        width={WINDOW_WIDTH}
        height={WINDOW_HEIGHT}
        style={{ border: "1px solid black" }}
      />

      {/* FPS Counter Overlay */}
      {showFps && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            color: "white",
            fontFamily: "monospace",
            fontSize: "14px",
          }}
        >
          FPS: {fps}
        </div>
      )}
    </div>
  );
}

export default App;
