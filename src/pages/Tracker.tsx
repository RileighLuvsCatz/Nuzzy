import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getGamePack } from "../data/games";
import { loadActiveRun, saveRun } from "../run/storage";
import {
  isCaught,
  upsertEncounter,
  evolveEncounter,
} from "../run/encounters";
import { bossLevelCap, bossTeam } from "../lib/bossReference";
import type { BossDef, RouteDef } from "../types/game";
import type { Encounter, Run, StarterType } from "../types";
import PokemonSprite from "../components/PokemonSprite";
import RunHeader from "../components/RunHeader";
import FocusDialog from "../components/FocusDialog";
import Icon from "../components/Icon";
import RouteDetails from "../components/tracker/RouteDetails";
import BossDetails from "../components/tracker/BossDetails";
import EncounterBadge from "../components/tracker/EncounterBadge";

type Stop =
  | { key: string; route: RouteDef; boss?: never }
  | { key: string; boss: BossDef; route?: never };
const STARTERS: Record<string, StarterType> = {
  Treecko: "grass",
  Turtwig: "grass",
  Chikorita: "grass",
  Torchic: "fire",
  Chimchar: "fire",
  Cyndaquil: "fire",
  Mudkip: "water",
  Piplup: "water",
  Totodile: "water",
};
export default function Tracker() {
  const [run, setRun] = useState<Run | null>(() => loadActiveRun());
  const runRef = useRef(run);
  const [saveError, setSaveError] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const pack = run ? getGamePack(run.gameId) : undefined;
  const stops = useMemo<Stop[]>(() => {
    if (!pack) return [];
    const occurrences = new Map<string, number>();
    return pack.progression.flatMap((segment) => {
      const id = segment.kind === "route" ? segment.routeId : segment.bossId;
      const identity = `${segment.kind}-${id}`;
      const occurrence = (occurrences.get(identity) ?? 0) + 1;
      occurrences.set(identity, occurrence);
      const key = `${identity}-${occurrence}`;
      if (segment.kind === "route") {
        const route = pack.routes.find((item) => item.id === id);
        return route ? [{ key, route } as Stop] : [];
      }
      const boss = pack.bosses.find((item) => item.id === id);
      return boss ? [{ key, boss } as Stop] : [];
    });
  }, [pack]);
  function commit(update: (current: Run) => Run) {
    if (!runRef.current) return;
    const next = update(runRef.current);
    try {
      saveRun(next);
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
    runRef.current = next;
    setRun(next);
  }
  function updateEncounter(encounter: Encounter) {
    commit((current) => {
      const next = upsertEncounter(current, encounter);
      if (
        !next.starterType &&
        encounter.routeId === "starter" &&
        isCaught(encounter)
      )
        next.starterType = STARTERS[encounter.caughtAs ?? encounter.pokemon];
      return next;
    });
  }
  const setStarter = (starterType?: StarterType) =>
    commit((current) => ({ ...current, starterType }));
  if (!run || !pack)
    return (
      <div className="tracker-empty">
        <Icon name="route" size={35} />
        <h1>
          {run
            ? "This game pack is unavailable"
            : "Your next journey is waiting"}
        </h1>
        <Link to="/new-run" className="button button-primary">
          Start a new run
        </Link>
      </div>
    );
  const done = (stop: Stop) =>
    stop.boss
      ? !!run.defeatedBosses?.[stop.key]
      : run.encounters.some(
          (encounter) =>
            encounter.routeId === stop.route.id &&
            (isCaught(encounter) || encounter.outcome === "missed"),
        );
  const active = stops.find((stop) => stop.key === selected);
  const remaining = stops.filter((stop) => !done(stop));
  const visible = stops.filter((stop) => {
    if (
      (filter === "routes" && !stop.route) ||
      (filter === "bosses" && !stop.boss) ||
      (filter === "remaining" && done(stop))
    )
      return false;
    const records = stop.route
      ? run.encounters.filter(
          (encounter) => encounter.routeId === stop.route.id,
        )
      : [];
    const text = [
      stop.route?.name,
      stop.boss?.name,
      stop.boss?.location,
      ...records.flatMap((e) => [e.nickname, e.pokemon]),
      ...(stop.boss?.team.map((p) => p.species) ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return text.includes(search.trim().toLowerCase());
  });
  const toggleVictory = (stop: Stop) =>
    commit((current) => {
      const defeatedBosses = { ...current.defeatedBosses };
      if (defeatedBosses[stop.key]) delete defeatedBosses[stop.key];
      else defeatedBosses[stop.key] = new Date().toISOString();
      return { ...current, defeatedBosses };
    });
  function closeFocus() {
    (document.activeElement as HTMLElement | null)?.blur();
    setSelected(null);
  }
  const saveMessage = saveError ? (
    <div className="save-error" role="alert">
      Changes could not be saved to this browser. Keep this page open.
      <button
        type="button"
        className="button quiet small-btn"
        onClick={() => commit((current) => current)}
      >
        Retry save
      </button>
    </div>
  ) : (
    <p className="auto-save-note" role="status">
      <Icon name="check" size={13} />
      Autosave on · changes save in this browser
    </p>
  );
  return (
    <div className="tracker-page">
      <RunHeader
        run={run}
        savePending={saveError}
        view="Journey"
        description="A place for every encounter. A little space for the big battles."
      />
      <div className="journey-toolbar">
        <div className="journey-filters" aria-label="Filter journey">
          {[
            ["all", "All stops"],
            ["remaining", "Remaining"],
            ["routes", "Routes"],
            ["bosses", "Bosses"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              className={filter === value ? "selected" : ""}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="journey-search">
          <span className="sr-only">Search journey</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a route, Pokémon, or boss…"
          />
        </label>
      </div>
      <div className="journey-context">
        <span>
          {visible.length} of {stops.length} stops
          {remaining.length
            ? ` · ${remaining.length} remaining`
            : " · Journey recorded"}
        </span>
        {remaining[0] && (
          <button type="button" onClick={() => setSelected(remaining[0].key)}>
            Continue at {remaining[0].route?.name ?? remaining[0].boss?.name} →
          </button>
        )}
      </div>
      <div className="compact-journey">
        {visible.map((stop) => {
          if (stop.route) {
            const records = run.encounters.filter(
              (encounter) => encounter.routeId === stop.route.id,
            );
            return (
              <button
                key={stop.key}
                type="button"
                className={`journey-route ${records.length ? "has-record" : ""}`}
                onClick={() => setSelected(stop.key)}
                aria-label={`Open ${stop.route.name}`}
              >
                <span className="stop-marker">
                  <Icon name="route" size={16} />
                </span>
                <span className="route-title">
                  <strong>{stop.route.name}</strong>
                  <small>
                    {records.length
                      ? `${records.length} record${records.length === 1 ? "" : "s"}`
                      : "Not recorded"}
                  </small>
                </span>
                <span className="route-records">
                  {records.length ? (
                    records.slice(0, 2).map((record) => (
                      <span className="route-record" key={record.id}>
                        {record.pokemon && (
                          <PokemonSprite species={record.pokemon} size={36} />
                        )}
                        <span>
                          <strong>
                            {record.nickname ||
                              record.pokemon ||
                              "Missed encounter"}
                          </strong>
                          <small>{record.nickname ? record.pokemon : ""}</small>
                        </span>
                        <EncounterBadge encounter={record} />
                      </span>
                    ))
                  ) : (
                    <span className="unrecorded-label">
                      Record an encounter
                    </span>
                  )}
                  {records.length > 2 && (
                    <span className="muted small">+{records.length - 2}</span>
                  )}
                </span>
                <span className="stop-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            );
          }
          const boss = stop.boss;
          const conditional = boss.team.some((member) => member.starter);
          const team = bossTeam(boss, run.starterType);
          const unresolved = conditional && !run.starterType;
          const cap = unresolved ? undefined : bossLevelCap(team);
          return (
            <button
              key={stop.key}
              type="button"
              className={`journey-boss ${done(stop) ? "defeated" : ""}`}
              aria-label={`Open ${boss.name} at ${boss.location ?? "boss battle"}`}
              onClick={() => setSelected(stop.key)}
            >
              <div className="boss-stop-title">
                <span className="boss-marker">
                  <Icon name="shield" size={23} />
                </span>
                <span>
                  <span className="eyebrow">
                    {done(stop)
                      ? "BATTLE RECORDED"
                      : boss.category?.replaceAll("-", " ") || "BOSS BATTLE"}
                  </span>
                  <h2>{boss.name}</h2>
                  <span className="muted small">
                    {boss.location || "Boss reference"}
                    {boss.specialty ? ` · ${boss.specialty}` : ""}
                  </span>
                </span>
                <span className="tracker-badge">
                  {done(stop)
                    ? "Defeated ✓"
                    : unresolved
                      ? "Starter variants"
                      : cap
                        ? `Highest Lv. ${cap}`
                        : "View details"}
                </span>
              </div>
              <div className="boss-stop-preview">
                {unresolved ? (
                  <p>
                    Choose your starter to see the applicable opposing team.
                  </p>
                ) : (
                  <>
                    <span className="boss-preview-sprites">
                      {team.slice(0, 6).map((member, index) => (
                        <PokemonSprite
                          key={`${member.species}-${index}`}
                          species={member.species}
                          size={44}
                        />
                      ))}
                    </span>
                    <span>
                      {team.length} Pokémon · Open full reference{" "}
                      <span aria-hidden="true">↗</span>
                    </span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {!visible.length && (
        <div className="tracker-empty">
          <h2>No matching stops</h2>
          <button
            type="button"
            className="button quiet"
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
          >
            Clear search & filters
          </button>
        </div>
      )}
      {saveMessage}
      {active && (
        <FocusDialog
          key={active.key}
          title={active.route?.name ?? active.boss!.name}
          subtitle={active.route ? "ENCOUNTER DETAILS" : "BOSS REFERENCE"}
          onClose={closeFocus}
        >
          {saveMessage}
          {active.route ? (
            <RouteDetails
              route={active.route}
              run={run}
              onChange={updateEncounter}
              onEvolve={(id, species) =>
                commit((current) => evolveEncounter(current, id, species))
              }
            />
          ) : (
            <>
              <BossDetails
                boss={active.boss!}
                starter={run.starterType}
                onStarter={setStarter}
              />
              <div className="boss-result-actions">
                <span className="muted small">
                  {done(active)
                    ? "Victory recorded for this stop."
                    : "Record the result when you finish this battle."}
                </span>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => toggleVictory(active)}
                >
                  {done(active) ? "Undo defeated state" : "Mark defeated"}
                </button>
              </div>
            </>
          )}
        </FocusDialog>
      )}
    </div>
  );
}
