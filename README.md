# Nuzzy — Nuzlocke Tracker

A browser-based tracking tool for Pokémon Nuzlocke challenge runs, built with React, TypeScript, and Tailwind CSS. Run data is saved locally in your browser; there is no account or cloud sync.

## Current Status

Nuzzy is in active, early development. This overview describes features implemented on `main`, not everything proposed or being iterated on in feature branches. Implemented does not mean every game pack or interaction has completed QA.

### Implemented

- **Landing page** — Project overview, Nuzlocke basics, new-run action, and a continue link when a run is active.
- **Run management** — Create and name multiple runs, persist them in a versioned localStorage library, and switch between them from the navbar on Tracker, Box, and Graveyard pages.
- **Progression tracker** — Routes and boss fights in game order, species selection from route catch pools, nicknames, per-route encounter counts, and inline status changes.
- **Encounter statuses** — `Team`, `Boxed`, and `Dead`. New Team additions and promotions are limited to six Pokémon. Full-team logging defaults to Boxed; older oversized teams remain readable and can be corrected.
- **Boss reference** — Team tables with species, types, moves, and held items.
- **Box and Team** — Dedicated view with transfers between Team and Box, type badges, and a Team count.
- **Type analysis** — Team weaknesses, resistances, super-effective STAB coverage, and coverage gaps. This currently uses modern PokéAPI typings and a Gen VI+ chart for every game, not the selected game's rules; see [#17](https://github.com/RileighLuvsCatz/Nuzzy/issues/17). STAB coverage is based on species types, not recorded movesets.
- **Graveyard** — Fallen Pokémon from the active run, with nickname, species, and encounter location. Death notes and timestamps are not implemented.
- **Sprites** — PokéAPI lookups with memory/localStorage caching, in-flight request deduplication, and a placeholder when unavailable.
- **Persistence migration** — Legacy single-run saves and older encounter shapes are normalized on load.

### Game packs

| Game | Run creation |
|---|---|
| Pokémon Emerald | Selectable |
| Pokémon Diamond | Selectable |
| Pokémon Pearl | Selectable |
| Pokémon Platinum | Selectable |
| Pokémon HeartGold | Selectable |
| Pokémon SoulSilver | Selectable |
| Pokémon Emerald Seaglass | Registered but disabled; incomplete routes, catch pools, and boss progression ([#2](https://github.com/RileighLuvsCatz/Nuzzy/issues/2)) |

Selectable packs contain route, boss, and progression data; this is not a claim of complete or authoritative coverage. Repeatable validation and data review remain tracked in [#14](https://github.com/RileighLuvsCatz/Nuzzy/issues/14) and [#15](https://github.com/RileighLuvsCatz/Nuzzy/issues/15).

### Known gaps

Encounter species/nicknames cannot yet be edited, encounters cannot be deleted, and multiple catches on a route do not trigger a warning. Run rename/delete actions and backup export/import are also absent. Saved runs without an active run need better recovery paths, especially on the landing page where the navbar is hidden. Type analysis can be incomplete after failed lookups, and sprite lookup failures need more resilient handling.

See [GitHub Issues](https://github.com/RileighLuvsCatz/Nuzzy/issues) for current status and acceptance criteria; the roadmap below is a direction, not a second task-status tracker.

## Development

```bash
npm ci
npm run dev

# Existing encounter/team-limit regression tests
npm test

# Lint
npm run lint

# Type-check both TypeScript projects
npx tsc -b

# Type-check and build for production
npm run build

# Serve the production build locally
npm run preview
```

The tests import TypeScript source directly with Node; use a Node release that supports this. The documentation refresh was checked with Node 26.7.0 and npm 11.19.0. Production hosting needs an SPA fallback to `index.html` for direct visits to `/new-run`, `/tracker`, `/box`, and `/graveyard`.

### Tech stack

React 19, Vite 8, React Router 7, Tailwind CSS 4 (Vite plugin), TypeScript 5.9, and ESLint 9. Dependency ranges and executable scripts are in [package.json](package.json).

## Roadmap

[GitHub Issues](https://github.com/RileighLuvsCatz/Nuzzy/issues) is the active state tracker. [nuzzyTodo.md](nuzzyTodo.md) explains the architecture, persistence contract, and issue-linked backlog.

### Near-term: reliability and UI iteration

- Make saved runs easy to resume and manage; show the active run clearly ([#1](https://github.com/RileighLuvsCatz/Nuzzy/issues/1), [#9–#12](nuzzyTodo.md#run-management)).
- Edit/delete encounters, warn on duplicate-route catches, add totals, collapse progression sections, and improve keyboard/accessibility behavior ([#3–#8](nuzzyTodo.md#tracker-and-navigation)).
- Harden sprites, validate game packs, and resolve Platinum's repeated boss segment ([#13–#15](nuzzyTodo.md#data-and-reference-reliability)).
- Add death notes and make type analysis game-aware and explicit about missing data ([#16–#18](nuzzyTodo.md#death-log-and-type-analysis)).
- Iterate on presentation in `codex/ui-overhaul` alongside issue-scoped fixes. Branch work is not shipped until merged into `main`; preserve run persistence and behavior while changing the UI.

### Later: backups, insights, and game support

- Versioned run-library export and validated import ([#19](https://github.com/RileighLuvsCatz/Nuzzy/issues/19), [#20](https://github.com/RileighLuvsCatz/Nuzzy/issues/20)).
- Basic run analytics, followed by recorded events for meaningful timeline metrics ([#21](https://github.com/RileighLuvsCatz/Nuzzy/issues/21), [#22](https://github.com/RileighLuvsCatz/Nuzzy/issues/22)).
- Complete and enable Emerald Seaglass ([#2](https://github.com/RileighLuvsCatz/Nuzzy/issues/2)).
- Add version-scoped Radical Red data and boss/AI references, FireRed/LeafGreen, and Black/White plus Black 2/White 2 packs ([#23–#25](nuzzyTodo.md#additional-game-packs)).
- Long horizon: authenticated durable run sync with offline support and conflict handling, after backups are established ([#26](https://github.com/RileighLuvsCatz/Nuzzy/issues/26)).

## What is a Nuzlocke?

A Nuzlocke is a self-imposed Pokémon challenge. Common rules include catching only the first encounter in each area, treating fainted Pokémon as permanently unavailable, and nicknaming catches. Optional rules vary by player. Nuzzy helps record the run; it does not enforce every ruleset or detect events in the game itself.

## Contributing

This is currently a personal project, but contributions are welcome. Start from an existing issue or discuss a new one, create an issue-scoped branch, run the available checks, and open a pull request. Keep presentation changes and behavior fixes reviewable, and verify that older saves still load when changing persistence.

## License

The repository does not currently include a `LICENSE` file. A license needs to be added before this documentation can point to licensing terms.

## Acknowledgments

- Pokémon and related properties belong to Nintendo, Game Freak, and The Pokémon Company.
- Emerald Seaglass ROM hack by the Seaglass development team.
- Radical Red ROM hack by Soupercell and the RR team.
- Nuzlocke challenge created by Nick Franco (Nuzlocke Comics).
- Project inspiration: [Nuzlocke.app](https://github.com/domtronn/nuzlocke.app).

Project: [RileighLuvsCatz/Nuzzy](https://github.com/RileighLuvsCatz/Nuzzy).

Nuzzy is a fan-made tool and is not affiliated with Nintendo, Game Freak, or The Pokémon Company.
