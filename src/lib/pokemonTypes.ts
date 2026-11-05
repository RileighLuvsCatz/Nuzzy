import { speciesToSlug } from "./pokemonSprites.ts";

const STORAGE_KEY = "nuzzy:poke-types:v1";

export type PokemonTypeResult =
  | { status: "resolved"; types: string[] }
  | { status: "unavailable" };

const memoryCache = new Map<string, string[]>();
const inflight = new Map<string, Promise<PokemonTypeResult>>();

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function loadStorageCache(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistToStorage(slug: string, types: string[]) {
  try {
    const existing = loadStorageCache();
    existing[slug] = types;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    /* quota exceeded — memory cache still works */
  }
}

function hydrateFromStorage() {
  const stored = loadStorageCache();
  for (const [slug, types] of Object.entries(stored)) {
    if (
      !memoryCache.has(slug) && Array.isArray(types) && types.length > 0 &&
      types.every((type) => typeof type === "string" && type.length > 0)
    ) {
      memoryCache.set(slug, types);
    }
  }
}

hydrateFromStorage();

async function fetchTypes(slug: string): Promise<PokemonTypeResult> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
    if (!res.ok) return { status: "unavailable" };
    const data = await res.json();
    const rawTypes: { type: { name: string } }[] = data.types ?? [];
    const types = rawTypes.map((t) => titleCase(t.type.name));
    return types.length > 0
      ? { status: "resolved", types }
      : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

export async function getPokemonTypes(
  displayName: string,
): Promise<PokemonTypeResult> {
  const slug = speciesToSlug(displayName);

  const cached = memoryCache.get(slug);
  if (cached) return { status: "resolved", types: cached };

  const existing = inflight.get(slug);
  if (existing) return existing;

  const promise = fetchTypes(slug).then((result) => {
    if (result.status === "resolved") {
      memoryCache.set(slug, result.types);
      persistToStorage(slug, result.types);
    }
    inflight.delete(slug);
    return result;
  });

  inflight.set(slug, promise);
  return promise;
}

export function getCachedPokemonTypes(
  displayName: string,
): string[] | undefined {
  return memoryCache.get(speciesToSlug(displayName));
}
