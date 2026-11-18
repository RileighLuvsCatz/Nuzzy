# Run-library JSON backup

Open **Load Run** in the navbar on Tracker, Box, or Graveyard, then choose
**Export all runs**. The browser downloads `nuzzy-runs-YYYY-MM-DD.json`, using the
UTC download date. Keep the file somewhere outside browser storage. The action
exports every saved run, including inactive runs, and does not switch the active
run. An empty library can also be exported. The menu stays open for retry if the
download cannot be started; browser download completion is not tracked.

Import is not implemented yet; issue [#20](https://github.com/RileighLuvsCatz/Nuzzy/issues/20)
tracks validated restore. Downloading alone does not sync or restore saves.

## Format

The file is UTF-8 JSON with MIME type `application/json`, indented by two spaces.
The top-level `schemaVersion: 2` is the library version, matching the existing
storage contract. Each run currently has `schemaVersion: 1`. There is no extra
envelope or export timestamp field.

```json
{
  "schemaVersion": 2,
  "runs": [
    {
      "id": "example-run-id",
      "name": "Emerald adventure",
      "gameId": "emerald",
      "gameTitle": "Pokémon Emerald",
      "createdAt": "2026-11-18T16:00:00.000Z",
      "encounters": [
        {
          "id": "example-encounter-id",
          "routeId": "route-101",
          "pokemon": "Poochyena",
          "nickname": "Pup",
          "status": "Team"
        }
      ],
      "schemaVersion": 1
    }
  ],
  "activeRunId": "example-run-id"
}
```

- `runs` contains the complete library in stored order, with IDs, names, game
  identifiers, creation dates, and encounters. `gameTitle` is optional.
- Encounter `status` is `Team`, `Boxed`, or `Dead`. `routeId` is the stable route
  identifier, not its display name.
- `activeRunId` is the saved string or `null`. A stale ID is preserved even when
  no run matches it. An empty library exports `runs: []` and `activeRunId: null`.
- Sprite and species-type caches, game-pack data, and unrelated localStorage
  entries are excluded.

The exporter uses the same loader and normalization as the app. It exports
readable runs, not a byte-for-byte copy of raw localStorage. Legacy single-run
saves are migrated through the existing loader (which persists the migrated
library and removes the legacy key); old encounters gain stable route IDs and
`Alive` becomes `Team`. Invalid records may be dropped by normalization. An
unreadable library follows the existing legacy/empty-library fallback. Export
is not a recovery tool for corrupt storage. Exporting a current library does
not write it, change encounters, or select another run.

## Verification

`npm test` covers the complete multi-run download, active selection at click
time, Unicode names, encounter preservation, cache exclusion, null/stale active
IDs, empty and legacy libraries, download failure feedback, and cleanup of the
temporary link and object URL. Manual browser QA should check the downloaded
filename/content and keyboard access to the action.
