import type { Encounter, Run, Status } from "../types";

export const TEAM_LIMIT = 6;
export const TEAM_FULL_MESSAGE =
  "Team has six or more Pokémon. Move a Team member to the Box or mark it Dead to free a slot.";

export function isTeamFull(encounters: Encounter[]): boolean {
  return (
    encounters.filter(
      (encounter) => encounter.status === "Team" && isCaught(encounter),
    ).length >= TEAM_LIMIT
  );
}

export function addEncounter(run: Run, encounter: Encounter): Run {
  if (
    isCaught(encounter) &&
    encounter.status === "Team" &&
    isTeamFull(run.encounters)
  )
    return run;
  return { ...run, encounters: [...run.encounters, encounter] };
}

export function changeEncounterStatus(
  run: Run,
  encounterId: string,
  status: Status,
): Run {
  const encounter = run.encounters.find((item) => item.id === encounterId);
  if (!encounter || !isCaught(encounter) || encounter.status === status)
    return run;
  if (status === "Team" && isTeamFull(run.encounters)) return run;
  return {
    ...run,
    encounters: run.encounters.map((item) =>
      item.id === encounterId ? { ...item, status } : item,
    ),
  };
}

/** Plans and missed encounters are records, but do not occupy the team or box. */
export function isCaught(encounter: Encounter): boolean {
  return !encounter.outcome || encounter.outcome === "caught";
}

export function upsertEncounter(run: Run, encounter: Encounter): Run {
  if (isCaught(encounter) && !encounter.pokemon.trim()) return run;
  const previous = run.encounters.find((item) => item.id === encounter.id);
  let next = encounter;
  if (!isCaught(next)) next = { ...next, status: "Boxed" };
  if (
    next.status === "Team" &&
    !(previous && isCaught(previous) && previous.status === "Team") &&
    isTeamFull(run.encounters)
  ) {
    next = { ...next, status: "Boxed" };
  }
  return {
    ...run,
    encounters: previous
      ? run.encounters.map((item) => (item.id === next.id ? next : item))
      : [...run.encounters, next],
  };
}

export function evolveEncounter(
  run: Run,
  encounterId: string,
  species: string,
): Run {
  const encounter = run.encounters.find((item) => item.id === encounterId);
  if (
    !encounter ||
    !isCaught(encounter) ||
    encounter.status === "Dead" ||
    !species.trim()
  )
    return run;
  return upsertEncounter(run, {
    ...encounter,
    caughtAs: encounter.caughtAs ?? encounter.pokemon,
    pokemon: species.trim(),
  });
}
