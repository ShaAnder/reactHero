// Carves a blobby/circular organic clearing at (centerX, centerY)
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
