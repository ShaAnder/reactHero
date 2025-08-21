// Debug / development rendering + instrumentation flags
export const DEBUG_FLAGS = {
	SHOW_MINIMAP_DEFAULT: true, // initial minimap visibility
	SHOW_HUD_DEFAULT: true, // initial HUD visibility
	ENABLE_SAMPLE_ENTITY: true, // spawn a test entity marker at exit for depth validation
	PROFILE_FRAME: false, // log frame timing for ray + entities
	VERBOSE_RAYCAST_WARN: false, // spam warnings for invalid ray cells (off normally)
};
