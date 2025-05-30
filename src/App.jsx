import { useState } from "react";
import Canvas from "./components/canvas/Canvas";
import { useGameLoop } from "./hooks/gameLogic/useGameLoop";
import { useGameState } from "./hooks/gameLogic/useGameState";
import { render as gameRender } from "./engine/renderer";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "./constants/gameConfig";

import { useGameController } from "./hooks/gameLogic/useGameController";

import LoadingScreen from "./components/loadingScreen";

const App = () => {
  const { map, spawn, exit, level, isLoading, loadNextLevel } =
    useGameController();

  const { player, updateGameState, canvasRef } = useGameState(map, spawn);

  const [showFps, setShowFps] = useState(true);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    gameRender(context, player, map);
  };

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
