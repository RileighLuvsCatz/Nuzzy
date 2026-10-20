import type { BossDef, BossPokemon } from "../types/game";
import type { StarterType } from "../types";

export function bossTeam(boss: BossDef, starter?: StarterType): BossPokemon[] {
  return boss.team.filter(
    (member) => !member.starter || member.starter === starter,
  );
}
export function bossLevelCap(team: BossPokemon[]) {
  const levels = team
    .map((p) => p.level)
    .filter((value): value is string => !!value);
  if (
    !levels.length ||
    levels.length !== team.length ||
    levels.some((level) => !/^\d+$/.test(level))
  )
    return undefined;
  return Math.max(...levels.map(Number));
}
