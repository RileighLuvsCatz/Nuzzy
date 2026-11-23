import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteRun, listRuns, setActiveRun } from "../run/storage";
import { useActiveRun } from "../run/useActiveRun";
import type { Run } from "../types";

const TABS = [
  { to: "/tracker", label: "Tracker" },
  { to: "/box", label: "Box" },
  { to: "/graveyard", label: "Graveyard" },
] as const;

function SavedRunItem({ run, onPick, onDelete }: {
  run: Run;
  onPick: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) cancelButton.current?.focus();
  }, [confirming]);

  function cancel() {
    setConfirming(false);
    setError(null);
    deleteButton.current?.focus();
  }

  return (
    <li className="border-b border-gray-700 last:border-0">
      <button
        type="button"
        onClick={() => onPick(run.id)}
        className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
      >
        <span className="block text-sm text-white font-medium truncate">{run.name}</span>
        <span className="block text-xs text-gray-400 truncate">
          {run.gameTitle ?? run.gameId} &middot; {new Date(run.createdAt).toLocaleDateString()}
        </span>
      </button>
      <button
        ref={deleteButton}
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Delete run ${run.name}`}
        aria-expanded={confirming}
        className="mx-4 mb-2 text-sm text-red-300 hover:text-red-200 focus-visible:outline-2 focus-visible:outline-red-400"
      >
        Delete
      </button>
      {confirming && (
        <div
          role="group"
          aria-label={`Confirm deletion of run ${run.name}`}
          className="px-4 pb-3 text-sm text-gray-200"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              cancel();
            }
          }}
        >
          <p className="break-words">Delete “{run.name}” and all its encounters? This cannot be undone.</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <button ref={cancelButton} type="button" onClick={cancel} className="rounded px-2 py-1 bg-gray-700 focus-visible:outline-2 focus-visible:outline-red-400">Cancel</button>
            <button
              type="button"
              className="rounded px-2 py-1 bg-red-900 text-red-100 focus-visible:outline-2 focus-visible:outline-red-400"
              onClick={() => {
                try {
                  onDelete(run.id);
                } catch {
                  setError("Could not delete this run. Please try again.");
                }
              }}
            >Confirm delete</button>
          </div>
          {error && <p role="alert" className="mt-2 text-red-300">{error}</p>}
        </div>
      )}
    </li>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeRun] = useActiveRun();
  const [open, setOpen] = useState(false);
  const [runs, setRuns] = useState<Run[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  function toggleMenu() {
    if (!open) setRuns(listRuns());
    setOpen(!open);
  }

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

  function handleDelete(id: string) {
    deleteRun(id);
    setRuns(listRuns());
    menuButton.current?.focus();
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-4xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0 sm:flex-1">
          <Link
            to="/"
            className="shrink-0 text-xl font-bold text-red-400 hover:text-red-300"
          >
            Nuzzy
          </Link>

          <div ref={ref} className="relative min-w-0" onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              menuButton.current?.focus();
            }
          }}>
            <button
              ref={menuButton}
              type="button"
              onClick={toggleMenu}
              className="flex items-center gap-2 max-w-full text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
              aria-label="Load Run"
              aria-expanded={open}
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
                className="w-5 h-5 shrink-0"
                aria-hidden="true"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              <span className="truncate text-sm text-gray-200" title={activeRun?.name}>
                {activeRun?.name ?? "No active run"}
              </span>
            </button>
            {open && (
              <div className="absolute left-0 mt-2 w-64 max-w-[calc(100vw-7rem)] bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
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
                        <SavedRunItem key={r.id} run={r} onPick={handlePick} onDelete={handleDelete} />
                      ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0">
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
