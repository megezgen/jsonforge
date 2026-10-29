export type SampleSize = "small" | "medium" | "large";

const SMALL = {
  id: 1,
  name: "JSON Forge",
  private: true,
  tags: ["json", "formatter", "viewer"],
  author: { name: "Ada", email: "ada@example.com", active: true },
  stats: { stars: 1280, ratio: 0.87, archived: null },
};

const FIRST = ["Ada", "Linus", "Grace", "Alan", "Margaret", "Dennis", "Barbara", "Ken", "Radia", "Tim"];
const LAST = ["Lovelace", "Torvalds", "Hopper", "Turing", "Hamilton", "Ritchie", "Liskov", "Thompson", "Perlman", "Berners-Lee"];
const CITIES = ["London", "Berlin", "Istanbul", "Tokyo", "Toronto", "Lisbon", "Austin", "Seoul"];
const TAGS = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta"];

function record(i: number) {
  const first = FIRST[i % FIRST.length]!;
  const last = LAST[(i * 7) % LAST.length]!;
  return {
    id: i,
    uuid: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
    name: `${first} ${last}`,
    email: `${first}.${last}${i}@example.com`.toLowerCase(),
    active: i % 3 !== 0,
    balance: Math.round((((i * 9301 + 49297) % 233280) / 233280) * 1e6) / 100,
    address: { city: CITIES[i % CITIES.length], zip: String(10000 + (i % 89999)), geo: { lat: (i % 180) - 90 + 0.5, lng: (i % 360) - 180 + 0.25 } },
    tags: [TAGS[i % TAGS.length], TAGS[(i + 2) % TAGS.length]],
    manager: i % 5 === 0 ? null : i - 1,
  };
}

function generate(count: number): string {
  // Built in chunks to avoid a single huge intermediate array on the main thread.
  const parts: string[] = ['{\n  "generatedBy": "JSON Forge",\n  "count": ' + count + ',\n  "records": [\n'];
  const CHUNK = 2000;
  for (let start = 0; start < count; start += CHUNK) {
    const slice: string[] = [];
    for (let i = start; i < Math.min(count, start + CHUNK); i++) {
      slice.push(JSON.stringify(record(i), null, 2).replace(/^/gm, "    "));
    }
    parts.push(slice.join(",\n") + (start + CHUNK < count ? ",\n" : "\n"));
  }
  parts.push("  ]\n}\n");
  return parts.join("");
}

export function buildSample(size: SampleSize): string {
  if (size === "small") return JSON.stringify(SMALL, null, 2);
  if (size === "medium") return generate(500);
  return generate(60_000); // roughly 20 MB pretty printed
}
