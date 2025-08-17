import { useState } from "react";
import { DEFAULT_MAP_CONFIG } from "../../constants/gameConfig";

export const DEFAULT_OPTIONS = {
	environment: DEFAULT_MAP_CONFIG.environment, // Default environment selection
	mapSize: 64, // Default map dimensions (square)
	length: 5, // Normalized total run floors (was levelCount)
};

/**
 * Lightweight options store for menus.
 * Keeps environment / size / length in a single object so you can pass
 * it wholesale into a run start action without juggling separate props.
 */

export default function useOptionsController(initialOptions = DEFAULT_OPTIONS) {
	const [options, setOptions] = useState(initialOptions);

	const setOption = (key, value) => {
		setOptions((prev) => ({ ...prev, [key]: value }));
	};

	const resetOptions = () => {
		setOptions(DEFAULT_OPTIONS);
	};

	return { options, setOption, resetOptions };
}

/*
	HOW THIS FILE WORKS

	Central tiny state container for configurable run options.

	Why keep them grouped?
	- Easier to persist / reset.
	- Pass a single object when starting a run.
	- Future additions (difficulty, seed entry) slot in without prop churn.

	API
	options: current options object
	setOption(k,v): mutate one field
	resetOptions(): revert to defaults constant

	Extending
	Add new defaults in DEFAULT_OPTIONS and surface matching UI controls.
	*/
