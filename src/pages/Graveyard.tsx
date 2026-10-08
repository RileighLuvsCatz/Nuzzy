import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getGamePack } from "../data/games";
import { loadActiveRun } from "../run/storage";
import type { RouteDef } from "../types/game";
import type { Encounter } from "../types";
import PokemonSprite from "../components/PokemonSprite";
import RunHeader from "../components/RunHeader";

function routeMap(routes: RouteDef[]): Map<string, RouteDef> {
  return new Map(routes.map((r) => [r.id, r]));
}

function GraveyardCard({
  encounter,
  routeName,
}: {
  encounter: Encounter;
  routeName: string;
}) {
  return (
    <div className="flex items-center bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 gap-3 opacity-70">
      <div className="shrink-0 w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center overflow-hidden grayscale">
        <PokemonSprite species={encounter.pokemon} size={36} />
      </div>
      <div className="flex-1 min-w-0">
        <div>
          <span className="font-medium text-white">{encounter.nickname}</span>
          <span className="text-gray-500 text-sm ml-1.5">
            {encounter.pokemon}
          </span>
        </div>
        <span className="text-xs text-gray-600">{routeName}</span>
      </div>
      <span className="text-xs font-semibold text-red-400 shrink-0">Dead</span>
    </div>
  );
}

export default function Graveyard() {
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

  const deadEncounters = useMemo(
    () => (run?.encounters ?? []).filter((e) => e.status === "Dead"),
    [run],
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

  return (
    <div className="space-y-8">
      <RunHeader
        run={run}
        view="Graveyard"
        description="Every teammate leaves a little of their story with you."
      />

      <section className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-800">
          <h2 className="font-semibold text-white">Graveyard</h2>
          <span className="text-gray-500 text-sm">
            {deadEncounters.length} fallen
          </span>
        </div>
        <div className="p-4 space-y-3">
          {deadEncounters.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              No fallen Pokémon. Keep it that way.
            </p>
          ) : (
            deadEncounters.map((enc) => (
              <GraveyardCard
                key={enc.id}
                encounter={enc}
                routeName={routesById.get(enc.routeId)?.name ?? enc.routeId}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
