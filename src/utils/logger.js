// logger.js
// Lightweight, documented logger utility so we can silence noisy warnings in production
// and keep generation / rendering messages consistent.
// Usage: import { log } from "../utils/logger"; log.warn("Gen", "Something happened", extraObj)
// Levels gate output based on environment (DEV -> debug, PROD -> warn+).

const isDev =
	typeof import.meta !== "undefined" ? import.meta.env?.DEV ?? true : true;
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
let current = isDev ? "debug" : "warn";

export const setLogLevel = (lvl) => {
	if (LEVELS[lvl]) current = lvl;
};

function emit(level, tag, ...args) {
	if (LEVELS[level] < LEVELS[current]) return; // below current threshold
	console[level === "debug" ? "log" : level](`[${tag}]`, ...args);
}

export const log = {
	debug: (tag, ...a) => emit("debug", tag, ...a),
	info: (tag, ...a) => emit("info", tag, ...a),
	warn: (tag, ...a) => emit("warn", tag, ...a),
	error: (tag, ...a) => emit("error", tag, ...a),
};

// End logger
