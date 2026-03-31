import seaglassRoutes from "./games/emerald-seaglass/routes.json";

/** @deprecated Prefer game packs via `getGamePack` and `routes.json`. */
export const ROUTES: string[] = seaglassRoutes.map((r) => r.name);
