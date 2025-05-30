import { useState, useEffect, useCallback } from "react";
import { generateMap } from "../../engine/generation/map/createDungeon";

/**
 *
 * functional game controller hook used to manage all the state related to the game
 * manages:
 *   - current level
 *   - map for current level
 *   - spawn point
 *   - exit point
 *   - loading state
 *
 * we then use these to build our levels, control level transitions ect
 *
 */
export const useGameController = () => {
  const [level, setLevel] = useState(1);
  const [map, setMap] = useState(null);
  const [spawn, setSpawn] = useState(null);
  const [exit, setExit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadNextLevel = useCallback(() => {
    setIsLoading(true);

    setTimeout(() => {
      (async () => {
        try {
          const {
            map,
            start: spawnPosition,
            exit: exitPosition,
          } = await generateMap();

          setMap(map);
          setSpawn(spawnPosition);
          setExit(exitPosition);
          setLevel((prev) => prev + 1);
        } catch (error) {
          // Log internally, no user-visible error
          console.error("Error generating map:", error);
          // Optionally, fallback to a very simple map or reset state here
        } finally {
          setIsLoading(false);
        }
      })();
    }, 500);
  }, []);

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
