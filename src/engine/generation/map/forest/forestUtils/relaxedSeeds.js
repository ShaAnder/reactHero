/**
 * Lloyd's relaxation for Voronoi seeds.
 * Moves each seed to the centroid of its Voronoi region, repeated for N iterations.
 */
export const relaxSeeds = (seeds, regionMap, dimensions, iterations = 1) => {
  for (let iter = 0; iter < iterations; iter++) {
    const newSeeds = [];
    for (let i = 0; i < seeds.length; i++) {
      let sumX = 0,
        sumY = 0,
        count = 0;
      for (let y = 0; y < dimensions; y++) {
        for (let x = 0; x < dimensions; x++) {
          if (regionMap[y][x] === i) {
            sumX += x;
            sumY += y;
            count++;
          }
        }
      }
      if (count > 0) {
        newSeeds.push({
          x: Math.round(sumX / count),
          y: Math.round(sumY / count),
        });
      } else {
        newSeeds.push(seeds[i]); // fallback if region is empty
      }
    }
    // Reassign regions to new seeds
    for (let y = 0; y < dimensions; y++) {
      for (let x = 0; x < dimensions; x++) {
        let minDist = Infinity,
          closest = 0;
        for (let i = 0; i < newSeeds.length; i++) {
          const dx = newSeeds[i].x - x;
          const dy = newSeeds[i].y - y;
          const dist = dx * dx + dy * dy;
          if (dist < minDist) {
            minDist = dist;
            closest = i;
          }
        }
        regionMap[y][x] = closest;
      }
    }
    seeds = newSeeds;
  }
  return seeds;
};

/*
How this function works:

This is an implementation of Lloyd’s relaxation algorithm, which helps smooth out the placement of Voronoi seeds. It improves the natural spacing of regions by shifting each seed toward the centroid (average position) of the tiles assigned to it. 

For each iteration:
1. It calculates the average X and Y of all tiles belonging to a given region (i.e., regionMap[y][x] === seed index).
2. Each seed is moved to the center of its region (rounded to the nearest whole tile).
3. Then, it reassigns every tile to the closest new seed to update the region map.
4. If a region has no tiles (rare), it keeps the seed in its old position as a fallback.

Math summary:
- Distance is calculated with squared Euclidean distance: dx² + dy².
- Centroids are the rounded average of all tile coordinates in a region.
- Each iteration brings the seed closer to the “center of mass” of its region.
- This smoothing step helps make organic clearing layouts less clumpy and more evenly spaced.
*/
