/**
 * Carves a blobby/circular organic clearing at (centerX, centerY) with a given base radius.
 */
export const carveOrganicClearing = (map, centerX, centerY, baseRadius) => {
  const rows = map.length;
  const cols = map[0].length;
  let carved = false;

  for (let y = -baseRadius; y <= baseRadius; y++) {
    for (let x = -baseRadius; x <= baseRadius; x++) {
      const nx = centerX + x;
      const ny = centerY + y;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1) {
        // Distance from center plus jitter for organic edge
        const dist = Math.sqrt(x * x + y * y);
        const edge = baseRadius + (Math.random() - 0.5) * (baseRadius * 0.5); // 0.5 = blobbiness
        if (dist < edge) {
          map[ny][nx] = 0;
          carved = true;
        }
      }
    }
  }
  return carved ? [centerY, centerX] : null;
};

/*
How this function works:

This function carves out a blobby, natural-looking clearing in the map by filling in a circle-ish region around a center point. Unlike perfect geometric circles, it adds random variation ("blobbiness") to the edges so each clearing feels a little different and more organic.

For every tile within a square bounding box around the center:
1. It calculates the distance from that tile to the center.
2. It adds a bit of randomness to the radius, making some tiles near the edge included or excluded.
3. If the tile is within the jittered radius, it’s set to 0 (walkable floor).

Safety:
- It avoids carving on the very edges of the map to prevent out-of-bounds errors.
- Returns the center coordinates if any tile was carved, or `null` if nothing was carved.

Math summary:
- Radius jitter = baseRadius ± ~25% random fudge factor.
- Carving area = roughly a circle, but with noisy edges.
- Result: a walkable patch that looks like a rough forest clearing instead of a perfect shape.
*/
