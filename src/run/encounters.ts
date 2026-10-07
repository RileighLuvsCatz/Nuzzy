import type { Encounter, Run, Status } from "../types";

export const TEAM_LIMIT = 6;
export const TEAM_FULL_MESSAGE =
  "Team has six or more Pokémon. Move a Team member to the Box or mark it Dead to free a slot.";

export function isTeamFull(encounters: Encounter[]): boolean {
  return encounters.filter((encounter) => encounter.status === "Team").length >= TEAM_LIMIT;
}

export function addEncounter(run: Run, encounter: Encounter): Run {
  if (encounter.status === "Team" && isTeamFull(run.encounters)) return run;
  return { ...run, encounters: [...run.encounters, encounter] };
}

export function changeEncounterStatus(
  run: Run,
  encounterId: string,
  status: Status,
): Run {
  const encounter = run.encounters.find((item) => item.id === encounterId);
  if (!encounter || encounter.status === status) return run;
  if (status === "Team" && isTeamFull(run.encounters)) return run;
  return {
    ...run,
    encounters: run.encounters.map((item) =>
      item.id === encounterId ? { ...item, status } : item,
    ),
  };
}
