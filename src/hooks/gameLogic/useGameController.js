import { useState, useCallback } from "react";
import { generateMap } from "../../engine/generation/map/createDungeon";
import { DEFAULT_MAP_CONFIG } from "../../../gameConfig";
/**
 * useGameController
 * Manages map + spawn + exit generation workflow and exposes loadNextLevel.
 * Stateless about run seeds/level numbers (handled by higher-level state machine).
 */

/**
 * Game controller hook that manages:
 * - Current level
 * - Current map
 * - Spawn and exit positions
 * - Loading state
 *
 * Handles level loading and transitions.
 */
export const useGameController = ({ environment }) => {
	const [map, setMap] = useState(null);
	const [spawn, setSpawn] = useState(null);
	const [exit, setExit] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Loads the next level (generates a new map, spawn, and exit)

	const loadNextLevel = useCallback(async () => {
		setLoading(true);
		setError(null);
		setMap(null);
		setSpawn(null);
		setExit(null);
		try {
			await new Promise((resolve) => setTimeout(resolve, 500));
			const preset =
				DEFAULT_MAP_CONFIG.environmentPresets[environment] ||
				DEFAULT_MAP_CONFIG.environmentPresets["dungeon"];

			const config = {
				...DEFAULT_MAP_CONFIG,
				...preset,
				environment,
				walkerPresets: preset.walkerPresets,
			};

			const {
				map,
				start: spawnPosition,
				exit: exitPosition,
			} = await generateMap(config);
			setMap(map);
			setSpawn(spawnPosition);
			setExit(exitPosition);
			setLoading(false);
		} catch (err) {
			console.error("[useGameController] Error generating map:", err);
			setError(err.message || "Failed to generate map");
			setLoading(false);
		}
	}, [environment]);

	// NOTE: No automatic map generation on mount. Call loadNextLevel() from your app logic when needed.

	// Return all game state and the function to load the next level
	return {
		map,
		spawn,
		exit,
		loading,
		error,
		loadNextLevel,
	};
};

/*
HOW THIS FILE WORKS

Orchestrates procedural level fetch: wraps map/spawn/exit and a loading flag.

Flow of loadNextLevel:
1. Clear prior map/spawn/exit + set loading.
2. Merge DEFAULT_MAP_CONFIG with environment preset.
3. Call generateMap(config) which returns { map, start, exit }.
4. Publish results + flip loading false.

Why stateless about level numbers / seeds?
- Keeps pure responsibility: just “give me a fresh playable space”. Higher
	layers decide when / why (reroll, next depth, seed replay).

Extending
- Thread a seed param and replace Math.random usages inside generators.
- Return additional derived data (visibility graph, nav mesh) alongside map.
*/
