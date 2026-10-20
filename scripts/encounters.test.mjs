import assert from "node:assert/strict";
import test from "node:test";
import { addEncounter, changeEncounterStatus } from "../src/run/encounters.ts";

function encounter(id, status = "Team") {
  return {
    id,
    routeId: "route-101",
    pokemon: "Poochyena",
    nickname: id,
    status,
  };
}

function runWithTeam(size) {
  return {
    id: "run",
    name: "Test",
    gameId: "emerald",
    schemaVersion: 1,
    createdAt: "2026-10-07T00:00:00Z",
    encounters: Array.from({ length: size }, (_, index) =>
      encounter(`team-${index}`),
    ),
  };
}

test("logging the sixth member succeeds and the seventh is blocked", () => {
  const original = runWithTeam(5);
  const full = addEncounter(original, encounter("sixth"));
  assert.equal(full.encounters.length, 6);
  assert.equal(original.encounters.length, 5);
  assert.strictEqual(addEncounter(full, encounter("seventh")), full);
});

test("Boxed and Dead logs remain available with full or oversized teams", () => {
  for (const size of [6, 8]) {
    const run = runWithTeam(size);
    for (const status of ["Boxed", "Dead"]) {
      const updated = addEncounter(run, encounter("new", status));
      assert.equal(updated.encounters.length, size + 1);
      assert.equal(updated.encounters.at(-1).status, status);
    }
    assert.strictEqual(addEncounter(run, encounter("new")), run);
  }
});

test("Boxed and Dead encounters can join only when a Team slot is free", () => {
  for (const status of ["Boxed", "Dead"]) {
    for (const size of [5, 6, 8]) {
      const run = addEncounter(runWithTeam(size), encounter("reserve", status));
      const updated = changeEncounterStatus(run, "reserve", "Team");
      if (size === 5) {
        assert.equal(updated.encounters.at(-1).status, "Team");
      } else {
        assert.strictEqual(updated, run);
      }
    }
  }
});

test("moving or marking a Team member Dead frees a slot", () => {
  for (const status of ["Boxed", "Dead"]) {
    const run = addEncounter(runWithTeam(6), encounter("reserve", "Boxed"));
    const freed = changeEncounterStatus(run, "team-0", status);
    const updated = changeEncounterStatus(freed, "reserve", "Team");
    assert.equal(
      updated.encounters.find((item) => item.id === "team-0").status,
      status,
    );
    assert.equal(updated.encounters.at(-1).status, "Team");
  }
});

test("oversized saves retain every member and can be corrected", () => {
  let run = runWithTeam(8);
  assert.strictEqual(changeEncounterStatus(run, "team-0", "Team"), run);
  run = changeEncounterStatus(run, "team-0", "Boxed");
  run = changeEncounterStatus(run, "team-1", "Dead");
  assert.equal(run.encounters.length, 8);
  assert.strictEqual(changeEncounterStatus(run, "team-0", "Team"), run);
  run = changeEncounterStatus(run, "team-2", "Boxed");
  run = changeEncounterStatus(run, "team-0", "Team");
  assert.equal(
    run.encounters.filter((item) => item.status === "Team").length,
    6,
  );
});

test("plans and missed encounters never occupy a party slot", async () => {
  const { upsertEncounter, isCaught } =
    await import("../src/run/encounters.ts");
  const plan = upsertEncounter(runWithTeam(6), {
    ...encounter("plan"),
    outcome: "planned",
  });
  assert.equal(plan.encounters.at(-1).status, "Boxed");
  assert.equal(isCaught(plan.encounters.at(-1)), false);
  const caught = upsertEncounter(plan, {
    ...plan.encounters.at(-1),
    outcome: "caught",
    status: "Team",
  });
  assert.equal(caught.encounters.length, 7);
  assert.equal(caught.encounters.at(-1).status, "Boxed");
  const missed = upsertEncounter(caught, {
    ...caught.encounters[0],
    outcome: "missed",
  });
  assert.equal(
    missed.encounters.filter((e) => isCaught(e) && e.status === "Team").length,
    5,
  );
});

test("evolution preserves identity, nickname, route, and original species", async () => {
  const { evolveEncounter } = await import("../src/run/encounters.ts");
  const run = {
    ...runWithTeam(0),
    encounters: [
      { ...encounter("starter"), pokemon: "Treecko", nickname: "Clover" },
    ],
  };
  const evolved = evolveEncounter(run, "starter", "Grovyle");
  assert.deepEqual(evolved.encounters[0], {
    ...run.encounters[0],
    pokemon: "Grovyle",
    caughtAs: "Treecko",
  });
  const again = evolveEncounter(evolved, "starter", "Sceptile");
  assert.equal(again.encounters[0].caughtAs, "Treecko");
  assert.equal(run.encounters[0].pokemon, "Treecko");
});
