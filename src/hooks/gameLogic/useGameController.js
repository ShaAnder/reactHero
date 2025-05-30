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

  // Loads the next level (generates a new map, spawn, and exit)
  const loadNextLevel = useCallback(async () => {
    setIsLoading(true);

    try {
      // Simulate a loading delay (could show a loading screen or transition)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate a new dungeon map and get spawn/exit positions
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

  // Load the first level when the component mounts
  useEffect(() => {
    loadNextLevel();
  }, [loadNextLevel]);

  // Return all game state and the function to load the next level
  return {
    level,
    map,
    spawn,
    exit,
    isLoading,
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
