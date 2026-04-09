import { getGamePack, EMERALD_GAME_ID } from "../data/games";
import type { Encounter, Run, Status } from "../types";

const LEGACY_KEY = "nuzzy_run";
const LIBRARY_KEY = "nuzzy_run_library";

interface RunLibrary {
  schemaVersion: 2;
  runs: Run[];
  activeRunId: string | null;
}

function routeNameToIdMap(gameId: string): Map<string, string> {
  const pack = getGamePack(gameId);
  if (!pack) return new Map();
  return new Map(pack.routes.map((r) => [r.name, r.id]));
}

function isStatus(x: unknown): x is Status {
  return x === "Team" || x === "Dead" || x === "Boxed";
}

function migrateStatus(x: unknown): Status {
  if (x === "Alive") return "Team";
  if (isStatus(x)) return x;
  return "Team";
}

function normalizeEncounter(
  e: unknown,
  nameToId: Map<string, string>,
): Encounter | null {
  if (!e || typeof e !== "object") return null;
  const obj = e as Record<string, unknown>;
  const id = typeof obj.id === "string" ? obj.id : crypto.randomUUID();
  const pokemon = typeof obj.pokemon === "string" ? obj.pokemon : "";
  if (!pokemon) return null;
  const nickname =
    typeof obj.nickname === "string" && obj.nickname.trim()
      ? obj.nickname.trim()
      : pokemon;
  const status = migrateStatus(obj.status);
  let routeId = typeof obj.routeId === "string" ? obj.routeId : "";
  if (!routeId && typeof obj.location === "string") {
    routeId = nameToId.get(obj.location) ?? "";
  }
  if (!routeId && typeof obj.route === "string") {
    routeId = nameToId.get(obj.route) ?? "";
  }
  if (!routeId) return null;
  return { id, routeId, pokemon, nickname, status };
}

function parseRunRecord(data: Record<string, unknown>): Run | null {
  const schemaVersion =
    typeof data.schemaVersion === "number" ? data.schemaVersion : 0;

  const id = typeof data.id === "string" ? data.id : crypto.randomUUID();
  const name = typeof data.name === "string" ? data.name : "Run";
  const gameId =
    typeof data.gameId === "string" ? data.gameId : EMERALD_GAME_ID;
  const gameTitle =
    typeof data.gameTitle === "string"
      ? data.gameTitle
      : typeof data.game === "string"
        ? (data.game as string)
        : undefined;
  const createdAt =
    typeof data.createdAt === "string"
      ? data.createdAt
      : new Date().toISOString();

  if (schemaVersion >= 1 && (!data.id || !data.name || !data.gameId || !data.createdAt)) {
    return null;
  }

  const nameToId = routeNameToIdMap(gameId);
  const encRaw = data.encounters;
  const encounters: Encounter[] = [];
  if (Array.isArray(encRaw)) {
    for (const item of encRaw) {
      const enc = normalizeEncounter(item, nameToId);
      if (enc) encounters.push(enc);
    }
  }

  return { id, name, gameId, gameTitle, createdAt, encounters, schemaVersion: 1 };
}

function loadLibraryRaw(): RunLibrary | null {
  const raw = localStorage.getItem(LIBRARY_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const obj = data as Record<string, unknown>;
    if (obj.schemaVersion !== 2) return null;
    if (!Array.isArray(obj.runs)) return null;

    const runs: Run[] = [];
    for (const r of obj.runs) {
      if (r && typeof r === "object") {
        const parsed = parseRunRecord(r as Record<string, unknown>);
        if (parsed) runs.push(parsed);
      }
    }
    const activeRunId =
      typeof obj.activeRunId === "string" ? obj.activeRunId : null;
    return { schemaVersion: 2, runs, activeRunId };
  } catch {
    return null;
  }
}

function migrateLegacy(): RunLibrary | null {
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const run = parseRunRecord(data as Record<string, unknown>);
    if (!run) return null;
    const lib: RunLibrary = {
      schemaVersion: 2,
      runs: [run],
      activeRunId: run.id,
    };
    persistLibrary(lib);
    localStorage.removeItem(LEGACY_KEY);
    return lib;
  } catch {
    return null;
  }
}

function persistLibrary(lib: RunLibrary): void {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib));
}

function getLibrary(): RunLibrary {
  return loadLibraryRaw() ?? migrateLegacy() ?? { schemaVersion: 2, runs: [], activeRunId: null };
}

// ---- Public API ----

export function listRuns(): Run[] {
  return getLibrary().runs;
}

export function loadActiveRun(): Run | null {
  const lib = getLibrary();
  if (!lib.activeRunId) return null;
  return lib.runs.find((r) => r.id === lib.activeRunId) ?? null;
}

export function setActiveRun(id: string): void {
  const lib = getLibrary();
  if (!lib.runs.some((r) => r.id === id)) return;
  lib.activeRunId = id;
  persistLibrary(lib);
}

export function saveRun(run: Run): void {
  const lib = getLibrary();
  const idx = lib.runs.findIndex((r) => r.id === run.id);
  if (idx >= 0) {
    lib.runs[idx] = run;
  } else {
    lib.runs.push(run);
  }
  lib.activeRunId = run.id;
  persistLibrary(lib);
}

export function deleteRun(id: string): void {
  const lib = getLibrary();
  lib.runs = lib.runs.filter((r) => r.id !== id);
  if (lib.activeRunId === id) {
    lib.activeRunId = lib.runs[0]?.id ?? null;
  }
  persistLibrary(lib);
}

export function createRun(params: {
  name: string;
  gameId: string;
  gameTitle?: string;
}): Run {
  return {
    id: crypto.randomUUID(),
    name: params.name.trim(),
    gameId: params.gameId,
    gameTitle: params.gameTitle,
    createdAt: new Date().toISOString(),
    encounters: [],
    schemaVersion: 1,
  };
}
