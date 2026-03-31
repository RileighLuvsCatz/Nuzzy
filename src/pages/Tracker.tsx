import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getGamePack } from "../data/games";
import { loadRun, saveRun } from "../run/storage";
import type { BossDef, RouteDef } from "../types/game";
import type { Encounter, Status } from "../types";

const STATUS_COLORS: Record<Status, string> = {
  Alive: "text-green-400",
  Dead: "text-red-400",
  Boxed: "text-yellow-400",
};

function routeMap(routes: RouteDef[]): Map<string, RouteDef> {
  return new Map(routes.map((r) => [r.id, r]));
}

function bossMap(bosses: BossDef[]): Map<string, BossDef> {
  return new Map(bosses.map((b) => [b.id, b]));
}

export default function Tracker() {
  const [run, setRun] = useState(() => loadRun());
  const [pokemon, setPokemon] = useState("");
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState<Status>("Alive");

  const pack = run ? getGamePack(run.gameId) : undefined;
  const routesById = useMemo(
    () => (pack ? routeMap(pack.routes) : new Map<string, RouteDef>()),
    [pack],
  );
  const bossesById = useMemo(
    () => (pack ? bossMap(pack.bosses) : new Map<string, BossDef>()),
    [pack],
  );

  const defaultRouteId = pack?.routes[0]?.id ?? "";
  const [selectedRouteId, setSelectedRouteId] = useState(defaultRouteId);

  useEffect(() => {
    if (pack?.routes[0]?.id) {
      setSelectedRouteId((prev) =>
        prev && routesById.has(prev) ? prev : (pack.routes[0]?.id ?? ""),
      );
    }
  }, [pack, routesById]);

  useEffect(() => {
    if (run) saveRun(run);
  }, [run]);

  function handleAddEncounter() {
    if (!run || !pack || !pokemon.trim() || !nickname.trim()) return;
    if (!selectedRouteId || !routesById.has(selectedRouteId)) return;

    const newEncounter: Encounter = {
      id: crypto.randomUUID(),
      routeId: selectedRouteId,
      pokemon: pokemon.trim(),
      nickname: nickname.trim(),
      status,
    };

    setRun({ ...run, encounters: [...run.encounters, newEncounter] });
    setPokemon("");
    setNickname("");
    setStatus("Alive");
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

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Log encounter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="route" className="block text-sm text-gray-400">
              Route / area
            </label>
            <select
              id="route"
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              {pack.routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="status" className="block text-sm text-gray-400">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="Alive">Alive</option>
              <option value="Dead">Dead</option>
              <option value="Boxed">Boxed</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="pokemon" className="block text-sm text-gray-400">
              Pokémon
            </label>
            <input
              id="pokemon"
              type="text"
              value={pokemon}
              onChange={(e) => setPokemon(e.target.value)}
              placeholder="e.g. Torchic"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="nickname" className="block text-sm text-gray-400">
              Nickname
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddEncounter()}
              placeholder="e.g. Blaze"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddEncounter}
          disabled={!pokemon.trim() || !nickname.trim()}
          className="px-6 py-2 bg-red-500 hover:bg-red-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          Log encounter
        </button>
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
              <section
                key={`route-${segment.routeId}-${index}`}
                className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50"
              >
                <button
                  type="button"
                  onClick={() => setSelectedRouteId(segment.routeId)}
                  className="w-full text-left px-4 py-3 bg-gray-900 hover:bg-gray-800/80 transition-colors border-b border-gray-800"
                >
                  <span className="font-semibold text-white">{route.name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {forRoute.length} encounter
                    {forRoute.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-gray-600 text-xs ml-2">
                    (click to select in form)
                  </span>
                </button>
                <div className="p-4 space-y-2">
                  {forRoute.length === 0 ? (
                    <p className="text-gray-500 text-sm">No Pokémon logged.</p>
                  ) : (
                    forRoute.map((encounter) => (
                      <div
                        key={encounter.id}
                        className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 gap-3 flex-wrap"
                      >
                        <div>
                          <span className="font-medium text-white">
                            {encounter.nickname}
                          </span>
                          <span className="text-gray-400 text-sm ml-2">
                            ({encounter.pokemon})
                          </span>
                        </div>
                        <select
                          value={encounter.status}
                          onChange={(e) =>
                            handleStatusChange(
                              encounter.id,
                              e.target.value as Status,
                            )
                          }
                          className={`bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none shrink-0 ${STATUS_COLORS[encounter.status]}`}
                          aria-label={`Status for ${encounter.nickname}`}
                        >
                          <option value="Alive">Alive</option>
                          <option value="Dead">Dead</option>
                          <option value="Boxed">Boxed</option>
                        </select>
                      </div>
                    ))
                  )}
                </div>
               </section>
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
                        <td className="py-2 pr-4 text-white">{member.species}</td>
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
