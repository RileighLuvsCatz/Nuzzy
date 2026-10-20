# Reference-data provenance

Boss levels, abilities, starter conditions, battle metadata, and the compact species/evolution reference were derived from domtronn/nuzlocke.app at commit dcf66704628f47940d562d461c6710ce9e6bbe85 (2023-05-27).

- Source: https://github.com/domtronn/nuzlocke.app/tree/dcf66704628f47940d562d461c6710ce9e6bbe85/src/lib/data
- Species source: src/routes/api/pokemon.json/_pokemon.json
- Existing Nuzzy team ordering was checked against the source before adding fields.
- The six selectable vanilla Gen III/IV packs use a species reference through National Dex 493 with pre-Gen-VI type overrides. Emerald filters Gen IV evolutions out. The disabled Seaglass pack is not claimed to have this mechanics model.
- Missing battle details remain unknown. Starter-dependent teams are filtered at display time; when starter context is unset, alternatives are labeled separately.
- This is a historical content snapshot, not a claim of fresh verification of every battle.

The upstream BSD 3-Clause notice is retained in [reference-data-LICENSE.txt](reference-data-LICENSE.txt).
