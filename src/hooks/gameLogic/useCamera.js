import { useMemo } from "react";
import { getCameraPlane } from "../../helpers/getCameraPlane";
import { FOV_ANGLE } from "../../../gameConfig";
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

Pure memo wrapper so downstream renderers (raycaster / minimap) get stable
plane object identity unless inputs truly change. Avoids accidental extra
work in effects depending on plane.

Inputs
playerAngle: direction the player faces (radians)
aspectRatio: width / height of canvas (stabilizes horizontal FOV)

Output
{ planeX, planeY } sideways basis vector perpendicular to forward.
*/
