#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "src", "data", "games", "emerald");

const GEN3_TYPES = {
  numel: ["Fire", "Ground"],
  poochyena: ["Dark"],
  zubat: ["Poison", "Flying"],
  mightyena: ["Dark"],
  camerupt: ["Fire", "Ground"],
  crobat: ["Poison", "Flying"],
  golbat: ["Poison", "Flying"],
  carvanha: ["Water", "Dark"],
  sharpedo: ["Water", "Dark"],
  ralts: ["Psychic"],
  altaria: ["Dragon", "Flying"],
  delcatty: ["Normal"],
  roselia: ["Grass", "Poison"],
  magneton: ["Electric", "Steel"],
  gardevoir: ["Psychic"],
  torchic: ["Fire"],
  mudkip: ["Water"],
  treecko: ["Grass"],
  lotad: ["Water", "Grass"],
  torkoal: ["Fire"],
  wingull: ["Water", "Flying"],
  lombre: ["Water", "Grass"],
  combusken: ["Fire", "Fighting"],
  slugma: ["Fire"],
  marshtomp: ["Water", "Ground"],
  grovyle: ["Grass"],
  pelipper: ["Water", "Flying"],
  ludicolo: ["Water", "Grass"],
  tropius: ["Grass", "Flying"],
  geodude: ["Rock", "Ground"],
  nosepass: ["Rock"],
  machop: ["Fighting"],
  meditite: ["Fighting", "Psychic"],
  makuhita: ["Fighting"],
  voltorb: ["Electric"],
  electrike: ["Electric"],
  manectric: ["Electric"],
  spinda: ["Normal"],
  vigoroth: ["Normal"],
  linoone: ["Normal"],
  slaking: ["Normal"],
  swablu: ["Normal", "Flying"],
  skarmory: ["Steel", "Flying"],
  claydol: ["Ground", "Psychic"],
  xatu: ["Psychic", "Flying"],
  lunatone: ["Rock", "Psychic"],
  solrock: ["Rock", "Psychic"],
  luvdisc: ["Water"],
  whiscash: ["Water", "Ground"],
  sealeo: ["Ice", "Water"],
  crawdaunt: ["Water", "Dark"],
  kingdra: ["Water", "Dragon"],
  shiftry: ["Grass", "Dark"],
  cacturne: ["Grass", "Dark"],
  absol: ["Dark"],
  dusclops: ["Ghost"],
  banette: ["Ghost"],
  sableye: ["Dark", "Ghost"],
  glalie: ["Ice"],
  walrein: ["Ice", "Water"],
  shelgon: ["Dragon"],
  flygon: ["Ground", "Dragon"],
  salamence: ["Dragon", "Flying"],
  wailord: ["Water"],
  tentacruel: ["Water", "Poison"],
  gyarados: ["Water", "Flying"],
  milotic: ["Water"],
  aggron: ["Steel", "Rock"],
  cradily: ["Rock", "Grass"],
  armaldo: ["Rock", "Bug"],
  metagross: ["Steel", "Psychic"],
};

const BOSS_ID_REMAP = {
  "1": "roxanne",
  "2": "brawly",
  "3": "wattson",
  "4": "flannery",
  "5": "norman",
  "6": "winona",
  "7": "tate-and-liza",
  "8": "juan",
  e1: "sidney",
  e2: "phoebe",
  e3: "glacia",
  e4: "drake",
  c1: "wallace-champion",
  c2: "steven-champion",
};

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function titleCase(slug) {
  return slug
    .split("-")
    .map(capitalize)
    .join(" ");
}

function locationToId(name) {
  return name
    .toLowerCase()
    .replace(/[.''é]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// ---- Parse encounters file → routes ----
const encText = readFileSync(join(dataDir, "emeraldEncounters.txt"), "utf8");
const routes = [];
const bossLocations = new Map();

for (const line of encText.split("\n")) {
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
  if (pipeIdx === -1) continue;

  const name = trimmed.slice(0, pipeIdx);
  const speciesStr = trimmed.slice(pipeIdx + 1).trim();
  const catchPool = speciesStr
    ? speciesStr.split(",").map((s) => capitalize(s.trim())).filter(Boolean)
    : [];

  routes.push({ id: locationToId(name), name, catchPool });
}

// ---- Parse bosses file ----
const bossText = readFileSync(join(dataDir, "emeraldBosses.txt"), "utf8");
const bosses = [];
let currentBoss = null;

for (const line of bossText.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("==")) continue;

  if (trimmed.startsWith("--")) {
    if (currentBoss) bosses.push(currentBoss);

    const parts = trimmed.slice(2).split("|");
    const rawId = parts[0];
    const id = BOSS_ID_REMAP[rawId] || rawId;
    const name = parts[1] || rawId;
    const location = bossLocations.get(rawId);

    currentBoss = { id, name, team: [] };
    if (location) currentBoss.location = location;
    continue;
  }

  if (!currentBoss) continue;

  const parts = trimmed.split("|");
  const speciesSlug = parts[0];
  const species = capitalize(speciesSlug);
  const moves = parts[2]
    ? parts[2].split(",").map((m) => titleCase(m.trim()))
    : [];
  const itemRaw = (parts[4] ?? "").trim();
  const item = itemRaw ? titleCase(itemRaw) : null;
  const types = GEN3_TYPES[speciesSlug] || [];

  currentBoss.team.push({ species, types, moves, item });
}

if (currentBoss) bosses.push(currentBoss);

// ---- Write output ----
writeFileSync(
  join(dataDir, "routes.json"),
  JSON.stringify(routes, null, 2) + "\n",
);
writeFileSync(
  join(dataDir, "bosses.json"),
  JSON.stringify(bosses, null, 2) + "\n",
);

console.log(`Wrote ${routes.length} routes -> routes.json`);
console.log(`Wrote ${bosses.length} bosses -> bosses.json`);
