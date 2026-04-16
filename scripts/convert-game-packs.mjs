#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const XTRADATA = join(ROOT, "xtradata");
const GAMES_DIR = join(ROOT, "src", "data", "games");

// Pre-Gen 6 types for every species appearing in boss teams across all games.
const SPECIES_TYPES = {
  abomasnow: ["Grass", "Ice"],
  absol: ["Dark"],
  aerodactyl: ["Rock", "Flying"],
  aggron: ["Steel", "Rock"],
  alakazam: ["Psychic"],
  altaria: ["Dragon", "Flying"],
  ambipom: ["Normal"],
  arbok: ["Poison"],
  arcanine: ["Fire"],
  ariados: ["Bug", "Poison"],
  armaldo: ["Rock", "Bug"],
  banette: ["Ghost"],
  bastiodon: ["Rock", "Steel"],
  bayleef: ["Grass"],
  beautifly: ["Bug", "Flying"],
  bellsprout: ["Grass", "Poison"],
  bellossom: ["Grass"],
  blastoise: ["Water"],
  bronzong: ["Steel", "Psychic"],
  bronzor: ["Steel", "Psychic"],
  buizel: ["Water"],
  cacturne: ["Grass", "Dark"],
  camerupt: ["Fire", "Ground"],
  carvanha: ["Water", "Dark"],
  charizard: ["Fire", "Flying"],
  cherubi: ["Grass"],
  chikorita: ["Grass"],
  chimchar: ["Fire"],
  claydol: ["Ground", "Psychic"],
  clefairy: ["Normal"],
  combusken: ["Fire", "Fighting"],
  cranidos: ["Rock"],
  cradily: ["Rock", "Grass"],
  crawdaunt: ["Water", "Dark"],
  crobat: ["Poison", "Flying"],
  croconaw: ["Water"],
  cyndaquil: ["Fire"],
  delcatty: ["Normal"],
  dewgong: ["Water", "Ice"],
  dragonair: ["Dragon"],
  dragonite: ["Dragon", "Flying"],
  drapion: ["Poison", "Dark"],
  drifblim: ["Ghost", "Flying"],
  drowzee: ["Psychic"],
  dusclops: ["Ghost"],
  duskull: ["Ghost"],
  dustox: ["Bug", "Poison"],
  electabuzz: ["Electric"],
  electivire: ["Electric"],
  electrike: ["Electric"],
  electrode: ["Electric"],
  empoleon: ["Water", "Steel"],
  espeon: ["Psychic"],
  exeggutor: ["Grass", "Psychic"],
  feraligatr: ["Water"],
  flareon: ["Fire"],
  floatzel: ["Water"],
  flygon: ["Ground", "Dragon"],
  forretress: ["Bug", "Steel"],
  froslass: ["Ice", "Ghost"],
  gallade: ["Psychic", "Fighting"],
  garchomp: ["Dragon", "Ground"],
  gardevoir: ["Psychic"],
  gastly: ["Ghost", "Poison"],
  gastrodon: ["Water", "Ground"],
  gengar: ["Ghost", "Poison"],
  geodude: ["Rock", "Ground"],
  girafarig: ["Normal", "Psychic"],
  glalie: ["Ice"],
  gliscor: ["Ground", "Flying"],
  gloom: ["Grass", "Poison"],
  golbat: ["Poison", "Flying"],
  golduck: ["Water"],
  golem: ["Rock", "Ground"],
  graveler: ["Rock", "Ground"],
  grimer: ["Poison"],
  grotle: ["Grass"],
  grovyle: ["Grass"],
  gyarados: ["Water", "Flying"],
  haunter: ["Ghost", "Poison"],
  heracross: ["Bug", "Fighting"],
  hippowdon: ["Ground"],
  hitmonlee: ["Fighting"],
  hitmonchan: ["Fighting"],
  hitmontop: ["Fighting"],
  honchkrow: ["Dark", "Flying"],
  hoothoot: ["Normal", "Flying"],
  houndoom: ["Dark", "Fire"],
  houndour: ["Dark", "Fire"],
  infernape: ["Fire", "Fighting"],
  jolteon: ["Electric"],
  jumpluff: ["Grass", "Flying"],
  jynx: ["Ice", "Psychic"],
  kadabra: ["Psychic"],
  kabutops: ["Rock", "Water"],
  kakuna: ["Bug", "Poison"],
  kingdra: ["Water", "Dragon"],
  koffing: ["Poison"],
  lapras: ["Water", "Ice"],
  linoone: ["Normal"],
  lombre: ["Water", "Grass"],
  lopunny: ["Normal"],
  lotad: ["Water", "Grass"],
  lucario: ["Fighting", "Steel"],
  ludicolo: ["Water", "Grass"],
  lunatone: ["Rock", "Psychic"],
  luxray: ["Electric"],
  luvdisc: ["Water"],
  machamp: ["Fighting"],
  machoke: ["Fighting"],
  machop: ["Fighting"],
  magcargo: ["Fire", "Rock"],
  magmar: ["Fire"],
  magmortar: ["Fire"],
  magnemite: ["Electric", "Steel"],
  magneton: ["Electric", "Steel"],
  makuhita: ["Fighting"],
  manectric: ["Electric"],
  marshtomp: ["Water", "Ground"],
  medicham: ["Fighting", "Psychic"],
  meditite: ["Fighting", "Psychic"],
  meganium: ["Grass"],
  metagross: ["Steel", "Psychic"],
  metapod: ["Bug"],
  mightyena: ["Dark"],
  milotic: ["Water"],
  miltank: ["Normal"],
  mismagius: ["Ghost"],
  monferno: ["Fire", "Fighting"],
  "mr-mime": ["Psychic"],
  mudkip: ["Water"],
  muk: ["Poison"],
  murkrow: ["Dark", "Flying"],
  nosepass: ["Rock"],
  numel: ["Fire", "Ground"],
  octillery: ["Water"],
  omastar: ["Rock", "Water"],
  onix: ["Rock", "Ground"],
  pelipper: ["Water", "Flying"],
  pidgeot: ["Normal", "Flying"],
  pidgeotto: ["Normal", "Flying"],
  pidgey: ["Normal", "Flying"],
  pikachu: ["Electric"],
  piloswine: ["Ice", "Ground"],
  piplup: ["Water"],
  poliwrath: ["Water", "Fighting"],
  ponyta: ["Fire"],
  poochyena: ["Dark"],
  primeape: ["Fighting"],
  prinplup: ["Water"],
  purugly: ["Normal"],
  quagsire: ["Water", "Ground"],
  quilava: ["Fire"],
  raichu: ["Electric"],
  ralts: ["Psychic"],
  rapidash: ["Fire"],
  raticate: ["Normal"],
  rhyhorn: ["Ground", "Rock"],
  rhyperior: ["Ground", "Rock"],
  rhydon: ["Ground", "Rock"],
  roselia: ["Grass", "Poison"],
  roserade: ["Grass", "Poison"],
  sableye: ["Dark", "Ghost"],
  salamence: ["Dragon", "Flying"],
  scizor: ["Bug", "Steel"],
  scyther: ["Bug", "Flying"],
  sealeo: ["Ice", "Water"],
  seel: ["Water"],
  sharpedo: ["Water", "Dark"],
  shelgon: ["Dragon"],
  shiftry: ["Grass", "Dark"],
  skarmory: ["Steel", "Flying"],
  skuntank: ["Poison", "Dark"],
  slaking: ["Normal"],
  slowbro: ["Water", "Psychic"],
  slugma: ["Fire"],
  sneasel: ["Dark", "Ice"],
  snorlax: ["Normal"],
  snover: ["Grass", "Ice"],
  solrock: ["Rock", "Psychic"],
  spinda: ["Normal"],
  spiritomb: ["Ghost", "Dark"],
  staraptor: ["Normal", "Flying"],
  staravia: ["Normal", "Flying"],
  starly: ["Normal", "Flying"],
  starmie: ["Water", "Psychic"],
  steelix: ["Steel", "Ground"],
  sudowoodo: ["Rock"],
  swablu: ["Normal", "Flying"],
  tangela: ["Grass"],
  tentacruel: ["Water", "Poison"],
  togekiss: ["Normal", "Flying"],
  torchic: ["Fire"],
  torkoal: ["Fire"],
  torterra: ["Grass", "Ground"],
  totodile: ["Water"],
  toxicroak: ["Poison", "Fighting"],
  treecko: ["Grass"],
  tropius: ["Grass", "Flying"],
  turtwig: ["Grass"],
  typhlosion: ["Fire"],
  umbreon: ["Dark"],
  vaporeon: ["Water"],
  venomoth: ["Bug", "Poison"],
  venusaur: ["Grass", "Poison"],
  vespiquen: ["Bug", "Flying"],
  victreebel: ["Grass", "Poison"],
  vigoroth: ["Normal"],
  vileplume: ["Grass", "Poison"],
  voltorb: ["Electric"],
  wailord: ["Water"],
  walrein: ["Ice", "Water"],
  weavile: ["Dark", "Ice"],
  weezing: ["Poison"],
  whiscash: ["Water", "Ground"],
  wingull: ["Water", "Flying"],
  xatu: ["Psychic", "Flying"],
  yanmega: ["Bug", "Flying"],
  zubat: ["Poison", "Flying"],
};

// Display name overrides for species that don't capitalize cleanly.
const DISPLAY_NAMES = {
  "mr-mime": "Mr. Mime",
  "mime-jr": "Mime Jr.",
  "mime jr.": "Mime Jr.",
  mimejr: "Mime Jr.",
  mrmime: "Mr. Mime",
  "mr. mime": "Mr. Mime",
  nidoranf: "Nidoran\u2640",
  nidoranm: "Nidoran\u2642",
  "nidoran-f": "Nidoran\u2640",
  "nidoran-m": "Nidoran\u2642",
  farfetchd: "Farfetch'd",
  "farfetch'd": "Farfetch'd",
  hooh: "Ho-Oh",
};

// ---- Game configs ----

const EMERALD_REMAP = {
  "1": "roxanne", "2": "brawly", "3": "wattson", "4": "flannery",
  "5": "norman", "6": "winona", "7": "tate-and-liza", "8": "juan",
  e1: "sidney", e2: "phoebe", e3: "glacia", e4: "drake",
  c1: "wallace-champion", c2: "steven-champion",
};

const DP_REMAP = {
  "1": "roark", "2": "gardenia", "3": "maylene", "4": "crasher-wake",
  "5": "fantina", "6": "byron", "7": "candice", "8": "volkner",
  e1: "aaron", e2: "bertha", e3: "flint", e4: "lucian",
  c: "cynthia",
};

const PLAT_REMAP = {
  "1": "roark", "2": "gardenia", "3": "fantina", "4": "maylene",
  "5": "crasher-wake", "6": "byron", "7": "candice", "8": "volkner",
  e1: "aaron", e2: "bertha", e3: "flint", e4: "lucian",
  c: "cynthia",
};

const HGSS_REMAP = {
  "1": "falkner", "2": "bugsy", "3": "whitney", "4": "morty",
  "5": "chuck", "6": "jasmine", "7": "pryce", "8": "clair",
  e1: "will", e2: "koga", e3: "bruno", e4: "karen",
  c: "lance",
  k1: "lt-surge", k2: "sabrina", k3: "erika", k4: "janine",
  k5: "misty", k6: "brock", k7: "blaine", k8: "blue",
};

const GAMES = [
  { id: "emerald",     routesFile: "emeraldEncounters.txt", bossFile: "emeraldBosses.txt", bossIdRemap: EMERALD_REMAP },
  { id: "diamond",     routesFile: "diamondRoutes.txt",     bossFile: "dpLeague.txt",      bossIdRemap: DP_REMAP },
  { id: "pearl",       routesFile: "pearlRoutes.txt",       bossFile: "dpLeague.txt",      bossIdRemap: DP_REMAP },
  { id: "platinum",    routesFile: "platRoutes.txt",        bossFile: "platLeague.txt",    bossIdRemap: PLAT_REMAP },
  { id: "heartgold",   routesFile: "hgRoutes.txt",          bossFile: "hgssLeague.txt",    bossIdRemap: HGSS_REMAP },
  { id: "soulsilver",  routesFile: "ssRoutes.txt",          bossFile: "hgssLeague.txt",    bossIdRemap: HGSS_REMAP },
];

// ---- Helpers ----

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function titleCase(slug) {
  return slug.split("-").map(capitalize).join(" ");
}

function locationToId(name) {
  return name
    .toLowerCase()
    .replace(/[.''é]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function displayName(slug) {
  const lower = slug.toLowerCase();
  if (DISPLAY_NAMES[lower]) return DISPLAY_NAMES[lower];
  return capitalize(slug);
}

// ---- Parsers ----

function parseRoutesFile(filePath) {
  const text = readFileSync(filePath, "utf8");
  const routes = [];
  const bossLocations = new Map();

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("--")) {
      const parts = trimmed.slice(2).split("|");
      if (parts.length >= 2) {
        bossLocations.set(parts[1], parts[0]);
      }
      continue;
    }

    const pipeIdx = trimmed.indexOf("|");
    let name, speciesStr;
    if (pipeIdx === -1) {
      name = trimmed;
      speciesStr = "";
    } else {
      name = trimmed.slice(0, pipeIdx);
      speciesStr = trimmed.slice(pipeIdx + 1).trim();
    }

    const catchPool = speciesStr
      ? speciesStr.split(",").map((s) => displayName(s.trim())).filter(Boolean)
      : [];

    routes.push({ id: locationToId(name), name, catchPool });
  }

  return { routes, bossLocations };
}

function parseBossFile(filePath, bossIdRemap, bossLocations) {
  const text = readFileSync(filePath, "utf8");
  const bosses = [];
  let currentBoss = null;

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("==")) continue;

    if (trimmed.startsWith("--")) {
      if (currentBoss) bosses.push(currentBoss);

      const parts = trimmed.slice(2).split("|");
      const rawId = parts[0];
      const id = bossIdRemap[rawId] || rawId;
      const name = parts[1] || rawId;
      const location = bossLocations.get(rawId);

      currentBoss = { id, name, team: [] };
      if (location) currentBoss.location = location;
      continue;
    }

    if (!currentBoss) continue;

    const parts = trimmed.split("|");
    const speciesSlug = parts[0];
    const species = displayName(speciesSlug);
    const moves = parts[2]
      ? parts[2].split(",").map((m) => titleCase(m.trim()))
      : [];
    const itemRaw = (parts[4] ?? "").trim();
    const item = itemRaw ? titleCase(itemRaw) : null;
    const types = SPECIES_TYPES[speciesSlug] || [];

    currentBoss.team.push({ species, types, moves, item });
  }

  if (currentBoss) bosses.push(currentBoss);
  return bosses;
}

function buildProgression(filePath, bossIdRemap) {
  const text = readFileSync(filePath, "utf8");
  const segments = [];

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("--")) {
      const parts = trimmed.slice(2).split("|");
      if (parts.length >= 2) {
        const rawId = parts[1];
        const id = bossIdRemap[rawId] || rawId;
        segments.push({ kind: "boss", bossId: id });
      }
      continue;
    }

    const pipeIdx = trimmed.indexOf("|");
    const name = pipeIdx === -1 ? trimmed : trimmed.slice(0, pipeIdx);
    segments.push({ kind: "route", routeId: locationToId(name) });
  }

  return segments;
}

// ---- Writers ----

function writeProgressionTs(outDir, segments) {
  const lines = [
    `import type { ProgressionSegment } from "../../../types/game";`,
    ``,
    `export const progression: ProgressionSegment[] = [`,
  ];

  for (const seg of segments) {
    if (seg.kind === "route") {
      lines.push(`  { kind: "route", routeId: "${seg.routeId}" },`);
    } else {
      lines.push(`  { kind: "boss", bossId: "${seg.bossId}" },`);
    }
  }

  lines.push(`];`, ``);
  writeFileSync(join(outDir, "progression.ts"), lines.join("\n"));
}

// ---- Main ----

for (const game of GAMES) {
  const outDir = join(GAMES_DIR, game.id);
  mkdirSync(outDir, { recursive: true });

  const routesPath = join(XTRADATA, game.routesFile);
  const bossPath = join(XTRADATA, game.bossFile);

  const { routes, bossLocations } = parseRoutesFile(routesPath);
  const bosses = parseBossFile(bossPath, game.bossIdRemap, bossLocations);
  const progression = buildProgression(routesPath, game.bossIdRemap);

  writeFileSync(join(outDir, "routes.json"), JSON.stringify(routes, null, 2) + "\n");
  writeFileSync(join(outDir, "bosses.json"), JSON.stringify(bosses, null, 2) + "\n");
  writeProgressionTs(outDir, progression);

  console.log(`${game.id}: ${routes.length} routes, ${bosses.length} bosses, ${progression.length} progression segments`);
}
