import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { listRuns, setActiveRun } from "../run/storage";
import type { Run } from "../types";

const TABS = [
  { to: "/tracker", label: "Tracker" },
  { to: "/box", label: "Box" },
  { to: "/graveyard", label: "Graveyard" },
] as const;

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
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
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xl font-bold text-red-400 hover:text-red-300"
          >
            Nuzzy
          </Link>

          <div ref={ref} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
              aria-label="Load Run"
              title="Load Run"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
            </button>
            {open && (
              <div className="absolute left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
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
        </div>

        <div className="flex">
          {TABS.map((tab) => {
            const active = location.pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  active
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
