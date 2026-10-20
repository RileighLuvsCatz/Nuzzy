export type Status = "Team" | "Boxed" | "Dead";

export type EncounterOutcome = "planned" | "caught" | "missed";
export type StarterType = "grass" | "fire" | "water";

export interface Encounter {
  id: string;
  routeId: string;
  pokemon: string;
  nickname: string;
  status: Status;
  outcome?: EncounterOutcome;
  caughtAs?: string;
}

export interface Run {
  id: string;
  name: string;
  /** Registry / pack lookup key (stable slug). */
  gameId: string;
  /** Optional display title independent of `gameId`. */
  gameTitle?: string;
  createdAt: string;
  encounters: Encounter[];
  schemaVersion: number;
  starterType?: StarterType;
  defeatedBosses?: Record<string, string>;
}

export * from "./game";
