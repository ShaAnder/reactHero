import { useState } from "react";
import Canvas from "./components/canvas/Canvas";
import { useGameLoop } from "./hooks/gameLogic/useGameLoop";
import { useGameState } from "./hooks/gameLogic/useGameState";
import { render as gameRender } from "./engine/renderer";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "./constants/gameConfig";
import { useGameController } from "./hooks/gameLogic/useGameController";
import Map from "./components/canvas/Map";
import { DEFAULT_MAP_CONFIG } from "./constants/gameConfig";
import { DEFAULT_KEY_BINDINGS } from "./constants/playerControlsConfig";

const ENVIRONMENTS = Object.keys(DEFAULT_MAP_CONFIG.environmentPresets);

const App = () => {
  //--- STATE ---//

  // map modal
  const [openMap, setOpenMap] = useState(false);

  // set our enviornment for choosing dungeon
  const [environment, setEnvironment] = useState(
    DEFAULT_MAP_CONFIG.environment
  );

  // Regen key for forcing remount/regenerate when we select a new map
  const [regenKey, setRegenKey] = useState(0);

  // Toggle for displaying FPS counter
  const [showFps, setShowFps] = useState(true);

  //--- FUNCTIONS ---//

  // Render function for the game loop
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    gameRender(context, player, map);
  };

  const toggleMap = () => {
    setOpenMap((open) => !open);
  };

  //--- HOOKS ---//

  // Game controller manages map, spawn, exit, level, and loading state
  const { map, spawn } = useGameController({ environment, regenKey });

  // Game state hook manages player position, movement, and canvas ref
  const { player, updateGameState, canvasRef } = useGameState(
    map,
    spawn,
    DEFAULT_KEY_BINDINGS,
    toggleMap
  );

  // Custom hook to run the game loop and get current FPS
  const fps = useGameLoop(updateGameState, render);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Environment Selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Environment:</label>
        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          style={{ marginRight: 16 }}
        >
          {ENVIRONMENTS.map((env) => (
            <option key={env} value={env}>
              {env}
            </option>
          ))}
        </select>
        <button onClick={() => setRegenKey((prev) => prev + 1)}>
          Generate Dungeon
        </button>
      </div>
      <Canvas
        ref={canvasRef}
        width={WINDOW_WIDTH}
        height={WINDOW_HEIGHT}
        style={{ border: "1px solid black" }}
        onClick={() => console.log("React onClick fired!")}
      />
      {openMap && (
        <div
          style={{
            position: "absolute", // key for overlaying
            top: "50%",
            left: "50%",
            width: 250,
            height: 250,
            transform: "translate(-50%, -50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "auto",
            zIndex: 100,
            background: "rgba(0,0,0,0.6)",
          }}
          onClick={toggleMap}
        >
          <Map map={map} spawn={spawn} exit={map?.exit} />
        </div>
      )}
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
