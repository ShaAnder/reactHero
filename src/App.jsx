import { useState } from "react";
import { useFrameLoop } from "./utils/FrameLoop";
import Canvas from "./components/canvas/Canvas";

function App() {
  const draw = (context, count) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    // give it color
    context.fillstyle = "grey";
    const delta = count % 1280;
    // x, y, width, height
    context.fillRect(10 + delta, 10, 100, 100);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Canvas
          draw={draw}
          width="1280"
          height="720"
          style={{
            border: "1px solid black",
          }}
        />
      </div>
    </>
  );
}
export default App;
