import { Link, useNavigate } from "react-router-dom";
import { listRuns, loadActiveRun, setActiveRun } from "../run/storage";
import { GAME_OPTIONS } from "../data/games";
import Icon from "../components/Icon";

function JourneyArt() {
  return (
    <div className="journey-art" aria-hidden="true">
      <div className="art-grid" />
      <span className="art-label">FIELD NOTES / 001</span>
      <svg className="map-art" viewBox="0 0 500 370" fill="none">
        <path
          d="M-20 280C90 190 110 340 230 220S355 70 530 125"
          stroke="#273c35"
          strokeWidth="75"
        />
        <path
          d="M-20 280C90 190 110 340 230 220S355 70 530 125"
          stroke="#38564a"
          strokeWidth="1"
          strokeDasharray="5 8"
        />
        <path
          d="M100 280 160 235 220 257 290 165 370 140"
          stroke="#b1e3b9"
          strokeWidth="2"
          strokeDasharray="5 7"
        />
        <circle cx="100" cy="280" r="7" fill="#b1e3b9" />
        <circle
          cx="220"
          cy="257"
          r="6"
          fill="#172b24"
          stroke="#b1e3b9"
          strokeWidth="2"
        />
        <circle cx="370" cy="140" r="7" fill="#b1e3b9" />
        <g stroke="#496453" strokeWidth="2">
          <path d="m70 165 12-23 12 23H70Zm22 12 12-23 12 23H92Zm280 102 12-23 12 23h-24Zm30-13 12-23 12 23h-24ZM334 64l12-23 12 23h-24" />
        </g>
        <circle cx="268" cy="157" r="72" fill="#0c1915" fillOpacity=".45" />
        <circle cx="260" cy="145" r="62" fill="#d6e8c5" />
        <path d="M198 145a62 62 0 0 1 124 0H198Z" fill="#87ba91" />
        <path d="M198 145h124" stroke="#1a3329" strokeWidth="9" />
        <circle
          cx="260"
          cy="145"
          r="19"
          fill="#d6e8c5"
          stroke="#1a3329"
          strokeWidth="8"
        />
        <circle cx="260" cy="145" r="7" stroke="#87ba91" strokeWidth="2" />
        <path
          d="m225 112 8-8"
          stroke="#cee8ce"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
      <div className="art-note">
        <span className="status-dot" />
        Every encounter has a story.
      </div>
      <div className="art-coordinate">
        HOENN · JOHTO · SINNOH <span>✦</span>
      </div>
    </div>
  );
}

export default function Landing() {
  const activeRun = loadActiveRun();
  const runs = listRuns().sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const navigate = useNavigate();
  function resume(id: string) {
    setActiveRun(id);
    navigate("/tracker", { state: { activeRunId: id } });
  }
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            YOUR NUZLOCKE COMPANION
          </p>
          <h1>
            A big adventure.
            <br />
            Every little <em>story.</em>
          </h1>
          <p className="hero-description">
            The first catch. The close call. The teammate you’ll never forget.
            Keep your Nuzlocke journey together, one encounter at a time.
          </p>
          <div className="hero-actions">
            <Link
              to={activeRun ? "/tracker" : "/new-run"}
              className="button button-primary"
            >
              {activeRun ? "Continue your journey" : "Start your adventure"}
              <Icon name="arrow" size={18} />
            </Link>
            {activeRun ? (
              <Link to="/new-run" className="text-link">
                Start a new run
              </Link>
            ) : (
              <a href="#field-guide" className="text-link">
                New to Nuzlockes? <span>↗</span>
              </a>
            )}
          </div>
          <p className="hero-reassurance">
            <Icon name="shield" size={14} />
            Saved in your browser. Ready when you are.
          </p>
        </div>
        <JourneyArt />
      </section>
      <div className="feature-strip">
        {[
          {
            icon: "route",
            title: "One journey, all your encounters",
            text: "Follow every route and boss battle.",
          },
          {
            icon: "box",
            title: "A team worth remembering",
            text: "Manage your party and plan with type coverage.",
          },
          {
            icon: "heart",
            title: "No friend forgotten",
            text: "Keep a place for your fallen teammates.",
          },
        ].map((feature) => (
          <div key={feature.title}>
            <span className="feature-icon">
              <Icon name={feature.icon as "route" | "box" | "heart"} />
            </span>
            <span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </span>
          </div>
        ))}
      </div>
      <section className="adventures-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR FIELD JOURNAL</p>
            <h2>Your adventures</h2>
          </div>
          <span className="muted small">
            {runs.length} saved run{runs.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="adventure-grid">
          {runs.map((run) => (
            <button
              className="adventure-card"
              key={run.id}
              onClick={() => resume(run.id)}
            >
              <span className={`game-emblem game-${run.gameId}`}>
                <Icon name="ball" size={28} />
              </span>
              <span className="adventure-info">
                <span className="eyebrow">{run.gameTitle ?? run.gameId}</span>
                <strong>{run.name}</strong>
                <span className="muted small">
                  {run.encounters.length} encounters ·{" "}
                  {run.encounters.filter((e) => e.status === "Team").length} on
                  team
                </span>
              </span>
              <Icon name="arrow" size={19} />
            </button>
          ))}
          <Link to="/new-run" className="adventure-card new-adventure">
            <span className="new-icon">
              <Icon name="plus" size={24} />
            </span>
            <span>
              <strong>
                {runs.length
                  ? "Another story awaits"
                  : "Your journal starts here"}
              </strong>
              <span className="muted small">
                Pick a game. Name your run. Make it yours.
              </span>
            </span>
            <Icon name="arrow" size={19} />
          </Link>
        </div>
      </section>
      <section id="field-guide" className="field-guide">
        <div className="guide-intro">
          <p className="eyebrow">THE FIELD GUIDE</p>
          <h2>
            A few rules.
            <br />A whole new journey.
          </h2>
          <p className="muted">
            A Nuzlocke turns a familiar game into an adventure where every
            choice counts.
          </p>
          <span className="guide-note">
            Your rules, your challenge. Nuzzy keeps the notes.
          </span>
        </div>
        <div className="guide-rules">
          {[
            {
              title: "The first encounter is the one.",
              text: "Catch only the first Pokémon you meet in each route or area.",
            },
            {
              title: "Give every friend a name.",
              text: "Nickname each Pokémon. They’re part of your story now.",
            },
            {
              title: "Make every life count.",
              text: "A fainted Pokémon is retired for good. A whiteout ends the run.",
            },
          ].map((rule, i) => (
            <div key={rule.title}>
              <span className="rule-number">0{i + 1}</span>
              <span>
                <h3>{rule.title}</h3>
                <p>{rule.text}</p>
              </span>
            </div>
          ))}
          <p className="clause-note">
            Optional: use the duplicates clause to skip species you’ve already
            caught.
          </p>
        </div>
      </section>
      <div className="supported-games">
        <span className="eyebrow">CHOOSE YOUR CHAPTER</span>
        <p>
          {GAME_OPTIONS.filter((g) => !g.disabled)
            .map((g) => g.title.replace("Pokémon ", ""))
            .join("  /  ")}
        </p>
      </div>
    </div>
  );
}
