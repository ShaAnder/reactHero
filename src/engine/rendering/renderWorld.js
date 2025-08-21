// High level frame renderer: wall pass → entity pass → overlays (HUD / minimap).

import { renderRaycaster } from "../renderer";
import { renderMinimap } from "./miniMapRenderer";
import { renderHUD } from "./hudRenderer";
import { DEBUG_FLAGS } from "../../constants/debugConfig";
import { timeSection } from "../../utils/profiling";
import { log } from "../../utils/logger";
import { FOV_ANGLE, TILE_SIZE } from "../../../gameConfig";

/**
 * renderEntities
 * Minimal billboard placeholder: each entity is a colored square projected
 * into screen space using the same camera parameters as the raycaster.
 * This is deliberately cheap and synchronous; later we can swap for textured
 * sprites / sorting / animation without changing the outer pipeline.
 *
 * Currently no entities, but shall be added in enxt updates
 */
function renderEntities(ctx, world, opts) {
	const { entities = [], player } = world;
	if (!entities.length) return; // nothing to draw
	const depth = opts.depth; // depth[x] = wall distance at column x
	const screenW = ctx.canvas.width;
	const screenH = ctx.canvas.height;
	const halfFov = FOV_ANGLE / 2;

	for (const e of entities) {
		// Vector from player → entity
		const dx = e.x - player.x;
		const dy = e.y - player.y;
		const dist = Math.hypot(dx, dy);
		if (dist < 0.001) continue; // avoid divide by ~0

		// Angle between player facing and entity direction (normalize to -π..π)
		let angleTo = Math.atan2(dy, dx);
		let diff = angleTo - player.angle;
		while (diff > Math.PI) diff -= Math.PI * 2;
		while (diff < -Math.PI) diff += Math.PI * 2;
		if (Math.abs(diff) > halfFov) continue; // outside view cone

		// Convert angular offset → screen column (0..width)
		const proj = (diff + halfFov) / (2 * halfFov);
		const screenX = Math.floor(proj * screenW);

		// Scale by inverse distance (crude perspective);
		// clamp a min + cap to screen height
		const size = Math.min(
			screenH,
			Math.max(4, Math.floor((TILE_SIZE * screenH) / dist / 2))
		);
		const top = Math.floor(screenH / 2 - size / 2);

		// Simple occlusion: if wall at that column is nearer, skip
		if (depth && depth[screenX] && depth[screenX] < dist) continue;

		ctx.fillStyle = e.color || "#ff0";
		ctx.fillRect(screenX - size / 2, top, size, size);
	}
}

/**
 * renderWorld(ctx, world, opts)
 * Orchestrates one frame. Pure side‑effects on the canvas.
 * Steps:
 *  1. Wall pass → returns depth buffer (distance per column) from the raycaster.
 *  2. Entity pass → billboards that respect that depth for occlusion.
 *  3. Overlays → minimap & HUD (optional / toggleable).
 * Perf instrumentation (PROFILE_FRAME) wraps passes with lightweight timers.
 *
 * world: { player, map, entities?, ...future }
 * opts:  { showMinimap?, showHUD?, fps?, depthBuffer? (reuse array), ... }
 */
export function renderWorld(ctx, world, opts = {}) {
	if (!ctx || !world) return; // guard against bad calls

	const { player, map } = world;

	// 1. WALLS
	let depth; // distance per column used for entity occlusion
	let timings = [];
	if (DEBUG_FLAGS.PROFILE_FRAME) {
		const { ms, result } = timeSection("ray", () =>
			renderRaycaster(ctx, player, map, opts.depthBuffer)
		);
		depth = result;
		timings.push(["ray", ms.toFixed(2)]);
	} else {
		depth = renderRaycaster(ctx, player, map, opts.depthBuffer);
	}

	// 2. ENTITIES
	if (DEBUG_FLAGS.PROFILE_FRAME) {
		const { ms } = timeSection("entities", () =>
			renderEntities(ctx, world, { ...opts, depth })
		);
		timings.push(["entities", ms.toFixed(2)]);
	} else {
		renderEntities(ctx, world, { ...opts, depth });
	}

	// 3. OVERLAYS (drawn last so they sit on top visually)
	if (opts.showMinimap ?? true) renderMinimap(ctx, player, map);
	if (opts.showHUD) renderHUD(ctx, world, opts.fps);

	// Optional frame profile log (concise single object)
	if (DEBUG_FLAGS.PROFILE_FRAME && timings.length) {
		log.debug("FrameProfile", Object.fromEntries(timings));
	}
}

/*
HOW THIS FILE WORKS (quick tour)
---------------------------------
Goal: Provide a tiny, readable frame assembly function. Each pass is isolated so
we can iterate without turning this into a monolith.

Pipeline:
  raycaster (walls + depth) → entities (billboard squares) → overlays (minimap, HUD)

Depth Buffer:
  The wall pass returns an array where index = screen column, value = distance.
  Entities peek at depth[column] for a cheap occlusion test. Later we can replace with per‑pixel sprite masking or sorted draw lists.

Instrumentation:
  When DEBUG_FLAGS.PROFILE_FRAME = true we wrap each major stage with timeSection and emit a single log line: { ray: ms, entities: ms }.

Extensibility Notes:
  - Add new passes (e.g., particles) between entities and overlays.
  - Replace renderEntities with a sprite system; keep the signature stable.
  - Consider moving overlays to their own orchestrator if they grow.

Why minimal comments above each line? The intent is that this block gives mental
orientation; the in‑line comments explain only the non‑obvious math or decisions.
*/
