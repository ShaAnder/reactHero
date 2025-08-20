import { useMemo } from "react";
import { getCameraPlane } from "../../helpers/getCameraPlane";
import { FOV_ANGLE } from "../../../gameConfig";

/**
 * useCamera
 * Tiny helper: given playerAngle (+ aspect ratio) figure out the camera plane.
 * Pure + memo'd so we don't spam downstream effects.
 */
export function useCamera(playerAngle, aspectRatio = 1) {
	return useMemo(() => {
		const { planeX, planeY } = getCameraPlane(
			playerAngle,
			FOV_ANGLE,
			aspectRatio
		);
		return { planeX, planeY };
	}, [playerAngle, aspectRatio]);
}

/*
HOW THIS HOOK WORKS

Memo so the plane object identity only changes when angle/aspect do.

Inputs: angle (radians), aspectRatio (w/h). Output: { planeX, planeY }.
*/
