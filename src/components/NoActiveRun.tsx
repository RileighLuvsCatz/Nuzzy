import { Link } from "react-router-dom";
import { listRuns, setActiveRun } from "../run/storage";

export default function NoActiveRun() {
  const runs = listRuns().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <section className="py-16 space-y-6 text-gray-400">
      <h1 className="text-center text-xl font-semibold text-white">No active run found.</h1>
      {runs.length > 0 ? (
        <div className="max-w-lg mx-auto space-y-3">
          <h2 className="text-lg font-semibold text-white">Resume a saved run</h2>
          <p>Choose a run to continue on this page.</p>
          <ul className="space-y-2">
            {runs.map((run) => (
              <li key={run.id}>
                <button
                  type="button"
                  onClick={() => setActiveRun(run.id)}
                  className="w-full text-left px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                >
                  <span className="block font-medium text-white break-words">{run.name}</span>
                  <span className="block text-sm break-words">
                    {run.gameTitle ?? run.gameId} &middot; {new Date(run.createdAt).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-center">No saved runs yet. Start a new run to log your adventure.</p>
      )}
      <div className="text-center">
        <Link to="/new-run" className="text-red-400 hover:underline">
          Start a new run
        </Link>
      </div>
    </section>
  );
}
