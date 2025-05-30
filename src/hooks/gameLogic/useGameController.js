import { useState, useEffect, useCallback } from "react";
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
export const useGameController = () => {
  const [level, setLevel] = useState(1);
  const [map, setMap] = useState(null);
  const [spawn, setSpawn] = useState(null);
  const [exit, setExit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadNextLevel = useCallback(async () => {
    setIsLoading(true);

    try {
      // Simulate loading delay (e.g., show loading screen, fade transition, etc.)
      await new Promise((resolve) => setTimeout(resolve, 500));

      const {
        map,
        start: spawnPosition,
        exit: exitPosition,
      } = await generateMap(DEFAULT_MAP_CONFIG);

      setMap(map);
      setSpawn(spawnPosition);
      setExit(exitPosition);
      setLevel((prev) => prev + 1);
    } catch (error) {
      console.error("Error generating map:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load the first level on mount
  useEffect(() => {
    loadNextLevel();
  }, [loadNextLevel]);

  return {
    level,
    map,
    spawn,
    exit,
    isLoading,
    loadNextLevel,
  };
};
