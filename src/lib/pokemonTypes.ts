import { speciesToSlug } from "./pokemonSprites";

const STORAGE_KEY = "nuzzy:poke-types:v1";

const memoryCache = new Map<string, string[]>();
const inflight = new Map<string, Promise<string[]>>();

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
    if (!memoryCache.has(slug) && Array.isArray(types)) {
      memoryCache.set(slug, types);
    }
  }
}

hydrateFromStorage();

async function fetchTypes(slug: string): Promise<string[]> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
    if (!res.ok) return [];
    const data = await res.json();
    const rawTypes: { type: { name: string } }[] = data.types ?? [];
    return rawTypes.map((t) => titleCase(t.type.name));
  } catch {
    return [];
  }
}

export async function getPokemonTypes(
  displayName: string,
): Promise<string[]> {
  const slug = speciesToSlug(displayName);

  const cached = memoryCache.get(slug);
  if (cached) return cached;

  const existing = inflight.get(slug);
  if (existing) return existing;

  const promise = fetchTypes(slug).then((types) => {
    memoryCache.set(slug, types);
    if (types.length > 0) persistToStorage(slug, types);
    inflight.delete(slug);
    return types;
  });

  inflight.set(slug, promise);
  return promise;
}

export function getCachedPokemonTypes(
  displayName: string,
): string[] | undefined {
  return memoryCache.get(speciesToSlug(displayName));
}
