// hudRenderer.js
// Draws a simple diagnostic HUD (level, time, fps, generation stats)
// Called after 3D + minimap so it overlays cleanly.
import { HUD_TEXT_RGBA } from "../../constants/colors";

export function renderHUD(ctx, world, fps) {
	if (!ctx || !world) return;
	const { level, time = 0, meta } = world;
	ctx.save();
	ctx.font = "12px monospace";
	ctx.textBaseline = "top";
	ctx.fillStyle = HUD_TEXT_RGBA;
	let y = 6;
	ctx.fillText(
		`L${level ?? "?"}  t:${time.toFixed(1)}s  fps:${fps ?? "?"} `,
		6,
		y
	);
	if (meta) {
		y += 14;
		ctx.fillText(
			`seed:${meta.seed ?? "—"} rooms:${meta.rooms ?? "—"} att:${
				meta.attempts ?? "—"
			}`,
			6,
			y
		);
	}
	ctx.restore();
}
