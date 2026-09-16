export type HistogramBin = {
  index: number;
  start: number;
  end: number;
  count: number;
  proportion: number;
};

export type Histogram = {
  bins: HistogramBin[];
  edges: number[];
  total: number;
};

/**
 * Equal-width histogram over [min, max] with `binCount` bins.
 * Values outside edges clamp into first/last bin.
 */
export function buildHistogram(
  values: number[],
  binCount: number,
  min?: number,
  max?: number,
): Histogram {
  if (binCount < 1) throw new Error("buildHistogram: binCount must be >= 1");
  if (values.length === 0) {
    const lo = min ?? 0;
    const hi = max ?? 1;
    const width = (hi - lo) / binCount || 1;
    const edges = Array.from({ length: binCount + 1 }, (_, i) => lo + i * width);
    return {
      total: 0,
      edges,
      bins: Array.from({ length: binCount }, (_, index) => ({
        index,
        start: edges[index],
        end: edges[index + 1],
        count: 0,
        proportion: 0,
      })),
    };
  }

  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  const span = hi - lo || 1;
  const width = span / binCount;
  const edges = Array.from({ length: binCount + 1 }, (_, i) => lo + i * width);
  const counts = Array.from({ length: binCount }, () => 0);

  for (const value of values) {
    let idx = Math.floor((value - lo) / width);
    if (idx < 0) idx = 0;
    if (idx >= binCount) idx = binCount - 1;
    counts[idx] += 1;
  }

  const total = values.length;
  const bins: HistogramBin[] = counts.map((count, index) => ({
    index,
    start: edges[index],
    end: edges[index + 1],
    count,
    proportion: count / total,
  }));

  return { bins, edges, total };
}

/** Align current values onto reference histogram edges (same binning contract). */
export function histogramWithEdges(values: number[], edges: number[]): Histogram {
  if (edges.length < 2) throw new Error("histogramWithEdges: need at least 2 edges");
  const binCount = edges.length - 1;
  const counts = Array.from({ length: binCount }, () => 0);
  for (const value of values) {
    // Clamps both ways, like buildHistogram. The search is "first bin this
    // value falls under", so anything below edges[0] lands in bin 0 rather
    // than falling through to the top bin — which would read as drift in the
    // opposite direction to reality.
    let idx = binCount - 1;
    for (let i = 0; i < binCount; i += 1) {
      if (value < edges[i + 1]) {
        idx = i;
        break;
      }
    }
    counts[idx] += 1;
  }
  const total = values.length;
  return {
    total,
    edges: [...edges],
    bins: counts.map((count, index) => ({
      index,
      start: edges[index],
      end: edges[index + 1],
      count,
      proportion: total === 0 ? 0 : count / total,
    })),
  };
}
