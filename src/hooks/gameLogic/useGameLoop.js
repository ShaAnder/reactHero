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
HOW THIS FILE WORKS

Fixed‑timestep simulation layered atop variable‑timestep rendering.

Mechanics
- accumulatorRef collects real time until >= FRAME_DURATION then runs exactly
	one update slice (deltaTime constant in seconds) for determinism.
- renderCallback invoked after each simulation slice (can diverge later).
- FPS counted by updates and published every ~1000ms.

Why cap accumulator?
- Prevents huge catch‑up spirals if tab was backgrounded (spiral of death).

Extending
- Add interpolation factor: accumulatorRef.current / FRAME_DURATION for smooth lerp.
- Separate logic vs render scheduling by moving render outside fixed step.
*/
