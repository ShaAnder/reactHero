import { useMemo } from "react";
import { getCameraPlane } from "../../helpers/getCameraPlane";
import { FOV_ANGLE } from "../../../gameConfig";

/*
HOW THIS HOOK WORKS
Light memoized wrapper around getCameraPlane. Recomputes the perpendicular
camera plane vector only when the player angle or aspect ratio changes so
raycasting code receives stable references between frames.
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
