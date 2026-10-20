import type { Run } from "../types";
import Icon from "./Icon";
import { isCaught, TEAM_LIMIT } from "../run/encounters";

export default function RunHeader({
  run,
  view,
  description,
  savePending = false,
}: {
  run: Run;
  view: string;
  description: string;
  savePending?: boolean;
}) {
  const stats = [
    {
      label: "Encounters",
      value: run.encounters.filter(isCaught).length,
      icon: "route",
    },
    {
      label: "On your team",
      value: `${run.encounters.filter((e) => isCaught(e) && e.status === "Team").length} / ${TEAM_LIMIT}`,
      icon: "ball",
    },
    {
      label: "In the box",
      value: run.encounters.filter((e) => isCaught(e) && e.status === "Boxed")
        .length,
      icon: "box",
    },
    {
      label: "Remembered",
      value: run.encounters.filter((e) => isCaught(e) && e.status === "Dead")
        .length,
      icon: "heart",
    },
  ] as const;
  return (
    <div className="run-overview">
      <div className="run-title-row">
        <div>
          <p className="eyebrow">
            {run.gameTitle ?? run.gameId}{" "}
            <span className="eyebrow-separator">/</span> {view}
          </p>
          <h1>{run.name}</h1>
          <p className="muted">{description}</p>
        </div>
        <span className="save-indicator">
          <Icon name="shield" size={14} />
          {savePending ? "Save needs attention" : "Saved locally"}
        </span>
      </div>
      <div className="run-stats">
        {stats.map((stat) => (
          <div key={stat.label}>
            <span className="stat-icon">
              <Icon name={stat.icon} size={21} />
            </span>
            <span>
              <strong>{stat.value}</strong>
              <small>{stat.label}</small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
