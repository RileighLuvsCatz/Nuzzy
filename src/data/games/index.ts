import type { GamePack } from "../../types/game";
import emeraldBosses from "./emerald/bosses.json";
import { progression as emeraldProgression } from "./emerald/progression";
import emeraldRoutes from "./emerald/routes.json";
import seaglassBosses from "./emerald-seaglass/bosses.json";
import { progression as seaglassProgression } from "./emerald-seaglass/progression";
import seaglassRoutes from "./emerald-seaglass/routes.json";
import diamondBosses from "./diamond/bosses.json";
import { progression as diamondProgression } from "./diamond/progression";
import diamondRoutes from "./diamond/routes.json";
import pearlBosses from "./pearl/bosses.json";
import { progression as pearlProgression } from "./pearl/progression";
import pearlRoutes from "./pearl/routes.json";
import platinumBosses from "./platinum/bosses.json";
import { progression as platinumProgression } from "./platinum/progression";
import platinumRoutes from "./platinum/routes.json";
import heartgoldBosses from "./heartgold/bosses.json";
import { progression as heartgoldProgression } from "./heartgold/progression";
import heartgoldRoutes from "./heartgold/routes.json";
import soulsilverBosses from "./soulsilver/bosses.json";
import { progression as soulsilverProgression } from "./soulsilver/progression";
import soulsilverRoutes from "./soulsilver/routes.json";

export const EMERALD_GAME_ID = "emerald" as const;
export const EMERALD_SEAGLASS_GAME_ID = "emerald-seaglass" as const;
export const DIAMOND_GAME_ID = "diamond" as const;
export const PEARL_GAME_ID = "pearl" as const;
export const PLATINUM_GAME_ID = "platinum" as const;
export const HEARTGOLD_GAME_ID = "heartgold" as const;
export const SOULSILVER_GAME_ID = "soulsilver" as const;

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

const diamondPack = {
  routes: diamondRoutes,
  bosses: diamondBosses,
  progression: diamondProgression,
} satisfies GamePack;

const pearlPack = {
  routes: pearlRoutes,
  bosses: pearlBosses,
  progression: pearlProgression,
} satisfies GamePack;

const platinumPack = {
  routes: platinumRoutes,
  bosses: platinumBosses,
  progression: platinumProgression,
} satisfies GamePack;

const heartgoldPack = {
  routes: heartgoldRoutes,
  bosses: heartgoldBosses,
  progression: heartgoldProgression,
} satisfies GamePack;

const soulsilverPack = {
  routes: soulsilverRoutes,
  bosses: soulsilverBosses,
  progression: soulsilverProgression,
} satisfies GamePack;

export const GAME_REGISTRY: Record<string, GamePack> = {
  [EMERALD_GAME_ID]: emeraldPack,
  [EMERALD_SEAGLASS_GAME_ID]: emeraldSeaglassPack,
  [DIAMOND_GAME_ID]: diamondPack,
  [PEARL_GAME_ID]: pearlPack,
  [PLATINUM_GAME_ID]: platinumPack,
  [HEARTGOLD_GAME_ID]: heartgoldPack,
  [SOULSILVER_GAME_ID]: soulsilverPack,
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
  { id: DIAMOND_GAME_ID, title: "Pokémon Diamond" },
  { id: PEARL_GAME_ID, title: "Pokémon Pearl" },
  { id: PLATINUM_GAME_ID, title: "Pokémon Platinum" },
  { id: HEARTGOLD_GAME_ID, title: "Pokémon HeartGold" },
  { id: SOULSILVER_GAME_ID, title: "Pokémon SoulSilver" },
] as const;
