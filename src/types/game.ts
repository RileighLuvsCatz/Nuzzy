export interface RouteDef {
  id: string;
  name: string;
  catchPool?: string[];
  notes?: string;
  subsection?: string;
}

export interface BossPokemon {
  species: string;
  types: string[];
  moves: string[];
  item: string | null;
  level?: string;
  ability?: string;
  abilities?: string[];
  /** Condition from the source pack; validated by content checks. */
  starter?: string;
}

export interface BossDef {
  id: string;
  name: string;
  location?: string;
  rematch?: boolean;
  specialty?: string;
  doubleBattle?: boolean;
  effect?: string;
  notes?: string;
  category?: string;
  team: BossPokemon[];
}

export type ProgressionSegment =
  { kind: "route"; routeId: string } | { kind: "boss"; bossId: string };

export interface GamePack {
  routes: RouteDef[];
  bosses: BossDef[];
  progression: ProgressionSegment[];
}
