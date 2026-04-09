import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getGamePack } from "../data/games";
import { loadActiveRun, saveRun } from "../run/storage";
import type { BossDef, RouteDef } from "../types/game";
import type { Encounter, Status } from "../types";
import PokemonSprite from "../components/PokemonSprite";

const STATUS_COLORS: Record<Status, string> = {
  Team: "text-green-400",
  Dead: "text-red-400",
  Boxed: "text-yellow-400",
};

function routeMap(routes: RouteDef[]): Map<string, RouteDef> {
  return new Map(routes.map((r) => [r.id, r]));
}

function bossMap(bosses: BossDef[]): Map<string, BossDef> {
  return new Map(bosses.map((b) => [b.id, b]));
}

function RouteSection({
  route,
  encounters,
  onAdd,
  onStatusChange,
}: {
  route: RouteDef;
  encounters: Encounter[];
  onAdd: (routeId: string, pokemon: string, nickname: string, status: Status) => void;
  onStatusChange: (encounterId: string, newStatus: Status) => void;
}) {
  const pool = route.catchPool ?? [];
  const [species, setSpecies] = useState(pool[0] ?? "");
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState<Status>("Team");

  function handleLog() {
    if (!species || !nickname.trim()) return;
    onAdd(route.id, species, nickname.trim(), status);
    setNickname("");
    setStatus("Team");
  }

  return (
    <section className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
      <div className="px-4 py-3 bg-gray-900 border-b border-gray-800">
        <span className="font-semibold text-white">{route.name}</span>
        <span className="text-gray-500 text-sm ml-2">
          {encounters.length} encounter{encounters.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {pool.length > 0 ? (
          <div className="flex flex-wrap items-end gap-2">
            {species && (
              <div className="shrink-0 self-center w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center overflow-hidden">
                <PokemonSprite species={species} size={36} />
              </div>
            )}
            <div className="space-y-1 min-w-[140px] flex-1">
              <label className="block text-xs text-gray-400">Pokémon</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-red-500"
              >
                {pool.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 min-w-[120px] flex-1">
              <label className="block text-xs text-gray-400">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLog()}
                placeholder="Nickname"
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="space-y-1 min-w-[90px]">
              <label className="block text-xs text-gray-400">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-red-500"
              >
                <option value="Team">Team</option>
                <option value="Boxed">Boxed</option>
                <option value="Dead">Dead</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleLog}
              disabled={!species || !nickname.trim()}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-semibold rounded transition-colors"
            >
              Log
            </button>
          </div>
        ) : (
          <p className="text-gray-600 text-sm italic">
            No encounter data for this area.
          </p>
        )}

        {encounters.map((encounter) => (
          <div
            key={encounter.id}
            className="flex items-center bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 gap-3"
          >
            <div className="shrink-0 w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center overflow-hidden">
              <PokemonSprite species={encounter.pokemon} size={36} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium text-white">
                {encounter.nickname}
              </span>
              <span className="text-gray-500 text-sm ml-1.5">
                {encounter.pokemon}
              </span>
            </div>
            <select
              value={encounter.status}
              onChange={(e) =>
                onStatusChange(encounter.id, e.target.value as Status)
              }
              className={`bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none shrink-0 ${STATUS_COLORS[encounter.status]}`}
              aria-label={`Status for ${encounter.nickname}`}
            >
              <option value="Team">Team</option>
              <option value="Boxed">Boxed</option>
              <option value="Dead">Dead</option>
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Tracker() {
  const location = useLocation();
  const [run, setRun] = useState(() => loadActiveRun());

  useEffect(() => {
    setRun(loadActiveRun());
  }, [location.state]);

  const pack = run ? getGamePack(run.gameId) : undefined;
  const routesById = useMemo(
    () => (pack ? routeMap(pack.routes) : new Map<string, RouteDef>()),
    [pack],
  );
  const bossesById = useMemo(
    () => (pack ? bossMap(pack.bosses) : new Map<string, BossDef>()),
    [pack],
  );

  useEffect(() => {
    if (run) saveRun(run);
  }, [run]);

  function handleAddEncounter(
    routeId: string,
    pokemon: string,
    nickname: string,
    status: Status,
  ) {
    if (!run) return;
    const newEncounter: Encounter = {
      id: crypto.randomUUID(),
      routeId,
      pokemon,
      nickname,
      status,
    };
    setRun({ ...run, encounters: [...run.encounters, newEncounter] });
  }

  function handleStatusChange(encounterId: string, newStatus: Status) {
    if (!run) return;
    const updated = run.encounters.map((e) =>
      e.id === encounterId ? { ...e, status: newStatus } : e,
    );
    setRun({ ...run, encounters: updated });
  }

  if (!run) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>No active run found.</p>
        <Link
          to="/new-run"
          className="text-red-400 hover:underline mt-2 inline-block"
        >
          Start a new run
        </Link>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="text-center py-16 text-gray-400 space-y-2">
        <p>
          Unknown game pack{" "}
          <span className="text-white font-mono">{run.gameId}</span>.
        </p>
        <Link to="/new-run" className="text-red-400 hover:underline">
          Start a new run
        </Link>
      </div>
    );
  }

  const displayTitle = run.gameTitle ?? run.gameId;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">{run.name}</h1>
        <p className="text-gray-400">{displayTitle}</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-white">Progression</h2>
        {pack.progression.map((segment, index) => {
          if (segment.kind === "route") {
            const route = routesById.get(segment.routeId);
            if (!route) return null;
            const forRoute = run.encounters.filter(
              (e) => e.routeId === segment.routeId,
            );
            return (
              <RouteSection
                key={`route-${segment.routeId}-${index}`}
                route={route}
                encounters={forRoute}
                onAdd={handleAddEncounter}
                onStatusChange={handleStatusChange}
              />
            );
          }

          const boss = bossesById.get(segment.bossId);
          if (!boss) return null;
          return (
            <section
              key={`boss-${segment.bossId}-${index}`}
              className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50"
            >
              <div className="px-4 py-3 bg-gray-900 border-b border-gray-800">
                <h3 className="font-semibold text-white">{boss.name}</h3>
                {boss.location ? (
                  <p className="text-gray-400 text-sm">{boss.location}</p>
                ) : null}
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="py-2 pr-4 font-medium">Pokémon</th>
                      <th className="py-2 pr-4 font-medium">Types</th>
                      <th className="py-2 pr-4 font-medium">Moves</th>
                      <th className="py-2 font-medium">Item</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boss.team.map((member, i) => (
                      <tr
                        key={`${boss.id}-${member.species}-${i}`}
                        className="border-b border-gray-800/80 last:border-0"
                      >
                        <td className="py-2 pr-4 text-white">
                          <span className="inline-flex items-center gap-1.5">
                            <PokemonSprite species={member.species} size={28} />
                            {member.species}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-gray-300">
                          {member.types.join(" / ")}
                        </td>
                        <td className="py-2 pr-4 text-gray-300">
                          {member.moves.join(", ")}
                        </td>
                        <td className="py-2 text-gray-300">
                          {member.item ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>

      {run.encounters.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No encounters logged yet. Your journey begins.
        </p>
      ) : null}
    </div>
  );
}
