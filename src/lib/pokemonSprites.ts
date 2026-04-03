const STORAGE_KEY = "nuzzy:poke-sprites:v1";

const memoryCache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

export function speciesToSlug(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[.']/g, "")
    .replace(/\s+/g, "-")
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m");
}

function loadStorageCache(): Record<string, string | null> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistToStorage(slug: string, url: string | null) {
  try {
    const existing = loadStorageCache();
    existing[slug] = url;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    /* quota exceeded or unavailable — fine, memory cache still works */
  }
}

function hydrateFromStorage() {
  const stored = loadStorageCache();
  for (const [slug, url] of Object.entries(stored)) {
    if (!memoryCache.has(slug)) {
      memoryCache.set(slug, url);
    }
  }
}

hydrateFromStorage();

async function fetchSprite(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    return (data.sprites?.front_default as string) ?? null;
  } catch {
    return null;
  }
}

export async function getSpriteUrl(
  displayName: string,
): Promise<string | null> {
  const slug = speciesToSlug(displayName);

  if (memoryCache.has(slug)) return memoryCache.get(slug)!;

  const existing = inflight.get(slug);
  if (existing) return existing;

  const promise = fetchSprite(slug).then((url) => {
    memoryCache.set(slug, url);
    persistToStorage(slug, url);
    inflight.delete(slug);
    return url;
  });

  inflight.set(slug, promise);
  return promise;
}
