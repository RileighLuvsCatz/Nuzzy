import { Link } from "react-router-dom";
import { listRuns, loadActiveRun, setActiveRun } from "../run/storage";

export default function Landing() {
  const activeRun = loadActiveRun();
  const runs = listRuns().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-12 py-8">
      <section className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          Nuzzy
        </h1>
        <p className="text-lg text-gray-400 max-w-lg mx-auto">
          Track your Pokémon Nuzlocke runs in the browser. Log encounters,
          follow boss fights, and manage your team — all saved locally.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/new-run"
            className="w-full sm:w-auto px-8 py-3 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-lg transition-colors text-center"
          >
            Start a new run
          </Link>

          {activeRun && (
            <Link
              to="/tracker"
              className="w-full sm:w-auto px-8 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-lg transition-colors text-center"
            >
              Continue {activeRun.name}
            </Link>
          )}
        </div>

        {!activeRun && runs.length > 0 && (
          <div className="max-w-lg mx-auto space-y-3 text-left">
            <h2 className="text-lg font-semibold text-white">Resume a saved run</h2>
            <p className="text-sm text-gray-400">Choose a run to continue in Tracker.</p>
            <ul className="space-y-2">
              {runs.map((run) => (
                <li key={run.id}>
                  <Link
                    to="/tracker"
                    onClick={() => setActiveRun(run.id)}
                    className="block px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                  >
                    <span className="block font-medium text-white break-words">{run.name}</span>
                    <span className="block text-sm text-gray-400 break-words">
                      {run.gameTitle ?? run.gameId} &middot; {new Date(run.createdAt).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="border border-gray-800 rounded-xl bg-gray-900/50 px-6 py-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Nuzlocke basics</h2>
        <ul className="space-y-2 text-gray-300 list-disc list-inside">
          <li>You may only catch the first Pokémon encountered in each route or area.</li>
          <li>If a Pokémon faints, it is considered dead and must be permanently boxed or released.</li>
          <li>Every Pokémon must be given a nickname.</li>
          <li>Whiting out means the run is over.</li>
          <li>
            <span className="text-gray-500">Optional:</span> duplicates clause
            — skip species you have already caught.
          </li>
        </ul>
        <p className="text-sm text-gray-500">
          Nuzzy tracks your encounters, boss battles, and team status (Team /
          Boxed / Dead) along the game's progression so you can focus on the
          run.
        </p>
      </section>
    </div>
  );
}
