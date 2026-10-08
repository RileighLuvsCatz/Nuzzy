import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GAME_OPTIONS } from "../data/games";
import { createRun, saveRun } from "../run/storage";
import Icon from "../components/Icon";

export default function NewRun() {
  const navigate = useNavigate();
  const [runName, setRunName] = useState("");
  const [gameId, setGameId] = useState(
    GAME_OPTIONS.find((g) => !g.disabled)?.id ?? "",
  );
  function handleStart(event: React.FormEvent) {
    event.preventDefault();
    if (!runName.trim() || !gameId) return;
    const option = GAME_OPTIONS.find((g) => g.id === gameId);
    if (!option || option.disabled) return;
    saveRun(
      createRun({ name: runName.trim(), gameId, gameTitle: option.title }),
    );
    navigate("/tracker");
  }
  return (
    <div className="new-run-layout">
      <aside className="new-run-intro">
        <Link to="/" className="text-link">
          ← Back to your journal
        </Link>
        <p className="eyebrow">A FRESH PAGE</p>
        <h1>
          Every great story
          <br />
          starts with <em>you.</em>
        </h1>
        <p className="muted">
          Choose your game, give this adventure a name, and let’s see where the
          journey takes you.
        </p>
        <div className="new-run-motif" aria-hidden="true">
          <Icon name="ball" size={120} />
          <span>ONE RUN. COUNTLESS MEMORIES.</span>
        </div>
      </aside>
      <form className="new-run-form panel" onSubmit={handleStart}>
        <p className="eyebrow">LET’S MAKE IT OFFICIAL</p>
        <h2>Start a new run</h2>
        <label htmlFor="run-name">What’s your story called?</label>
        <input
          id="run-name"
          type="text"
          value={runName}
          onChange={(e) => setRunName(e.target.value)}
          placeholder="e.g. The little Hoenn adventure"
          required
        />
        <label id="game-label">Choose your game</label>
        <div
          className="game-picker"
          role="radiogroup"
          aria-labelledby="game-label"
        >
          {GAME_OPTIONS.map((g) => (
            <label
              key={g.id}
              className={`game-option ${g.id === gameId ? "selected" : ""} ${g.disabled ? "unavailable" : ""}`}
            >
              <input
                type="radio"
                name="game"
                value={g.id}
                checked={g.id === gameId}
                disabled={g.disabled}
                onChange={() => setGameId(g.id)}
              />
              <span className={`game-emblem game-${g.id}`}>
                <Icon name="ball" size={19} />
              </span>
              <span>
                {g.title.replace("Pokémon ", "").replace(" (Coming soon)", "")}
                {g.disabled && <small>Coming soon</small>}
              </span>
              {g.id === gameId && <Icon name="check" size={16} />}
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={!runName.trim() || !gameId}
          className="button button-primary"
        >
          Begin your journey
          <Icon name="arrow" size={18} />
        </button>
        <p className="form-note">
          <Icon name="shield" size={14} />
          Your run is saved locally in this browser.
        </p>
      </form>
    </div>
  );
}
