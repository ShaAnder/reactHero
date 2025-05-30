import React, { useEffect, useRef } from "react";

function LoadingScreen({ level, map }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const TILE_SIZE = 10; // pixels per tile on this test canvas
    canvas.width = map[0].length * TILE_SIZE;
    canvas.height = map.length * TILE_SIZE;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[0].length; x++) {
        if (map[y][x] === 1) {
          ctx.fillStyle = "darkgray"; // wall
        } else {
          ctx.fillStyle = "white"; // floor
        }
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }, [map]);

  return (
    <div
      style={{
        fontFamily: "monospace",
        fontSize: "20px",
        color: "white",
        backgroundColor: "black",
        width: "100%",
        height: "98vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>Loading Level {level}...</div>
      {map && (
        <canvas
          ref={canvasRef}
          style={{
            marginTop: 20,
            border: "2px solid white",
            imageRendering: "pixelated", // makes crisp squares
          }}
        />
      )}
    </div>
  );
}

export default LoadingScreen;
