import React, { useRef, useEffect } from "react";

// Learning how to do a frameloop thanks to
// https://gist.github.com/balmacefa/3e899642ae96eeb78e76d015d9587397
export const useFrameLoop = (callback) => {
  const requestID = useRef;
  const preeviousTime = useRef();

  const loop = (time) => {
    if (preeviousTime.current !== undefined) {
      const deltaTime = time - preeviousTime.current;
      callback(time, deltaTime);
    }

    preeviousTime.current = time;
    requestID.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestID.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestID.current);
  }, []);
};
