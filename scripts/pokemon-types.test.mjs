import assert from "node:assert/strict";
import test from "node:test";

const stored = new Map([["nuzzy:poke-types:v1", JSON.stringify({ legacy: [], cached: ["Water"] })]]);
globalThis.localStorage = {
  getItem: (key) => stored.get(key) ?? null,
  setItem: (key, value) => stored.set(key, value),
};
const { getPokemonTypes, getCachedPokemonTypes } = await import("../src/lib/pokemonTypes.ts");
const response = (names) => ({ ok: true, json: async () => ({ types: names.map((name) => ({ type: { name } })) }) });

test("successful stored types are reused, but legacy empty types are retried", async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return response(["fire"]); };
  assert.deepEqual(await getPokemonTypes("cached"), { status: "resolved", types: ["Water"] });
  assert.equal(calls, 0);
  assert.equal(getCachedPokemonTypes("legacy"), undefined);
  assert.deepEqual(await getPokemonTypes("legacy"), { status: "resolved", types: ["Fire"] });
  assert.equal(calls, 1);
});

test("network, HTTP, empty, and malformed responses can recover on retry", async () => {
  const failures = [
    async () => { throw new Error("offline"); },
    async () => ({ ok: false }),
    async () => response([]),
    async () => ({ ok: true, json: async () => ({ types: [{}] }) }),
  ];
  for (const [index, failure] of failures.entries()) {
    const species = `failure-${index}`;
    globalThis.fetch = failure;
    assert.deepEqual(await getPokemonTypes(species), { status: "unavailable" });
    assert.equal(getCachedPokemonTypes(species), undefined);
    assert.equal(JSON.parse(stored.get("nuzzy:poke-types:v1"))[species], undefined);
    globalThis.fetch = async () => response(["grass", "poison"]);
    assert.deepEqual(await getPokemonTypes(species), { status: "resolved", types: ["Grass", "Poison"] });
    assert.deepEqual(JSON.parse(stored.get("nuzzy:poke-types:v1"))[species], ["Grass", "Poison"]);
  }
});

test("concurrent requests are deduplicated and successful results stay cached", async () => {
  let calls = 0;
  let finish;
  globalThis.fetch = () => { calls++; return new Promise((resolve) => { finish = resolve; }); };
  const first = getPokemonTypes("Pikachu");
  const second = getPokemonTypes("Pikachu");
  assert.equal(calls, 1);
  finish(response(["electric"]));
  assert.deepEqual(await first, await second);
  await getPokemonTypes("Pikachu");
  assert.equal(calls, 1);
});
