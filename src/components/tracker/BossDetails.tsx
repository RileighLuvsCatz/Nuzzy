import type { BossDef } from "../../types/game";
import type { StarterType } from "../../types";
import { bossLevelCap, bossTeam } from "../../lib/bossReference";
import PokemonSprite from "../PokemonSprite";
const starterLabels: Record<StarterType, string> = {
  grass: "Grass starter",
  fire: "Fire starter",
  water: "Water starter",
};

export default function BossDetails({
  boss,
  starter,
  onStarter,
}: {
  boss: BossDef;
  starter?: StarterType;
  onStarter: (starter?: StarterType) => void;
}) {
  const conditional = boss.team.some((member) => member.starter);
  const groups =
    conditional && !starter ? (["grass", "fire", "water"] as const) : [starter];
  return (
    <>
      <div className="boss-facts">
        <span>{boss.location || "Location not provided"}</span>
        <span>{boss.doubleBattle ? "Double battle" : "Trainer battle"}</span>
        {boss.specialty && <span>{boss.specialty} specialty</span>}
        {boss.effect && <span>{boss.effect}</span>}
      </div>
      {conditional && (
        <div className="variant-control">
          <label htmlFor="boss-starter">
            Your starter determines this rival’s team
            <select
              id="boss-starter"
              value={starter ?? ""}
              onChange={(event) =>
                onStarter(
                  (event.target.value || undefined) as StarterType | undefined,
                )
              }
            >
              <option value="">Show all labeled alternatives</option>
              {Object.entries(starterLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <p className="field-help">
            {starter
              ? "Showing the team for your starter choice. You can correct this at any time."
              : "Choose your starter to show one applicable team. These alternatives are separate battles, not one combined party."}
          </p>
        </div>
      )}
      {boss.notes && <p className="reference-note">{boss.notes}</p>}
      {groups.map((group) => {
        const team = bossTeam(boss, group);
        const cap = bossLevelCap(team);
        return (
          <section className="boss-team-group" key={group ?? "default"}>
            <div className="boss-group-title">
              <h3>{conditional ? starterLabels[group!] : "Opposing team"}</h3>
              <span className="tracker-badge">
                {cap ? `Highest level ${cap}` : "Level cap not provided"}
              </span>
            </div>
            <div className="boss-roster">
              {team.map((member, index) => (
                <article
                  className="boss-member"
                  key={`${member.species}-${index}`}
                >
                  <div className="boss-member-heading">
                    <PokemonSprite species={member.species} size={64} />
                    <div>
                      <h3>{member.species}</h3>
                      <div className="type-chips">
                        {member.types.map((type) => (
                          <span
                            className={`type-chip type-${type.toLowerCase()}`}
                            key={type}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <strong className="member-level">
                      {member.level ? `Lv. ${member.level}` : "Lv. ?"}
                    </strong>
                  </div>
                  <dl>
                    <div>
                      <dt>Ability</dt>
                      <dd>
                        {member.abilities?.join(" / ") ||
                          member.ability ||
                          "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt>Held item</dt>
                      <dd>{member.item || "None listed"}</dd>
                    </div>
                  </dl>
                  <div className="move-list">
                    {member.moves.map((move, i) => (
                      <span key={`${move}-${i}`}>{move}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
      <p className="field-help">
        Level information is shown as provided in the game pack. Highest level
        is a reference, not an enforced run rule. Missing details remain
        unknown.
      </p>
    </>
  );
}
