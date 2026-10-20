import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { bossTeam, bossLevelCap } from "../src/lib/bossReference.ts";
const packs = [
  "emerald",
  "diamond",
  "pearl",
  "platinum",
  "heartgold",
  "soulsilver",
];
const read = (game) =>
  JSON.parse(
    readFileSync(
      new URL(`../src/data/games/${game}/bosses.json`, import.meta.url),
    ),
  );

test("May's Route 110 variants resolve to one three-member team", () => {
  const may = read("emerald").find((boss) => boss.id === "r3");
  for (const [starter, species] of [
    ["grass", ["Wingull", "Lombre", "Combusken"]],
    ["fire", ["Lombre", "Slugma", "Marshtomp"]],
    ["water", ["Slugma", "Wingull", "Grovyle"]],
  ]) {
    const team = bossTeam(may, starter);
    assert.deepEqual(
      team.map((member) => member.species),
      species,
    );
    assert.equal(bossLevelCap(team), 20);
  }
  assert.deepEqual(bossTeam(may), []);
});

test("all selectable packs preserve levels, abilities, and valid starter conditions", () => {
  for (const pack of packs)
    for (const boss of read(pack)) {
      for (const member of boss.team) {
        assert.ok(member.level, `${pack}/${boss.id}: missing level`);
        assert.ok(
          member.ability || member.abilities?.length,
          `${pack}/${boss.id}: missing ability`,
        );
        assert.ok(
          !member.starter ||
            ["grass", "fire", "water"].includes(member.starter),
        );
      }
      for (const starter of ["grass", "fire", "water"]) {
        const team = bossTeam(boss, starter);
        assert.ok(
          team.length > 0 && team.length <= 6,
          `${pack}/${boss.id}/${starter}: ${team.length}`,
        );
      }
    }
});

test("missing or relative levels are not presented as fixed caps", () => {
  assert.equal(bossLevelCap([{ level: "+2" }, { level: "50" }]), undefined);
  assert.equal(bossLevelCap([{}]), undefined);
  assert.equal(bossLevelCap([{ level: "15" }, {}]), undefined);
});

test("sprite IDs are National Dex IDs, and legacy typing stays pre-Fairy", () => {
  const species = JSON.parse(
    readFileSync(new URL("../src/data/species.json", import.meta.url)),
  );
  assert.equal(species.treecko.id, 252);
  assert.equal(species.wingull.id, 278);
  assert.deepEqual(species.ralts.types, ["Psychic"]);
  assert.ok(species.treecko.evolutions.includes("Grovyle"));
  assert.equal(species.turtwig.id, 387);
});
