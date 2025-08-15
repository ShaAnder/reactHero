import { useEffect } from "react";

/*
HOW THIS HOOK WORKS
Tiny visual affordance: adds/removes a "blurred" CSS class on the canvas
whenever the external game state matches the provided PAUSED_STATE token.
Keeps DOM side effects isolated from pause logic so styling can evolve
independently (e.g. swap blur for dim, grayscale, etc.).
*/
export function useCanvasBlur(canvas, gameState, PAUSED_STATE) {
	useEffect(() => {
		if (!canvas) return;
		if (gameState === PAUSED_STATE) canvas.classList.add("blurred");
		else canvas.classList.remove("blurred");
	}, [canvas, gameState, PAUSED_STATE]);
}
