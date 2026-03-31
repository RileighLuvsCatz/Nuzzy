import type { GamePack } from "../../types/game";
import seaglassBosses from "./emerald-seaglass/bosses.json";
import { progression as seaglassProgression } from "./emerald-seaglass/progression";
import seaglassRoutes from "./emerald-seaglass/routes.json";

export const EMERALD_SEAGLASS_GAME_ID = "emerald-seaglass" as const;

const emeraldSeaglassPack = {
  routes: seaglassRoutes,
  bosses: seaglassBosses,
  progression: seaglassProgression,
} satisfies GamePack;

export const GAME_REGISTRY: Record<string, GamePack> = {
  [EMERALD_SEAGLASS_GAME_ID]: emeraldSeaglassPack,
};

export function getGamePack(gameId: string): GamePack | undefined {
  return GAME_REGISTRY[gameId];
}

/** Options for New Run and any game selector; keep in sync with `GAME_REGISTRY`. */
export const GAME_OPTIONS: readonly {
  id: string;
  title: string;
}[] = [
  { id: EMERALD_SEAGLASS_GAME_ID, title: "Pokémon Emerald Seaglass" },
] as const;
