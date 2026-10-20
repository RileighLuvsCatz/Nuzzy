# Compact tracker iteration

Approved direction: compact ordered route rows, larger boss milestones, and foreground detail panels on both desktop and mobile. Edits autosave. Pokémon evolution changes species on the same encounter record. Planned and missed records never occupy the party or box.

This iteration restores boss levels, abilities, and starter-conditioned teams. It provides boss reference and explicit victory recording; the interactive boss team builder remains a future iteration. The neutral charcoal/blue working palette is provisional, with restrained status/type accents.

## Persistence

The existing run-library key and encounter IDs are retained. Optional outcome/caughtAs fields and run-level starter context/battle results are read without dropping existing encounters. Existing encounters without an outcome are caught. A raw library backup is retained once under `nuzzy_run_library_before_tracker_focus` before the first library write. Failed saves display an error and a retry action.

## Review checks

- New and existing catches: outcome changes, team/box/dead, evolution, nickname-only plan drafts, multiple records per route.
- Save/reload of missed encounters, starter variants, and boss results.
- Native modal focus containment, Escape dismissal, return to the initiating row, and phone overflow.
- Boss content/variant and encounter invariant tests.

Reference metadata is a historical source snapshot; see reference-data.md. The broader team-analysis mechanics and advanced rule enforcement have not been rewritten here.
