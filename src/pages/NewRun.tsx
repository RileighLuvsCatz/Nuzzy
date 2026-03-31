import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GAME_OPTIONS } from "../data/games";
import { createRun, saveRun } from "../run/storage";

export default function NewRun() {
  const navigate = useNavigate();
  const [runName, setRunName] = useState("");
  const [gameId, setGameId] = useState(GAME_OPTIONS[0]?.id ?? "");

  function handleStart() {
    if (!runName.trim() || !gameId) return;
    const option = GAME_OPTIONS.find((g) => g.id === gameId);
    const run = createRun({
      name: runName.trim(),
      gameId,
      gameTitle: option?.title,
    });
    saveRun(run);
    navigate("/tracker");
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Start a new run</h1>

      <div className="space-y-1">
        <label htmlFor="run-name" className="block text-sm text-gray-400">
          Run name
        </label>
        <input
          id="run-name"
          type="text"
          value={runName}
          onChange={(e) => setRunName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          placeholder="e.g. Seaglass Wedlocke"
          className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="game" className="block text-sm text-gray-400">
          Game
        </label>
        <select
          id="game"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-red-500"
        >
          {GAME_OPTIONS.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleStart}
        disabled={!runName.trim() || !gameId}
        className="w-full py-3 bg-red-500 hover:bg-red-400 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
      >
        Begin run
      </button>
    </div>
  );
}
