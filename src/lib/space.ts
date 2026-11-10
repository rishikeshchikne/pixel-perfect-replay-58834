// Pure maths and curated data for the 3D Ghost Map. No React or three.js imports,
// so it can be unit-tested and shared by the scene and the page.

import type { Destination } from "@/lib/artifacts";

export type Vec3 = [number, number, number];

/** Mean radii in km (NASA planetary fact sheets). Used to keep Moon/Mars/Earth sizes in true proportion. */
export const MEAN_RADIUS_KM = { Moon: 1737.4, Mars: 3389.5, Earth: 6371.0 } as const;

/** Scene units: the Moon's radius is 1. Sizes keep true ratios; distances are compressed. */
export const BODY_RADIUS = {
  Moon: 1,
  Mars: MEAN_RADIUS_KM.Mars / MEAN_RADIUS_KM.Moon,
  Earth: MEAN_RADIUS_KM.Earth / MEAN_RADIUS_KM.Moon,
} as const;

/** Axial tilt (obliquity) in degrees: Moon relative to the ecliptic, Mars relative to its orbit. */
export const AXIAL_TILT_DEG = { Moon: 1.54, Mars: 25.19 } as const;

/** Compressed, not-to-scale scene layout. */
export const BODY_POSITION: Record<Destination | "Earth" | "Sun", Vec3> = {
  Moon: [0, 0, 0],
  Earth: [-26, 5, -46],
  Mars: [150, -10, -110],
  Sun: [-520, 120, 380],
};

/** Default camera distance from a body's centre, in body radii. */
export const VIEW_DISTANCE_RADII = 3.4;
export const MIN_DISTANCE_RADII = 1.35;
export const MAX_DISTANCE_RADII = 9;

/**
 * Converts planetocentric latitude / east longitude (degrees) to a point on a sphere,
 * matching three.js SphereGeometry UVs for an equirectangular map centred on 0° longitude:
 * 0°E faces +X, 90°E faces -Z, the north pole is +Y.
 */
export function latLonToVec3(latDeg: number, lonDeg: number, radius = 1): Vec3 {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const c = Math.cos(lat);
  return [radius * c * Math.cos(lon), radius * Math.sin(lat), -radius * c * Math.sin(lon)];
}

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpVec = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** Quadratic Bezier between a and b through control point c. */
export function bezier(a: Vec3, c: Vec3, b: Vec3, t: number): Vec3 {
  return lerpVec(lerpVec(a, c, t), lerpVec(c, b, t), t);
}

/** Control point for a cinematic arc: the midpoint, lifted above the straight path. */
export function arcControl(a: Vec3, b: Vec3): Vec3 {
  const dist = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const mid = lerpVec(a, b, 0.5);
  return [mid[0], mid[1] + dist * 0.18, mid[2] + dist * 0.12];
}

/** Flight duration in seconds, growing gently with distance and capped. */
export function flightDuration(distance: number, reducedMotion = false): number {
  if (reducedMotion) return 0.01;
  return Math.min(4.2, 1.2 + Math.sqrt(Math.max(distance, 0)) * 0.22);
}

/** Field of view during a flight: widens mid-journey for a sense of speed, then settles. */
export function flightFov(base: number, t: number, widen = 14): number {
  return base + Math.sin(Math.PI * Math.min(Math.max(t, 0), 1)) * widen;
}

export interface TextureCredit {
  body: string;
  dataset: string;
  credit: string;
  url: string;
}

/** Scientific datasets used as planet surfaces (downsampled for the web). */
export const TEXTURE_CREDITS: TextureCredit[] = [
  {
    body: "Moon",
    dataset: "CGI Moon Kit — LRO LROC WAC colour mosaic and LOLA elevation",
    credit: "NASA Scientific Visualization Studio",
    url: "https://svs.gsfc.nasa.gov/4720",
  },
  {
    body: "Mars",
    dataset: "Viking Colorized Global Mosaic (MDIM 2.1)",
    credit: "NASA Ames / USGS Astrogeology Science Center",
    url: "https://astrogeology.usgs.gov/search/map/mars_viking_colorized_global_mosaic_232m",
  },
  {
    body: "Mars",
    dataset: "MGS MOLA global elevation model (surface relief)",
    credit: "NASA / JPL / GSFC · USGS Astrogeology Science Center",
    url: "https://astrogeology.usgs.gov/search/map/mars_mgs_mola_dem_463m",
  },
  {
    body: "Earth",
    dataset: "Blue Marble: Land Surface, Shallow Water, and Shaded Topography",
    credit: "NASA Goddard Space Flight Center / Visible Earth",
    url: "https://visibleearth.nasa.gov/images/57752/blue-marble-land-surface-shallow-water-and-shaded-topography",
  },
];
