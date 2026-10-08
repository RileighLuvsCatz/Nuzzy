import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { listRuns, loadActiveRun, setActiveRun } from "../run/storage";
import type { Run } from "../types";
import Icon from "./Icon";

const TABS = [
  { to: "/tracker", label: "Journey", icon: "route" },
  { to: "/box", label: "Team & box", icon: "box" },
  { to: "/graveyard", label: "Graveyard", icon: "heart" },
] as const;

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [runs, setRuns] = useState<Run[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const activeRun = loadActiveRun();
  const inRun = TABS.some((tab) => tab.to === location.pathname);

  useEffect(() => {
    function dismiss(event: MouseEvent | KeyboardEvent) {
      if (
        (event instanceof KeyboardEvent && event.key === "Escape") ||
        (event instanceof MouseEvent &&
          ref.current &&
          !ref.current.contains(event.target as Node))
      )
        setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", dismiss);
      document.addEventListener("keydown", dismiss);
    }
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, [open]);

  function handlePick(id: string) {
    setActiveRun(id);
    setOpen(false);
    navigate("/tracker", { state: { activeRunId: id }, replace: true });
  }

  return (
    <header className="site-header">
      <nav className="nav-inner" aria-label="Main navigation">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Icon name="ball" size={25} />
          </span>
          nuzzy<span className="brand-dot">.</span>
        </Link>
        {inRun ? (
          <div className="nav-tabs">
            {TABS.map((tab) => (
              <Link
                key={tab.to}
                to={tab.to}
                aria-current={location.pathname === tab.to ? "page" : undefined}
                className={`nav-tab ${location.pathname === tab.to ? "active" : ""}`}
              >
                <Icon name={tab.icon} size={17} />
                {tab.label}
              </Link>
            ))}
          </div>
        ) : (
          <span className="nav-tagline">
            A little companion for a big adventure.
          </span>
        )}
        <div className="nav-actions">
          <div ref={ref} className="run-switcher">
            <button
              type="button"
              className="switcher-button"
              aria-label="Load Run"
              aria-expanded={open}
              aria-controls="run-menu"
              onClick={() => {
                if (!open) setRuns(listRuns());
                setOpen(!open);
              }}
            >
              <span className="status-dot" />
              <span>{inRun && activeRun ? activeRun.name : "Your runs"}</span>
              <Icon name="chevron" size={14} />
            </button>
            {open && (
              <div id="run-menu" className="run-menu">
                <p className="eyebrow">Your adventures</p>
                {runs.length === 0 ? (
                  <p className="muted menu-empty">
                    Your first adventure is waiting.
                  </p>
                ) : (
                  <ul>
                    {runs
                      .slice()
                      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                      .map((run) => (
                        <li key={run.id}>
                          <button
                            type="button"
                            onClick={() => handlePick(run.id)}
                          >
                            <span>
                              <strong>{run.name}</strong>
                              <small>{run.gameTitle ?? run.gameId}</small>
                            </span>
                            {activeRun?.id === run.id && (
                              <Icon name="check" size={16} />
                            )}
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
                <Link
                  to="/new-run"
                  onClick={() => setOpen(false)}
                  className="menu-new"
                >
                  <Icon name="plus" size={16} />
                  Start a new run
                </Link>
              </div>
            )}
          </div>
          <Link
            to="/new-run"
            className="button button-primary nav-new"
            aria-label="New run"
          >
            <Icon name="plus" size={17} />
            <span>New run</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
