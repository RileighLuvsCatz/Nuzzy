import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

// Use Vite's existing TSX pipeline to exercise the actual analysis component.
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { TeamAnalysis } = await server.ssrLoadModule("/src/pages/Box.tsx");
  const teamEncounters = [
    { id: "1", pokemon: "Bulbasaur", nickname: "Bud", status: "Team" },
    { id: "2", pokemon: "Squirtle", nickname: "Shell", status: "Team" },
  ];
  const resolved = { status: "resolved", types: ["Grass", "Poison"] };
  const render = (typeMap, encounters = teamEncounters) => renderToStaticMarkup(
    createElement(TeamAnalysis, { teamEncounters: encounters, typeMap, onRetry() {} }),
  );

  test("missing and failed team types suppress misleading analysis", () => {
    for (const missing of [undefined, { status: "unavailable" }]) {
      const map = new Map([["Bulbasaur", resolved]]);
      if (missing) map.set("Squirtle", missing);
      const html = render(map);
      assert.match(html, /Type analysis is incomplete/);
      assert.match(html, /Shell/);
      assert.doesNotMatch(html, /STAB Coverage|No team weaknesses found|Coverage Gaps/);
      assert.match(html, missing ? /Retry unavailable types/ : /Loading type data/);
    }
  });

  test("all unavailable types offer recovery without computed results", () => {
    const html = render(new Map(teamEncounters.map((e) => [e.pokemon, { status: "unavailable" }])));
    assert.match(html, /Bud, Shell/);
    assert.match(html, /Retry unavailable types/);
    assert.doesNotMatch(html, /No offensive coverage|No team weaknesses found/);
  });

  test("resolved team shows analysis even when a boxed species is unavailable", () => {
    const html = render(new Map([
      ["Bulbasaur", resolved],
      ["Squirtle", { status: "resolved", types: ["Water"] }],
      ["Pikachu", { status: "unavailable" }],
    ]));
    assert.match(html, /STAB Coverage/);
    assert.match(html, /Weaknesses/);
    assert.doesNotMatch(html, /incomplete|Retry unavailable/);
  });

  test("empty team retains its helpful empty state", () => {
    const html = render(new Map(), []);
    assert.match(html, /Move Pokémon to your Team/);
    assert.doesNotMatch(html, /incomplete|STAB Coverage/);
  });
} finally {
  await server.close();
}
