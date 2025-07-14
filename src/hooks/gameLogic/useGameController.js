import { useState, useCallback } from "react";
import { generateMap } from "../../engine/generation/map/createDungeon";
import { DEFAULT_MAP_CONFIG } from "../../constants/gameConfig";

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
How this file works:

This React hook manages the core state for a dungeon-crawling game. It tracks the current level, the generated map, the player spawn and exit positions, and whether the game is currently loading. When called, loadNextLevel generates a new dungeon map (with spawn and exit) and increments the level. The hook automatically loads the first level on mount, and exposes all state along with the loadNextLevel function so you can trigger a new level from your UI or game logic.

Typical usage:
- Call useGameController() in your main game component.
- Use the returned state and methods to render the map, player, and handle level transitions.

*/
