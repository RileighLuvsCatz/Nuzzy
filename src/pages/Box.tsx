import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getGamePack } from "../data/games";
import { loadActiveRun, saveRun } from "../run/storage";
import { changeEncounterStatus, TEAM_FULL_MESSAGE, TEAM_LIMIT } from "../run/encounters";
import type { RouteDef } from "../types/game";
import type { Encounter, Run, Status } from "../types";
import PokemonSprite from "../components/PokemonSprite";
import RunHeader from "../components/RunHeader";
import {
  getPokemonTypes,
  getCachedPokemonTypes,
} from "../lib/pokemonTypes";
import {
  teamWeaknesses,
  teamResistances,
  teamOffensiveCoverage,
  teamOffensiveGaps,
  type PokemonType,
} from "../lib/typeChart";

const STATUS_COLORS: Record<Status, string> = {
  Team: "text-green-400",
  Dead: "text-red-400",
  Boxed: "text-yellow-400",
};

const TYPE_COLORS: Partial<Record<PokemonType, string>> = {
  Normal: "bg-gray-500",
  Fire: "bg-orange-500",
  Water: "bg-blue-500",
  Electric: "bg-yellow-400 text-gray-900",
  Grass: "bg-green-500",
  Ice: "bg-cyan-300 text-gray-900",
  Fighting: "bg-red-700",
  Poison: "bg-purple-500",
  Ground: "bg-amber-700",
  Flying: "bg-indigo-300 text-gray-900",
  Psychic: "bg-pink-500",
  Bug: "bg-lime-600",
  Rock: "bg-yellow-800",
  Ghost: "bg-purple-800",
  Dragon: "bg-indigo-600",
  Dark: "bg-gray-700",
  Steel: "bg-gray-400 text-gray-900",
  Fairy: "bg-pink-300 text-gray-900",
};

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type as PokemonType] ?? "bg-gray-600";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${color}`}
    >
      {type}
    </span>
  );
}

function routeMap(routes: RouteDef[]): Map<string, RouteDef> {
  return new Map(routes.map((r) => [r.id, r]));
}

function useTeamTypes(teamEncounters: Encounter[]) {
  const [typeMap, setTypeMap] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const species = [...new Set(teamEncounters.map((e) => e.pokemon))];

    const initial = new Map<string, string[]>();
    const toFetch: string[] = [];
    for (const s of species) {
      const cached = getCachedPokemonTypes(s);
      if (cached) initial.set(s, cached);
      else toFetch.push(s);
    }
    setTypeMap(new Map(initial));

    if (toFetch.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      toFetch.map((s) =>
        getPokemonTypes(s).then((types) => [s, types] as const),
      ),
    ).then((results) => {
      if (cancelled) return;
      setTypeMap((prev) => {
        const next = new Map(prev);
        for (const [s, types] of results) next.set(s, types);
        return next;
      });
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [teamEncounters]);

  return { typeMap, loading };
}

function TeamAnalysis({
  teamEncounters,
  typeMap,
  loading,
}: {
  teamEncounters: Encounter[];
  typeMap: Map<string, string[]>;
  loading: boolean;
}) {
  const teamTypes = teamEncounters.map((e) => typeMap.get(e.pokemon) ?? []);
  const resolved = teamTypes.filter((t) => t.length > 0);

  if (teamEncounters.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic">
        Move Pokémon to your Team to see type analysis.
      </p>
    );
  }

  if (loading && resolved.length === 0) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-800 rounded w-1/3" />
        <div className="h-4 bg-gray-800 rounded w-1/2" />
        <div className="h-4 bg-gray-800 rounded w-2/5" />
      </div>
    );
  }

  const weaknesses = teamWeaknesses(teamTypes);
  const resistances = teamResistances(teamTypes);
  const coverage = teamOffensiveCoverage(teamTypes);
  const gaps = teamOffensiveGaps(teamTypes);

  return (
    <div className="space-y-4">
      {loading && (
        <p className="text-xs text-gray-500">Loading remaining types...</p>
      )}

      <div>
        <h4 className="text-sm font-semibold text-red-400 mb-1.5">
          Weaknesses
        </h4>
        {weaknesses.length === 0 ? (
          <p className="text-gray-500 text-sm">No team weaknesses found.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {weaknesses.map((w) => (
              <span key={w.type} className="flex items-center gap-1">
                <TypeBadge type={w.type} />
                <span className="text-xs text-gray-400">
                  ({w.weakMembers.length}
                  {w.maxMultiplier >= 4 ? ", 4x" : ""})
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-blue-400 mb-1.5">
          Resistances
        </h4>
        {resistances.length === 0 ? (
          <p className="text-gray-500 text-sm">No team resistances found.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {resistances.map((r) => (
              <span key={r.type} className="flex items-center gap-1">
                <TypeBadge type={r.type} />
                <span className="text-xs text-gray-400">
                  ({r.resistMembers.length})
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-400 mb-1.5">
          STAB Coverage
        </h4>
        {coverage.length === 0 ? (
          <p className="text-gray-500 text-sm">No offensive coverage.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {coverage.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        )}
      </div>

      {gaps.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-yellow-400 mb-1.5">
            Coverage Gaps
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {gaps.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EncounterCard({
  encounter,
  routeName,
  types,
  actions,
}: {
  encounter: Encounter;
  routeName: string;
  types: string[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 gap-3">
      <div className="shrink-0 w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center overflow-hidden">
        <PokemonSprite species={encounter.pokemon} size={36} />
      </div>
      <div className="flex-1 min-w-0">
        <div>
          <span className="font-medium text-white">{encounter.nickname}</span>
          <span className="text-gray-500 text-sm ml-1.5">
            {encounter.pokemon}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {types.length > 0 ? (
            types.map((t) => <TypeBadge key={t} type={t} />)
          ) : (
            <span className="text-xs text-gray-600">types loading...</span>
          )}
          <span className="text-xs text-gray-600 ml-1">{routeName}</span>
        </div>
      </div>
      <span
        className={`text-xs font-semibold shrink-0 ${STATUS_COLORS[encounter.status]}`}
      >
        {encounter.status}
      </span>
      {actions}
    </div>
  );
}

export default function Box() {
  const location = useLocation();
  const [run, setRun] = useState<Run | null>(() => loadActiveRun());

  useEffect(() => {
    setRun(loadActiveRun());
  }, [location.state]);

  const pack = run ? getGamePack(run.gameId) : undefined;
  const routesById = useMemo(
    () => (pack ? routeMap(pack.routes) : new Map<string, RouteDef>()),
    [pack],
  );

  useEffect(() => {
    if (run) saveRun(run);
  }, [run]);

  const teamEncounters = useMemo(
    () => (run?.encounters ?? []).filter((e) => e.status === "Team"),
    [run],
  );
  const boxedEncounters = useMemo(
    () => (run?.encounters ?? []).filter((e) => e.status === "Boxed"),
    [run],
  );

  const allNonDead = useMemo(
    () => [...teamEncounters, ...boxedEncounters],
    [teamEncounters, boxedEncounters],
  );
  const { typeMap, loading: typesLoading } = useTeamTypes(allNonDead);

  const changeStatus = useCallback(
    (encounterId: string, newStatus: Status) => {
      setRun((current) =>
        current ? changeEncounterStatus(current, encounterId, newStatus) : current,
      );
    },
    [],
  );

  const getRouteName = useCallback(
    (routeId: string) => routesById.get(routeId)?.name ?? routeId,
    [routesById],
  );

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

  const teamFull = teamEncounters.length >= TEAM_LIMIT;

  return (
    <div className="space-y-8">
      <RunHeader
        run={run}
        view="Team & box"
        description="Your trusted teammates. Your next great lineup."
      />

      {/* Team section */}
      <section className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">Team</h2>
            <span className="text-gray-500 text-sm">
              {teamEncounters.length} / {TEAM_LIMIT}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {teamFull && (
            <p id="team-full-message" className="text-yellow-400 text-sm">
              {TEAM_FULL_MESSAGE}
            </p>
          )}
          {teamEncounters.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              No Pokémon on your Team yet. Move Pokémon from the Box below.
            </p>
          ) : (
            teamEncounters.map((enc) => (
              <EncounterCard
                key={enc.id}
                encounter={enc}
                routeName={getRouteName(enc.routeId)}
                types={typeMap.get(enc.pokemon) ?? []}
                actions={
                  <button
                    type="button"
                    onClick={() => changeStatus(enc.id, "Boxed")}
                    className="ml-2 px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-yellow-400 transition-colors"
                  >
                    To Box
                  </button>
                }
              />
            ))
          )}
        </div>
      </section>

      {/* Type Analysis */}
      <section className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-800">
          <h2 className="font-semibold text-white">Type Analysis</h2>
        </div>
        <div className="p-4">
          <TeamAnalysis
            teamEncounters={teamEncounters}
            typeMap={typeMap}
            loading={typesLoading}
          />
        </div>
      </section>

      {/* Boxed storage */}
      <section className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-800">
          <h2 className="font-semibold text-white">Box</h2>
        </div>
        <div className="p-4 space-y-3">
          {boxedEncounters.length === 0 ? (
            <p className="text-gray-500 text-sm italic">The Box is empty.</p>
          ) : (
            boxedEncounters.map((enc) => (
              <EncounterCard
                key={enc.id}
                encounter={enc}
                routeName={getRouteName(enc.routeId)}
                types={typeMap.get(enc.pokemon) ?? []}
                actions={
                  <button
                    type="button"
                    onClick={() => changeStatus(enc.id, "Team")}
                    disabled={teamFull}
                    aria-describedby={teamFull ? "team-full-message" : undefined}
                    className="ml-2 px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed border border-gray-700 rounded text-green-400 transition-colors"
                  >
                    To Team
                  </button>
                }
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
