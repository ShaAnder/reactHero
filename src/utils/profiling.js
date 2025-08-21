// profiling.js
// Minimal timing utility. Example:
// const { ms, result } = timeSection('ray', () => doWork());
// console.log(ms);
export function timeSection(label, fn) {
	const start = performance.now();
	const result = fn();
	return { label, ms: performance.now() - start, result };
}
