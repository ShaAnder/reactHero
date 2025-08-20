// WorldRenderer (single frame draw entry)
// Light wrapper that calls teh individual passes in order
// Future: add sprites / particles / hud / dev overlays

import { renderRaycaster } from "../renderer";
import { renderMinimap } from "./miniMapRenderer";

// empty entities func for later
// placeholder; parameters intentionally unused for now
// eslint-disable-next-line no-unused-vars
function renderEntities(_ctx, _world, _opts) {}

export function renderWorld(ctx, world, opts = {}) {
	if (!ctx || !world) return; // early return guard

	const { player, map } = world;

	// 1. main 3d walls
	renderRaycaster(ctx, player, map);

	// 2. entities (enemies, sprites ect) (placeholder currently)
	renderEntities(ctx, world, opts);

	// 3. minimap (can make conditional (eg it's an item we need to find) later)
	// 3. minimap (defaults to on unless explicitly false)
	if (opts.showMinimap ?? true) renderMinimap(ctx, player, map);
}
