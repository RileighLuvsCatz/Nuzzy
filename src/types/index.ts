export type Status = "Alive" | "Dead" | "Boxed";

export interface Encounter {
  id: string;
  routeId: string;
  pokemon: string;
  nickname: string;
  status: Status;
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
}

export * from "./game";
