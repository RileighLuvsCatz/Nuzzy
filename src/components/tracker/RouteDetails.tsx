import { useId, useMemo, useState } from "react";
import type { Encounter, EncounterOutcome, Run, Status } from "../../types";
import type { RouteDef } from "../../types/game";
import { isTeamFull } from "../../run/encounters";
import { availableEvolutions, catalogNames } from "../../lib/gameReference";
import PokemonSprite from "../PokemonSprite";
import Icon from "../Icon";
import EncounterBadge from "./EncounterBadge";

function EncounterEditor({
  encounter,
  draftId,
  route,
  gameId,
  teamFull,
  names,
  onChange,
  onEvolve,
}: {
  encounter?: Encounter;
  draftId?: string;
  route: RouteDef;
  gameId: string;
  teamFull: boolean;
  names: string[];
  onChange: (encounter: Encounter) => void;
  onEvolve: (id: string, species: string) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState<Encounter>(
    () =>
      encounter ?? {
        id: draftId ?? crypto.randomUUID(),
        routeId: route.id,
        pokemon: "",
        nickname: "",
        status: "Boxed",
        outcome: "planned",
      },
  );
  const outcome = draft.outcome ?? "caught";
  const evolutions = availableEvolutions(draft.pokemon, gameId);
  function write(patch: Partial<Encounter>) {
    const next = { ...draft, ...patch };
    if (next.outcome !== "caught") next.status = "Boxed";
    if (
      (next.outcome ?? "caught") === "caught" &&
      next.pokemon &&
      !next.caughtAs
    )
      next.caughtAs = next.pokemon;
    setDraft(next);
    if (
      next.pokemon.trim() ||
      (next.outcome !== "caught" && next.nickname.trim()) ||
      next.outcome === "missed"
    )
      onChange(next);
  }
  return (
    <div className="encounter-editor">
      <div className="record-identity">
        <div className="record-sprite">
          <PokemonSprite species={draft.pokemon} size={64} />
        </div>
        <div>
          <h3>
            {draft.nickname ||
              draft.pokemon ||
              (outcome === "missed"
                ? "Missed encounter"
                : "Your next encounter")}
          </h3>
          <p className="muted small">
            {draft.caughtAs && draft.caughtAs !== draft.pokemon
              ? `Caught as ${draft.caughtAs} · `
              : ""}
            {route.name}
          </p>
        </div>
        <EncounterBadge encounter={draft} />
      </div>
      <div className="encounter-fields">
        <label htmlFor={`${id}-species`}>
          Pokémon
          <input
            id={`${id}-species`}
            list={`${id}-suggestions`}
            placeholder="Search or enter a species"
            value={draft.pokemon}
            onChange={(event) =>
              setDraft({ ...draft, pokemon: event.target.value })
            }
            onBlur={(event) => {
              const value = event.target.value.trim();
              const canonical =
                names.find(
                  (name) => name.toLowerCase() === value.toLowerCase(),
                ) ?? value;
              if (canonical) write({ pokemon: canonical });
              else if (outcome === "caught")
                write({ pokemon: encounter?.pokemon ?? draft.caughtAs ?? "" });
              else write({ pokemon: "" });
            }}
          />
        </label>
        <datalist id={`${id}-suggestions`}>
          {[...new Set([...(route.catchPool ?? []), ...names])].map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <label htmlFor={`${id}-nickname`}>
          Nickname <span className="muted">· optional</span>
          <input
            id={`${id}-nickname`}
            placeholder="What do you call them?"
            value={draft.nickname}
            onChange={(event) => write({ nickname: event.target.value })}
          />
        </label>
        <label htmlFor={`${id}-outcome`}>
          Encounter outcome
          <select
            id={`${id}-outcome`}
            value={outcome}
            onChange={(event) =>
              write({ outcome: event.target.value as EncounterOutcome })
            }
          >
            <option value="planned">Planned / not caught yet</option>
            <option value="caught" disabled={!draft.pokemon.trim()}>
              Caught / received
            </option>
            <option value="missed">Missed encounter</option>
          </select>
        </label>
        {outcome === "caught" && (
          <label htmlFor={`${id}-placement`}>
            Pokémon state
            <select
              id={`${id}-placement`}
              value={draft.status}
              onChange={(event) =>
                write({ status: event.target.value as Status })
              }
            >
              <option
                value="Team"
                disabled={teamFull && draft.status !== "Team"}
              >
                On team{teamFull && draft.status !== "Team" ? " (6 / 6)" : ""}
              </option>
              <option value="Boxed">In box</option>
              <option value="Dead">Dead</option>
            </select>
          </label>
        )}
      </div>
      <p className="field-help">
        {route.catchPool?.length
          ? `Route suggestions: ${route.catchPool.join(", ")}. Other species can be entered for custom runs.`
          : "This area has no encounter pool in the current pack. You can still enter a species or record a miss."}
      </p>
      {outcome === "caught" &&
        draft.status !== "Dead" &&
        evolutions.length > 0 && (
          <div className="evolution-actions">
            <span className="eyebrow">EVOLUTION</span>
            {evolutions.map((species) => (
              <button
                type="button"
                className="button quiet"
                key={species}
                onClick={() => {
                  onEvolve(draft.id, species);
                  setDraft({
                    ...draft,
                    pokemon: species,
                    caughtAs: draft.caughtAs ?? draft.pokemon,
                  });
                }}
              >
                <Icon name="spark" size={15} />
                Evolve to {species}
              </button>
            ))}
          </div>
        )}
    </div>
  );
}
export default function RouteDetails({
  route,
  run,
  onChange,
  onEvolve,
}: {
  route: RouteDef;
  run: Run;
  onChange: (encounter: Encounter) => void;
  onEvolve: (id: string, species: string) => void;
}) {
  const encounters = run.encounters.filter(
    (encounter) => encounter.routeId === route.id,
  );
  const [newRecord, setNewRecord] = useState<string | null>(() =>
    encounters.length ? null : crypto.randomUUID(),
  );
  const names = useMemo(() => catalogNames(run.gameId), [run.gameId]);
  return (
    <>
      <p className="focus-intro">
        Pick a Pokémon, record the outcome, and choose where they belong.
        Changes save automatically; opening this panel does not create a catch.
      </p>
      {route.notes && <p className="reference-note">{route.notes}</p>}
      {[
        ...encounters.map((encounter) => encounter.id),
        ...(newRecord &&
        !encounters.some((encounter) => encounter.id === newRecord)
          ? [newRecord]
          : []),
      ].map((recordId) => (
        <EncounterEditor
          key={recordId}
          draftId={recordId}
          encounter={encounters.find((encounter) => encounter.id === recordId)}
          route={route}
          gameId={run.gameId}
          names={names}
          teamFull={isTeamFull(run.encounters)}
          onChange={onChange}
          onEvolve={onEvolve}
        />
      ))}
      {(!newRecord ||
        encounters.some((encounter) => encounter.id === newRecord)) && (
        <button
          type="button"
          className="button quiet add-record"
          onClick={() => setNewRecord(crypto.randomUUID())}
        >
          <Icon name="plus" size={16} />
          Add another encounter
        </button>
      )}
      <p className="field-help">
        Plans and missed encounters stay in your journal. Only caught Pokémon
        appear in the team, box, or graveyard. State changes can be corrected
        here.
      </p>
    </>
  );
}
