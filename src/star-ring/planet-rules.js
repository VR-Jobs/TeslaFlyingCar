export const SOLAR_VERSION = "solar-eight-1";
// Polar ratios and obliquities are rounded visual parameters. Apparent sizes
// and travel distances are composed for driving; orbital motion is illustrative.
export const PLANETS = Object.freeze([
  {
    id: "mercury",
    name: "水星",
    atlas: 1,
    polar: 1,
    tilt: 0.03,
    radius: 860,
    rotation: 1.2,
    atmosphere: 0,
    tint: [0.58, 0.59, 0.6],
    rings: 0,
    bump: 0,
  },
  {
    id: "venus",
    name: "金星",
    atlas: 0,
    polar: 1,
    tilt: 177.4,
    radius: 960,
    rotation: 0.6,
    atmosphere: 0.38,
    tint: [0.98, 0.8, 0.51],
    rings: 0,
    bump: 0,
  },
  {
    id: "earth",
    name: "地球",
    atlas: 1,
    polar: 0.9966,
    tilt: 23.4,
    radius: 980,
    rotation: 1.6,
    atmosphere: 0.36,
    tint: [0.25, 0.53, 1],
    rings: 0,
    bump: 0.3,
  },
  {
    id: "mars",
    name: "火星",
    atlas: 1,
    polar: 0.994,
    tilt: 25.2,
    radius: 900,
    rotation: 1.9,
    atmosphere: 0.09,
    tint: [0.91, 0.45, 0.26],
    rings: 0,
    bump: 0.55,
  },
  {
    id: "jupiter",
    name: "木星",
    atlas: 1,
    polar: 0.935,
    tilt: 3.1,
    radius: 1230,
    rotation: 0.65,
    atmosphere: 0.12,
    tint: [0.78, 0.67, 0.53],
    rings: 0.025,
    inner: 1.72,
    outer: 1.82,
    bump: 0,
  },
  {
    id: "saturn",
    name: "土星",
    atlas: 1,
    polar: 0.902,
    tilt: 26.7,
    radius: 1020,
    rotation: 0.5,
    atmosphere: 0.16,
    tint: [0.86, 0.77, 0.57],
    rings: 0.83,
    inner: 1.11,
    outer: 2.32,
    bump: 0,
  },
  {
    id: "uranus",
    name: "天王星",
    atlas: 0,
    polar: 0.977,
    tilt: 97.8,
    radius: 1030,
    rotation: 0.4,
    atmosphere: 0.22,
    tint: [0.55, 0.79, 0.8],
    rings: 0.16,
    inner: 1.62,
    outer: 2.02,
    bump: 0,
  },
  {
    id: "neptune",
    name: "海王星",
    atlas: 0,
    polar: 0.983,
    tilt: 28.3,
    radius: 1030,
    rotation: 1.1,
    atmosphere: 0.22,
    tint: [0.49, 0.7, 0.79],
    rings: 0.06,
    inner: 1.7,
    outer: 2.55,
    bump: 0,
  },
]);
export const PLANET_BY_ID = new Map(PLANETS.map((p) => [p.id, p]));
export const PLANET_PREFERENCE_KEY = "tesla-music.star-ring-planet.v1";
export function planetChoice(storage = typeof localStorage === "undefined" ? null : localStorage) {
  try {
    const v = storage?.getItem(PLANET_PREFERENCE_KEY);
    if (v === "random" || PLANET_BY_ID.has(v)) return v;
  } catch {}
  return "earth";
}
export function savePlanetChoice(
  value,
  storage = typeof localStorage === "undefined" ? null : localStorage,
) {
  if (value !== "random" && !PLANET_BY_ID.has(value)) return false;
  try {
    storage?.setItem(PLANET_PREFERENCE_KEY, value);
  } catch {}
  return true;
}
export function planetForSection(choice, seed = 0, section = 0) {
  let start = PLANETS.findIndex((p) => p.id === choice);
  if (start < 0) start = (seed >>> 0) % PLANETS.length;
  return PLANETS[(start + Math.max(0, Math.floor(section))) % PLANETS.length];
}
