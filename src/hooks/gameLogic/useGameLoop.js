// I use this hook to run my game loop at a steady pace, using requestAnimationFrame.
import { useRef, useState, useEffect, useCallback } from "react";
import { FRAME_DURATION } from "../../constants/gameConfig";

/**
 * useGameLoop
 *
 * This is my custom hook for running a fixed-timestep game loop.
 * I make sure the game updates and draws at a consistent rate (about 60 times per second).
 * I keep the update logic and the rendering separate, and I track the real FPS so I can show it in the UI.
 *
 * @param {Function} updateCallback - This is where I update the game logic (like moving the player).
 * @param {Function} renderCallback - This is where I draw the current frame (like rendering the canvas).
 * @returns {number} fps - I return the real FPS so I can display it.
 */
export const useGameLoop = (updateCallback, renderCallback) => {
	// I keep track of the current FPS so I can show it in the UI.
	const [fps, setFps] = useState(0);

	// I use refs to keep track of animation frame IDs and timing.
	const requestIdRef = useRef(null);
	const previousTimeRef = useRef();
	const accumulatorRef = useRef(0);
	const fpsCounterRef = useRef(0);
	const lastFpsUpdateRef = useRef(0);

	// This is the main loop. I use useCallback so it doesn't change every render.
	const loop = useCallback(
		(timestamp) => {
			// On the first frame, I set up my timestamps.
			if (previousTimeRef.current === undefined) {
				previousTimeRef.current = timestamp;
				lastFpsUpdateRef.current = timestamp;
			}

			// I calculate how much time has passed since the last frame.
			const deltaMs = timestamp - previousTimeRef.current;
			previousTimeRef.current = timestamp;
			accumulatorRef.current += deltaMs;

			// If the game lags, I cap the accumulator so we don't try to catch up too much at once.
			if (accumulatorRef.current > 3 * FRAME_DURATION) {
				accumulatorRef.current = FRAME_DURATION;
			}

			// I only update the game if enough time has passed for a new frame.
			if (accumulatorRef.current >= FRAME_DURATION) {
				// Fixed update step in seconds
				const deltaTime = FRAME_DURATION / 1000;

				// Count this frame for FPS calculation
				fpsCounterRef.current++;

				// Update FPS once per second
				if (timestamp - lastFpsUpdateRef.current >= 1000) {
					setFps(fpsCounterRef.current);
					fpsCounterRef.current = 0;
					lastFpsUpdateRef.current = timestamp;
				}

				// Update game state logic
				if (updateCallback) updateCallback(deltaTime);

				// Render the current frame
				if (renderCallback) renderCallback(deltaTime);

				// Subtract only one frame's worth of time
				// (we don’t reset to 0 in case of lag buildup)
				accumulatorRef.current -= FRAME_DURATION;
			}

			// Schedule the next frame
			requestIdRef.current = requestAnimationFrame(loop);
		},
		[updateCallback, renderCallback]
	);

	// Start loop on mount, stop on unmount
	useEffect(() => {
		requestIdRef.current = requestAnimationFrame(loop);

		return () => {
			cancelAnimationFrame(requestIdRef.current);
		};
	}, [loop]);

	return fps;
};

/*
How this file works:

This is my main game loop. I use it to keep the game running smoothly, updating the logic and drawing the screen at a steady pace. I also track the FPS so I can see how well the game is performing. I use requestAnimationFrame for smooth animation, and I make sure to clean up when the component unmounts.
*/
