import { useState } from "react";
import Canvas from "./components/canvas/Canvas";
import { useGameLoop } from "./hooks/gameLogic/useGameLoop";
import { useGameState } from "./hooks/gameLogic/useGameState";
import { render as gameRender } from "./engine/renderer";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "./constants/gameConfig";
import { useGameController } from "./hooks/gameLogic/useGameController";
import LoadingScreen from "./components/loadingScreen";

const App = () => {
  // Game controller manages map, spawn, exit, level, and loading state
  const { map, spawn, exit, level, isLoading, loadNextLevel } =
    useGameController();

  // Game state hook manages player position, movement, and canvas ref
  const { player, updateGameState, canvasRef } = useGameState(map, spawn);

  // Toggle for displaying FPS counter
  const [showFps, setShowFps] = useState(true);

  // Render function for the game loop
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    gameRender(context, player, map);
  };

  // Custom hook to run the game loop and get current FPS
  const fps = useGameLoop(updateGameState, render);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        zIndex: 10,
      }}
    >
      <Canvas
        ref={canvasRef}
        width={WINDOW_WIDTH}
        height={WINDOW_HEIGHT}
        style={{ border: "1px solid black" }}
        onClick={() => console.log("React onClick fired!")}
      />
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
};

export default App;

/*
How this file works:

This is the main React app for your raycasting game. It wires together all the core hooks and components:

- useGameController handles map generation, level state, and loading transitions.
- useGameState manages the player's position, movement, and camera logic.
- useGameLoop runs the fixed-timestep game loop, calling updateGameState and render each frame, and tracks FPS.
- The Canvas component is where the game is drawn. The canvasRef is passed down for direct drawing.
- The render function clears the canvas and calls the main game renderer to draw the 3D view and minimap.
- While the map is loading, a LoadingScreen is displayed.
- An FPS counter is shown in the corner if showFps is true.

*/
