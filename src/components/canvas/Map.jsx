import { useEffect, useRef } from "react";

function Map({ map, spawn, exit }) {
	const canvasRef = useRef(null);

	useEffect(() => {
		if (!map) return;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		const TILE_SIZE = 10;
		canvas.width = map[0].length * TILE_SIZE;
		canvas.height = map.length * TILE_SIZE;

		for (let y = 0; y < map.length; y++) {
			for (let x = 0; x < map[0].length; x++) {
				// Default: walkable = white, wall = black
				let color = map[y][x] === 1 ? "black" : "white";
				// Highlight spawn and exit
				if (spawn && x === spawn[0] && y === spawn[1]) {
					color = "limegreen";
				} else if (exit && x === exit[0] && y === exit[1]) {
					color = "red";
				}

				ctx.fillStyle = color;
				ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}
	}, [map, spawn, exit]);

	return (
		map && (
			<canvas
				ref={canvasRef}
				style={{
					border: "2px solid white",
					imageRendering: "pixelated",
					display: "block",
				}}
			/>
		)
	);
}

export default Map;

/*
 * This component was originally a test loading screen for ensuring maps were being generated.
 * Now it stays as it may be repurposed into a map item or for other uses in the future.
 */
