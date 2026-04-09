/**
 * Full Gen VI+ 18-type effectiveness chart and team analysis helpers.
 * Pure module — no React, no fetch.
 */

export const ALL_TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
  "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
  "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy",
] as const;

export type PokemonType = (typeof ALL_TYPES)[number];

/**
 * EFFECTIVENESS[attacking][defending] → multiplier (1 = neutral).
 * 0 = immune, 0.5 = resisted, 2 = super-effective.
 */
const EFFECTIVENESS: Record<PokemonType, Record<PokemonType, number>> = {
  Normal:   { Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Rock: 0.5, Ghost: 0, Dragon: 1, Dark: 1, Steel: 0.5, Fairy: 1 },
  Fire:     { Normal: 1, Fire: 0.5, Water: 0.5, Electric: 1, Grass: 2, Ice: 2, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 2, Rock: 0.5, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 2, Fairy: 1 },
  Water:    { Normal: 1, Fire: 2, Water: 0.5, Electric: 1, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 1, Ground: 2, Flying: 1, Psychic: 1, Bug: 1, Rock: 2, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 1, Fairy: 1 },
  Electric: { Normal: 1, Fire: 1, Water: 2, Electric: 0.5, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 1, Ground: 0, Flying: 2, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 1, Fairy: 1 },
  Grass:    { Normal: 1, Fire: 0.5, Water: 2, Electric: 1, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 0.5, Ground: 2, Flying: 0.5, Psychic: 1, Bug: 0.5, Rock: 2, Ghost: 1, Dragon: 0.5, Dark: 1, Steel: 0.5, Fairy: 1 },
  Ice:      { Normal: 1, Fire: 0.5, Water: 0.5, Electric: 1, Grass: 2, Ice: 0.5, Fighting: 1, Poison: 1, Ground: 2, Flying: 2, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Dragon: 2, Dark: 1, Steel: 0.5, Fairy: 1 },
  Fighting: { Normal: 2, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 2, Fighting: 1, Poison: 0.5, Ground: 1, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dragon: 1, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison:   { Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 2, Ice: 1, Fighting: 1, Poison: 0.5, Ground: 0.5, Flying: 1, Psychic: 1, Bug: 1, Rock: 0.5, Ghost: 0.5, Dragon: 1, Dark: 1, Steel: 0, Fairy: 2 },
  Ground:   { Normal: 1, Fire: 2, Water: 1, Electric: 2, Grass: 0.5, Ice: 1, Fighting: 1, Poison: 2, Ground: 1, Flying: 0, Psychic: 1, Bug: 0.5, Rock: 2, Ghost: 1, Dragon: 1, Dark: 1, Steel: 2, Fairy: 1 },
  Flying:   { Normal: 1, Fire: 1, Water: 1, Electric: 0.5, Grass: 2, Ice: 1, Fighting: 2, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 2, Rock: 0.5, Ghost: 1, Dragon: 1, Dark: 1, Steel: 0.5, Fairy: 1 },
  Psychic:  { Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 2, Poison: 2, Ground: 1, Flying: 1, Psychic: 0.5, Bug: 1, Rock: 1, Ghost: 1, Dragon: 1, Dark: 0, Steel: 0.5, Fairy: 1 },
  Bug:      { Normal: 1, Fire: 0.5, Water: 1, Electric: 1, Grass: 2, Ice: 1, Fighting: 0.5, Poison: 0.5, Ground: 1, Flying: 0.5, Psychic: 2, Bug: 1, Rock: 1, Ghost: 0.5, Dragon: 1, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock:     { Normal: 1, Fire: 2, Water: 1, Electric: 1, Grass: 1, Ice: 2, Fighting: 0.5, Poison: 1, Ground: 0.5, Flying: 2, Psychic: 1, Bug: 2, Rock: 1, Ghost: 1, Dragon: 1, Dark: 1, Steel: 0.5, Fairy: 1 },
  Ghost:    { Normal: 0, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 2, Bug: 1, Rock: 1, Ghost: 2, Dragon: 1, Dark: 0.5, Steel: 1, Fairy: 1 },
  Dragon:   { Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Dragon: 2, Dark: 1, Steel: 0.5, Fairy: 0 },
  Dark:     { Normal: 1, Fire: 1, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 0.5, Poison: 1, Ground: 1, Flying: 1, Psychic: 2, Bug: 1, Rock: 1, Ghost: 2, Dragon: 1, Dark: 0.5, Steel: 0.5, Fairy: 0.5 },
  Steel:    { Normal: 1, Fire: 0.5, Water: 0.5, Electric: 0.5, Grass: 1, Ice: 2, Fighting: 1, Poison: 1, Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Rock: 2, Ghost: 1, Dragon: 1, Dark: 1, Steel: 0.5, Fairy: 2 },
  Fairy:    { Normal: 1, Fire: 0.5, Water: 1, Electric: 1, Grass: 1, Ice: 1, Fighting: 2, Poison: 0.5, Ground: 1, Flying: 1, Psychic: 1, Bug: 1, Rock: 1, Ghost: 1, Dragon: 2, Dark: 2, Steel: 0.5, Fairy: 1 },
};

function isKnownType(t: string): t is PokemonType {
  return (ALL_TYPES as readonly string[]).includes(t);
}

/** Multiplier when `attackingType` hits a defender with `defenderTypes`. */
export function defensiveMultiplier(
  attackingType: PokemonType,
  defenderTypes: string[],
): number {
  let mult = 1;
  for (const dt of defenderTypes) {
    if (isKnownType(dt)) {
      mult *= EFFECTIVENESS[attackingType][dt];
    }
  }
  return mult;
}

export interface TypeMultiplier {
  type: PokemonType;
  multiplier: number;
}

/** Full defensive profile for a single Pokémon (all 18 attack types → multiplier). */
export function defensiveProfile(defenderTypes: string[]): TypeMultiplier[] {
  return ALL_TYPES.map((atk) => ({
    type: atk,
    multiplier: defensiveMultiplier(atk, defenderTypes),
  }));
}

export interface TeamWeakness {
  type: PokemonType;
  /** Indices of team members weak to this type (multiplier >= 2). */
  weakMembers: number[];
  /** Highest multiplier any member takes from this type. */
  maxMultiplier: number;
}

export interface TeamResistance {
  type: PokemonType;
  /** Indices of team members that resist this type (multiplier <= 0.5, incl. immunity). */
  resistMembers: number[];
}

/**
 * Analyse defensive weaknesses across a team.
 * Returns attacking types where at least one member takes >= 2×.
 */
export function teamWeaknesses(
  teamTypes: string[][],
): TeamWeakness[] {
  const results: TeamWeakness[] = [];
  for (const atk of ALL_TYPES) {
    const weakMembers: number[] = [];
    let maxMult = 0;
    for (let i = 0; i < teamTypes.length; i++) {
      const mult = defensiveMultiplier(atk, teamTypes[i]);
      if (mult >= 2) weakMembers.push(i);
      if (mult > maxMult) maxMult = mult;
    }
    if (weakMembers.length > 0) {
      results.push({ type: atk, weakMembers, maxMultiplier: maxMult });
    }
  }
  results.sort((a, b) => b.weakMembers.length - a.weakMembers.length || b.maxMultiplier - a.maxMultiplier);
  return results;
}

/**
 * Analyse defensive resistances across a team.
 * Returns attacking types where at least one member resists (<= 0.5×).
 */
export function teamResistances(
  teamTypes: string[][],
): TeamResistance[] {
  const results: TeamResistance[] = [];
  for (const atk of ALL_TYPES) {
    const resistMembers: number[] = [];
    for (let i = 0; i < teamTypes.length; i++) {
      const mult = defensiveMultiplier(atk, teamTypes[i]);
      if (mult <= 0.5) resistMembers.push(i);
    }
    if (resistMembers.length > 0) {
      results.push({ type: atk, resistMembers });
    }
  }
  results.sort((a, b) => b.resistMembers.length - a.resistMembers.length);
  return results;
}

/**
 * STAB offensive coverage: for each attacking type a team member has,
 * which defending types does it hit super-effectively (>1×)?
 * Returns the union of all covered types.
 */
export function teamOffensiveCoverage(
  teamTypes: string[][],
): PokemonType[] {
  const covered = new Set<PokemonType>();
  for (const memberTypes of teamTypes) {
    for (const stab of memberTypes) {
      if (!isKnownType(stab)) continue;
      for (const def of ALL_TYPES) {
        if (EFFECTIVENESS[stab][def] > 1) covered.add(def);
      }
    }
  }
  return ALL_TYPES.filter((t) => covered.has(t));
}

/**
 * Defending types the team has no super-effective STAB coverage against.
 */
export function teamOffensiveGaps(
  teamTypes: string[][],
): PokemonType[] {
  const covered = new Set(teamOffensiveCoverage(teamTypes));
  return ALL_TYPES.filter((t) => !covered.has(t));
}
