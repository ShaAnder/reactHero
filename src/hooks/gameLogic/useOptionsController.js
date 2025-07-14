import { useState } from "react";
import { DEFAULT_MAP_CONFIG } from "../../constants/gameConfig";

export const DEFAULT_OPTIONS = {
	environment: DEFAULT_MAP_CONFIG.environment, // Our default Environment
	mapSize: 64, // Default map size
	levelCount: 5, // Default Levels (Medium Run)
};

/**
 * useOptionsController
 *
 * Custom React hook to manage all user-configurable game options.
 * - Stores options in local state
 * - Provides functions to update a single option or reset all to defaults
 * - Can be used in menus, options screens, or passed to game logic
 */

export default function useOptionsController(initialOptions = DEFAULT_OPTIONS) {
	const [options, setOptions] = useState(initialOptions);

	const setOption = (key, value) => {
		setOptions((prevOptions) => ({
			...prevOptions,
			[key]: value,
		}));
	};

	const resetOptions = () => {
		setOptions(DEFAULT_OPTIONS);
	};

	return {
		options,
		setOption,
		resetOptions,
	};
}

/*
How this file works:

This hook centralizes all game options (environment, map size, level count, etc.) in a single state object.
It provides easy functions to update individual options or reset everything to defaults, making it simple to manage user settings from menus or options screens.
Use this hook at the top level of your app and pass the options to your game logic when starting a run.
*/
