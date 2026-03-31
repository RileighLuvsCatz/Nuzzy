export interface RouteDef {
  id: string;
  name: string;
  notes?: string;
  subsection?: string;
}

export interface BossPokemon {
  species: string;
  types: string[];
  moves: string[];
  item: string | null;
}

export interface BossDef {
  id: string;
  name: string;
  location?: string;
  rematch?: boolean;
  team: BossPokemon[];
}

export type ProgressionSegment =
  | { kind: "route"; routeId: string }
  | { kind: "boss"; bossId: string };

export interface GamePack {
  routes: RouteDef[];
  bosses: BossDef[];
  progression: ProgressionSegment[];
}
