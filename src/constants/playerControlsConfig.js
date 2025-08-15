/*
HOW THIS FILE WORKS
Default logical control mapping (lower‑cased). Hook compares e.key.toLowerCase()
against these so end users can later remap without rewriting input code.
*/
export const DEFAULT_KEY_BINDINGS = {
	up: "w",
	down: "s",
	left: "arrowleft",
	right: "arrowright",
	strafeLeft: "a",
	strafeRight: "d",
	map: "m",
	pause: "p",
};
