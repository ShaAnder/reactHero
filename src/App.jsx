import { useState, useEffect } from "react";
import Canvas from "./components/canvas/Canvas";
import LoadingScreen from "./components/loadingScreen";

import { useGameLoop } from "./hooks/gameLogic/useGameLoop";
import { useGameState } from "./hooks/gameLogic/useGameState";
import { useGameController } from "./hooks/gameLogic/useGameController";

import { render as gameRender } from "./engine/renderer";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "./constants/gameConfig";

const App = () => {
  // Central controller: handles map generation, spawn, level tracking, etc.
  const { map, spawn, exit, level, isLoading, loadNextLevel } =
    useGameController();

  // Only initialize game state once we have a spawn point
  const { player, updateGameState, canvasRef, setPlayerPosition } =
    useGameState(spawn);

  const [showFps, setShowFps] = useState(true);
  const [fps, setFps] = useState(0);

  // Game rendering function
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !map || !player) return;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    gameRender(context, player, map);
  };

  // Kick off the game loop once everything is ready
  useEffect(() => {
    if (!isLoading && map && spawn) {
      // Ensure player is reset at spawn each time
      setPlayerPosition(spawn.x, spawn.y);

      const loopFps = useGameLoop(updateGameState, render);
      setFps(loopFps); // store fps value in state
    }
  }, [isLoading, map, spawn]);

  // Transition to next level when player reaches the exit
  useEffect(() => {
    if (
      !isLoading &&
      player &&
      exit &&
      player.tileX === exit.x &&
      player.tileY === exit.y
    ) {
      loadNextLevel();
    }
  }, [player.tileX, player.tileY, exit, isLoading]);

  // Show loading screen while generating
  if (isLoading || !map || !spawn) {
    return <LoadingScreen level={level} map={map} />;
  }

  // Main game UI
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
        ref={canvasRef}
        width={WINDOW_WIDTH}
        height={WINDOW_HEIGHT}
        style={{ border: "1px solid black" }}
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
