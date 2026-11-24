const STORAGE_KEY = "nuzzy:poke-sprites:v2";
const LEGACY_STORAGE_KEY = "nuzzy:poke-sprites:v1";

const memoryCache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

// Names present in the game packs whose punctuation differs from PokéAPI.
const SLUG_OVERRIDES = new Map<string, string>([
  ["farfetch'd", "farfetchd"],
  ["mr. mime", "mr-mime"],
  ["mime jr.", "mime-jr"],
  ["nidoran♀", "nidoran-f"],
  ["nidoran♂", "nidoran-m"],
  ["ho-oh", "ho-oh"],
]);

export function speciesToSlug(displayName: string): string {
  const name = displayName.trim().toLowerCase().replace(/’/g, "'");
  return SLUG_OVERRIDES.get(name) ?? name
    .replace(/[.']/g, "")
    .replace(/\s+/g, "-")
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m");
}

function loadStorageCache(key: string): Record<string, string | null> {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, url]) =>
      (key === STORAGE_KEY && url === null) ||
      (typeof url === "string" && url.trim().length > 0),
    ));
  } catch {
    return {};
  }
}

function persistToStorage(slug: string, url: string | null) {
  try {
    const existing = loadStorageCache(STORAGE_KEY);
    existing[slug] = url;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    /* quota exceeded or unavailable — fine, memory cache still works */
  }
}

// Reuse old successes, but not v1 nulls: they may represent temporary outages.
for (const [slug, url] of Object.entries({
  ...loadStorageCache(LEGACY_STORAGE_KEY),
  ...loadStorageCache(STORAGE_KEY),
})) {
  memoryCache.set(slug, url);
}

type SpriteResult =
  | { status: "resolved"; url: string | null }
  | { status: "temporary-error" };

async function fetchSprite(slug: string): Promise<SpriteResult> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`);
    if (res.status === 404) return { status: "resolved", url: null };
    if (!res.ok) return { status: "temporary-error" };
    const data = await res.json();
    const url: unknown = data?.sprites?.front_default;
    if (url === null || (typeof url === "string" && url.trim().length > 0)) {
      return { status: "resolved", url };
    }
    return { status: "temporary-error" };
  } catch {
    return { status: "temporary-error" };
  }
}

export async function getSpriteUrl(
  displayName: string,
): Promise<string | null> {
  const slug = speciesToSlug(displayName);

  if (memoryCache.has(slug)) return memoryCache.get(slug)!;

  const existing = inflight.get(slug);
  if (existing) return existing;

  const promise = fetchSprite(slug).then((result) => {
    if (result.status === "resolved") {
      memoryCache.set(slug, result.url);
      persistToStorage(slug, result.url);
      return result.url;
    }
    // A later lookup (including a component remount) can retry temporary errors.
    return null;
  }).finally(() => inflight.delete(slug));

  inflight.set(slug, promise);
  return promise;
}
