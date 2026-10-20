import type { Encounter } from "../../types";
export default function EncounterBadge({
  encounter,
}: {
  encounter: Encounter;
}) {
  const state =
    encounter.outcome === "planned" || encounter.outcome === "missed"
      ? encounter.outcome
      : encounter.status.toLowerCase();
  const label =
    encounter.outcome === "missed"
      ? "Missed"
      : encounter.outcome === "planned"
        ? "Planned"
        : encounter.status === "Team"
          ? "On team"
          : encounter.status === "Boxed"
            ? "In box"
            : "Dead";
  return <span className={`tracker-badge state-${state}`}>{label}</span>;
}
