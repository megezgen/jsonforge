/** Measured with scripts/benchmark.mjs. Update these numbers whenever the script is run again. */
export const BENCHMARK = {
  date: "30 October 2026",
  machine: "AMD Ryzen 5 7500F (6 cores, 12 threads), 32 GB RAM, Windows 11",
  browser: "Google Chrome (stable)",
  runs: 3,
  rows: [
    { mb: 1, validMs: 129, treeMs: 136, longestTaskMs: 64 },
    { mb: 5, validMs: 496, treeMs: 499, longestTaskMs: 311 },
    { mb: 10, validMs: 939, treeMs: 942, longestTaskMs: 597 },
    { mb: 25, validMs: 2309, treeMs: 2313, longestTaskMs: 1502 },
  ],
} as const;
