// Fixed timestep game loop built on requestAnimationFrame.
import { useRef, useState, useEffect, useCallback } from "react";
import { FRAME_DURATION } from "../../../gameConfig";

/**
 * Fixed timestep loop: calls update at a constant simulated frame rate while
 * letting rendering run each animation frame. Tracks real FPS for display.
 * @param {(dt:number)=>void} updateCallback
 * @param {(dt:number)=>void} renderCallback
 * @returns {number} measured frames per second (smoothed per second)
 */
export const useGameLoop = (updateCallback, renderCallback) => {
	// Latest measured FPS
	const [fps, setFps] = useState(0);

	// Timing accumulators and bookkeeping (refs so they persist without rerenders)
	const requestIdRef = useRef(null);
	const previousTimeRef = useRef();
	const accumulatorRef = useRef(0);
	const fpsCounterRef = useRef(0);
	const lastFpsUpdateRef = useRef(0);

	// Main RAF callback (stable identity via useCallback)
	const loop = useCallback(
		(timestamp) => {
			// First tick bootstrap
			if (previousTimeRef.current === undefined) {
				previousTimeRef.current = timestamp;
				lastFpsUpdateRef.current = timestamp;
			}

			// Wall-clock delta since last frame (ms)
			const deltaMs = timestamp - previousTimeRef.current;
			previousTimeRef.current = timestamp;
			accumulatorRef.current += deltaMs;

			// Cap runaway accumulation (avoid spiral of death)
			if (accumulatorRef.current > 3 * FRAME_DURATION) {
				accumulatorRef.current = FRAME_DURATION;
			}

			// Consume one fixed slice at a time
			if (accumulatorRef.current >= FRAME_DURATION) {
				// Fixed step in seconds
				const deltaTime = FRAME_DURATION / 1000;

				// Count frame toward FPS once per update
				fpsCounterRef.current++;

				// Publish FPS every 1s interval
				if (timestamp - lastFpsUpdateRef.current >= 1000) {
					setFps(fpsCounterRef.current);
					fpsCounterRef.current = 0;
					lastFpsUpdateRef.current = timestamp;
				}

				// Advance deterministic simulation
				if (updateCallback) updateCallback(deltaTime);

				// Draw current world snapshot (can be separated if needed)
				if (renderCallback) renderCallback(deltaTime);

				// Remove exactly one quantum; leave remainder for next loop
				accumulatorRef.current -= FRAME_DURATION;
			}

			// Queue next frame
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
