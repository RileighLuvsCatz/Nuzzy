import data from "../data/species.json";

interface SpeciesRecord {
  name: string;
  id: number;
  types: string[];
  evolutions: string[];
}
const catalog: Record<string, SpeciesRecord> = data;
const normalize = (name: string) =>
  name
    .toLowerCase()
    .replace(/[.']/g, "")
    .replace(/\s+/g, "-")
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m");
export function speciesReference(name: string) {
  return (
    catalog[normalize(name)] ??
    Object.values(catalog).find(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    )
  );
}
export function availableEvolutions(name: string, gameId: string) {
  return (speciesReference(name)?.evolutions ?? []).filter(
    (e) =>
      (speciesReference(e)?.id ?? Infinity) <=
      (gameId === "emerald" ? 386 : 493),
  );
}
export function catalogNames(gameId: string) {
  return Object.values(catalog)
    .filter((s) => s.id <= (gameId === "emerald" ? 386 : 493))
    .map((s) => s.name);
}
