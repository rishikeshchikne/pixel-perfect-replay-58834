// Browser-only canvas texture generators for the artistic parts of the sky
// (Milky Way band, nebulae, distant galaxies, Sun surface, soft glows).
// Call these only from components rendered inside the 3D canvas.
import * as THREE from "three";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gauss = (r: () => number) => (r() + r() + r() + r() - 2) / 2;

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, rgb: string, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function finish(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Equirectangular deep-sky backdrop: faint Milky Way band, dust lanes, nebulae and galaxies. */
export function createSkyTexture(width = 2048, height = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const r = rng(20260410);

  ctx.fillStyle = "#020309";
  ctx.fillRect(0, 0, width, height);

  const bandY = (x: number) => height / 2 + Math.sin((x / width) * Math.PI * 2 + 0.6) * height * 0.3;

  // Milky Way glow
  for (let i = 0; i < 2600; i++) {
    const x = r() * width;
    const y = bandY(x) + gauss(r) * height * 0.07;
    const warm = r() > 0.55;
    blob(ctx, x, y, 14 + r() * 46, warm ? "214,196,170" : "176,192,214", 0.022 + r() * 0.02);
  }
  // Dark dust lanes
  for (let i = 0; i < 700; i++) {
    const x = r() * width;
    const y = bandY(x) + gauss(r) * height * 0.025;
    blob(ctx, x, y, 8 + r() * 26, "2,3,9", 0.18 + r() * 0.18);
  }
  // Nebulae (muted, realistic hues)
  const nebulae: [number, number, string][] = [
    [0.18, 0.32, "170,82,96"],
    [0.62, 0.7, "70,140,160"],
    [0.82, 0.28, "190,120,70"],
    [0.4, 0.58, "120,96,150"],
  ];
  for (const [nx, ny, rgb] of nebulae) {
    const cx = nx * width;
    const cy = ny * height;
    for (let i = 0; i < 90; i++) {
      blob(ctx, cx + gauss(r) * 90, cy + gauss(r) * 50, 16 + r() * 60, rgb, 0.025 + r() * 0.035);
    }
    for (let i = 0; i < 40; i++) blob(ctx, cx + gauss(r) * 70, cy + gauss(r) * 40, 4 + r() * 10, "240,230,220", 0.04);
  }
  // Faint background stars, denser along the band
  for (let i = 0; i < 9000; i++) {
    const x = r() * width;
    const inBand = r() < 0.55;
    const y = inBand ? bandY(x) + gauss(r) * height * 0.09 : r() * height;
    const a = 0.25 + r() * 0.6;
    const tint = r();
    ctx.fillStyle = tint > 0.85 ? `rgba(255,214,170,${a})` : tint > 0.7 ? `rgba(180,206,255,${a})` : `rgba(255,255,255,${a})`;
    const s = r() < 0.04 ? 1.6 : 0.8;
    ctx.fillRect(x, y, s, s);
  }
  // Distant spiral galaxies
  const galaxies: [number, number, number, number][] = [
    [0.08, 0.72, 26, 0.5],
    [0.5, 0.2, 18, 1.9],
    [0.7, 0.86, 14, 2.6],
  ];
  for (const [gx, gy, size, rot] of galaxies) {
    ctx.save();
    ctx.translate(gx * width, gy * height);
    ctx.rotate(rot);
    ctx.scale(1, 0.42);
    blob(ctx, 0, 0, size * 1.6, "200,206,230", 0.18);
    for (let arm = 0; arm < 2; arm++) {
      for (let k = 0; k < 220; k++) {
        const t = (k / 220) * 3.2;
        const rad = size * 0.12 * Math.exp(0.55 * t);
        const ang = t * 1.7 + arm * Math.PI;
        const px = Math.cos(ang) * rad + gauss(r) * 2;
        const py = Math.sin(ang) * rad + gauss(r) * 2;
        ctx.fillStyle = `rgba(214,222,255,${0.12 + r() * 0.2})`;
        ctx.fillRect(px, py, 1.1, 1.1);
      }
    }
    blob(ctx, 0, 0, size * 0.35, "255,240,214", 0.8);
    ctx.restore();
  }
  return finish(canvas);
}

/** Granulated solar surface. */
export function createSunTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const r = rng(1361);
  ctx.fillStyle = "#ffb347";
  ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 2600; i++) {
    const light = r() > 0.5;
    blob(ctx, r() * 512, r() * 256, 3 + r() * 9, light ? "255,236,170" : "214,96,26", 0.35);
  }
  return finish(canvas);
}

/** Soft radial glow used for the Sun's corona and for dust particles. */
export function createGlowTexture(inner = "255,246,220", outer = "255,170,90") {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, `rgba(${inner},1)`);
  g.addColorStop(0.12, `rgba(${inner},0.75)`);
  g.addColorStop(0.3, `rgba(${outer},0.22)`);
  g.addColorStop(0.6, `rgba(${outer},0.05)`);
  g.addColorStop(1, `rgba(${outer},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return finish(canvas);
}

/** Seeded positions for floating cosmic dust around the given centres. */
export function createDustPositions(centres: [number, number, number][], perCentre: number, spread: number, seed = 7) {
  const r = rng(seed);
  const out = new Float32Array(centres.length * perCentre * 3);
  let o = 0;
  for (const c of centres) {
    for (let i = 0; i < perCentre; i++) {
      out[o++] = c[0] + gauss(r) * spread;
      out[o++] = c[1] + gauss(r) * spread * 0.6;
      out[o++] = c[2] + gauss(r) * spread;
    }
  }
  return out;
}
