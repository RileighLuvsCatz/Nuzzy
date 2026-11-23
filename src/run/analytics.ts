import type { Encounter } from "../types";

/** Snapshot metrics only: encounters contain no catch or status history. */
export function summarizeEncounters(encounters: readonly Encounter[]) {
  const speciesCounts = new Map<string, number>();
  let deaths = 0;
  for (const encounter of encounters) {
    if (encounter.status === "Dead") deaths += 1;
    const species = encounter.pokemon.trim();
    speciesCounts.set(species, (speciesCounts.get(species) ?? 0) + 1);
  }
  let mostCaughtCount = 0;
  for (const count of speciesCounts.values()) mostCaughtCount = Math.max(mostCaughtCount, count);
  const mostCaughtSpecies = [...speciesCounts]
    .filter(([, count]) => count === mostCaughtCount)
    .map(([species]) => species)
    .sort((a, b) => a.localeCompare(b));
  return {
    total: encounters.length,
    deaths,
    deathRate: encounters.length === 0 ? null : deaths / encounters.length,
    mostCaughtCount,
    mostCaughtSpecies,
  };
}
