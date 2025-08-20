import { useState, useCallback, useMemo } from "react";
import { generateMap } from "../../engine/generation/map/createDungeon";
import { DEFAULT_MAP_CONFIG } from "../../../gameConfig";

/**
 * useGameController
 * Handles generating a fresh map + spawn + exit and exposing a simple loadNextLevel.
 * Inputs: environment key, level number. Returns map stuff + loading/error + a `world` bundle.
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
export const useGameController = ({ environment, level }) => {
	const [map, setMap] = useState(null);
	const [spawn, setSpawn] = useState(null);
	const [exit, setExit] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Generate a new map + spawn + exit

	const loadNextLevel = useCallback(async () => {
		setLoading(true);
		setError(null);
		setMap(null);
		setSpawn(null);
		setExit(null);
		try {
			await new Promise((resolve) => setTimeout(resolve, 500));
			const preset = DEFAULT_MAP_CONFIG.environmentPresets[environment];

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
	// World object (normalized bundle) – consumers can migrate to this gradually
	const world = useMemo(
		() => ({ map, spawn, exit, level }),
		[map, spawn, exit, level]
	);

	return {
		map,
		spawn,
		exit,
		loading,
		error,
		loadNextLevel,
		world,
	};
};

/*
HOW THIS FILE WORKS

Orchestrates procedural level fetch: wraps map/spawn/exit and a loading flag.

loadNextLevel steps:
1. Clear old map stuff + set loading.
2. Build config from defaults + preset.
3. generateMap -> { map, start, exit }.
4. Save & unset loading.

Seed/level logic lives higher up so this stays dumb and reusable.

Extend ideas: pass seed, return nav/visibility info, etc.
*/
