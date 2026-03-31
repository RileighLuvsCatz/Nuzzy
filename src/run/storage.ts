import seaglassRoutes from "../data/games/emerald-seaglass/routes.json";
import { EMERALD_SEAGLASS_GAME_ID } from "../data/games";
import type { Encounter, Run, Status } from "../types";

const STORAGE_KEY = "nuzzy_run";

const ROUTE_NAME_TO_ID = new Map(
  seaglassRoutes.map((r) => [r.name, r.id] as const),
);

function isStatus(x: unknown): x is Status {
  return x === "Alive" || x === "Dead" || x === "Boxed";
}

function normalizeEncounter(
  e: unknown,
  routeNameToId: Map<string, string>,
): Encounter | null {
  if (!e || typeof e !== "object") return null;
  const obj = e as Record<string, unknown>;
  const id = typeof obj.id === "string" ? obj.id : crypto.randomUUID();
  const pokemon =
    typeof obj.pokemon === "string" ? obj.pokemon : "";
  if (!pokemon) return null;
  const nickname =
    typeof obj.nickname === "string" && obj.nickname.trim()
      ? obj.nickname.trim()
      : pokemon;
  const status = isStatus(obj.status) ? obj.status : "Alive";
  let routeId = typeof obj.routeId === "string" ? obj.routeId : "";
  if (!routeId && typeof obj.location === "string") {
    routeId = routeNameToId.get(obj.location) ?? "";
  }
  if (!routeId && typeof obj.route === "string") {
    routeId = routeNameToId.get(obj.route) ?? "";
  }
  if (!routeId) return null;
  return { id, routeId, pokemon, nickname, status };
}

function migrateToV1(data: Record<string, unknown>): Run | null {
  const id = typeof data.id === "string" ? data.id : crypto.randomUUID();
  const name = typeof data.name === "string" ? data.name : "Run";
  const gameId =
    typeof data.gameId === "string" ? data.gameId : EMERALD_SEAGLASS_GAME_ID;
  const gameTitle =
    typeof data.gameTitle === "string"
      ? data.gameTitle
      : typeof data.game === "string"
        ? data.game
        : undefined;
  const createdAt =
    typeof data.createdAt === "string"
      ? data.createdAt
      : new Date().toISOString();
  const encRaw = data.encounters;
  const encounters: Encounter[] = [];
  if (Array.isArray(encRaw)) {
    for (const item of encRaw) {
      const enc = normalizeEncounter(item, ROUTE_NAME_TO_ID);
      if (enc) encounters.push(enc);
    }
  }
  return {
    id,
    name,
    gameId,
    gameTitle,
    createdAt,
    encounters,
    schemaVersion: 1,
  };
}

function parseRun(data: Record<string, unknown>): Run | null {
  const schemaVersion =
    typeof data.schemaVersion === "number" ? data.schemaVersion : 0;
  if (schemaVersion < 1) {
    return migrateToV1(data);
  }

  const id = typeof data.id === "string" ? data.id : null;
  const name = typeof data.name === "string" ? data.name : null;
  const gameId = typeof data.gameId === "string" ? data.gameId : null;
  const createdAt = typeof data.createdAt === "string" ? data.createdAt : null;
  if (!id || !name || !gameId || !createdAt) return null;

  const encRaw = data.encounters;
  if (!Array.isArray(encRaw)) return null;

  const encounters: Encounter[] = [];
  for (const item of encRaw) {
    const enc = normalizeEncounter(item, ROUTE_NAME_TO_ID);
    if (enc) encounters.push(enc);
  }

  return {
    id,
    name,
    gameId,
    gameTitle:
      typeof data.gameTitle === "string" ? data.gameTitle : undefined,
    createdAt,
    encounters,
    schemaVersion: 1,
  };
}

export function loadRun(): Run | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    return parseRun(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function saveRun(run: Run): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(run));
}

export function clearRun(): void {
  localStorage.removeItem(STORAGE_KEY);
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
