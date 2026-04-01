import type { GamePack } from "../../types/game";
import emeraldBosses from "./emerald/bosses.json";
import { progression as emeraldProgression } from "./emerald/progression";
import emeraldRoutes from "./emerald/routes.json";
import seaglassBosses from "./emerald-seaglass/bosses.json";
import { progression as seaglassProgression } from "./emerald-seaglass/progression";
import seaglassRoutes from "./emerald-seaglass/routes.json";

export const EMERALD_GAME_ID = "emerald" as const;
export const EMERALD_SEAGLASS_GAME_ID = "emerald-seaglass" as const;

const emeraldPack = {
  routes: emeraldRoutes,
  bosses: emeraldBosses,
  progression: emeraldProgression,
} satisfies GamePack;

const emeraldSeaglassPack = {
  routes: seaglassRoutes,
  bosses: seaglassBosses,
  progression: seaglassProgression,
} satisfies GamePack;

export const GAME_REGISTRY: Record<string, GamePack> = {
  [EMERALD_GAME_ID]: emeraldPack,
  [EMERALD_SEAGLASS_GAME_ID]: emeraldSeaglassPack,
};

export function getGamePack(gameId: string): GamePack | undefined {
  return GAME_REGISTRY[gameId];
}

export interface GameOption {
  id: string;
  title: string;
  disabled?: boolean;
}

export const GAME_OPTIONS: readonly GameOption[] = [
  { id: EMERALD_GAME_ID, title: "Pokémon Emerald" },
  { id: EMERALD_SEAGLASS_GAME_ID, title: "Pokémon Emerald Seaglass (Coming soon)", disabled: true },
] as const;
