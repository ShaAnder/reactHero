import { useState, useCallback, useMemo } from "react";
import { generateMap } from "../../engine/generation/map/createDungeon"; // map dispatcher
import { DEBUG_FLAGS } from "../../constants/debugConfig";
import { TILE_SIZE } from "../../../gameConfig";
import { DEFAULT_MAP_CONFIG } from "../../../gameConfig"; // defaults

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
	const [meta, setMeta] = useState(null); // generation metadata (stats)

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
				meta,
			} = await generateMap(config);
			setMap(map);
			setSpawn(spawnPosition);
			setExit(exitPosition);
			setMeta(meta);
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
	// Normalized world bundle (ready to grow with entities, meta, etc.)
	const world = useMemo(() => {
		let entities = [];
		if (DEBUG_FLAGS.ENABLE_SAMPLE_ENTITY && exit) {
			entities.push({
				id: "exit-marker",
				type: "marker",
				x: (exit[0] + 0.5) * TILE_SIZE,
				y: (exit[1] + 0.5) * TILE_SIZE,
				color: "#ff3366",
			});
		}
		return { map, spawn, exit, level, meta, entities };
	}, [map, spawn, exit, level, meta]);

	return {
		map,
		spawn,
		exit,
		loading,
		error,
		loadNextLevel,
		world,
		meta, // direct access if consumers want stats without digging
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
