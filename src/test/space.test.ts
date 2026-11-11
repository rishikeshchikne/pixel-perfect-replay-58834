import { describe, expect, it } from "vitest";
import { BODY_RADIUS, MEAN_RADIUS_KM, azimuthOf, flightDuration, latLonToVec3, spinToFace } from "@/lib/space";

const close = (a: number[], b: number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 6));

describe("3D Ghost Map maths", () => {
  it("places 0°N 0°E on +X, 90°E on -Z and the north pole on +Y", () => {
    close(latLonToVec3(0, 0), [1, 0, 0]);
    close(latLonToVec3(0, 90), [0, 0, -1]);
    close(latLonToVec3(90, 0), [0, 1, 0]);
  });
  it("keeps Mars about 1.95 Moon radii, using NASA mean radii", () => {
    expect(MEAN_RADIUS_KM.Moon).toBe(1737.4);
    expect(MEAN_RADIUS_KM.Mars).toBe(3389.5);
    expect(BODY_RADIUS.Mars).toBeCloseTo(1.951, 3);
  });
  it("spinToFace turns a landing site toward the camera", () => {
    const view: [number, number, number] = [0, 0, 1];
    const lon = 23.473; // Tranquility Base
    const spin = spinToFace(lon, view);
    expect(azimuthOf([Math.cos(spin + (lon * Math.PI) / 180), 0, -Math.sin(spin + (lon * Math.PI) / 180)])).toBeCloseTo(azimuthOf(view), 6);
  });
  it("caps flights at 4.2 s and skips them with reduced motion", () => {
    expect(flightDuration(1e6)).toBe(4.2);
    expect(flightDuration(200, true)).toBe(0.01);
  });
});
