import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listRuns, setActiveRun } from "../run/storage";
import type { Run } from "../types";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [runs, setRuns] = useState<Run[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setRuns(listRuns());
  }, [open]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handlePick(id: string) {
    setActiveRun(id);
    setOpen(false);
    navigate("/tracker", { state: { activeRunId: id }, replace: true });
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold text-red-400 hover:text-red-300"
        >
          Nuzzy
        </Link>
        <div className="flex gap-6 items-center">
          <div ref={ref} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Load Run
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                {runs.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-400">
                    No saved runs.
                  </p>
                ) : (
                  <ul className="max-h-64 overflow-y-auto">
                    {runs
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime(),
                      )
                      .map((r) => (
                        <li key={r.id}>
                          <button
                            type="button"
                            onClick={() => handlePick(r.id)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
                          >
                            <span className="block text-sm text-white font-medium truncate">
                              {r.name}
                            </span>
                            <span className="block text-xs text-gray-400 truncate">
                              {r.gameTitle ?? r.gameId} &middot;{" "}
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <Link
            to="/new-run"
            className="text-gray-300 hover:text-white transition-colors"
          >
            New Run
          </Link>
        </div>
      </div>
    </nav>
  );
}
