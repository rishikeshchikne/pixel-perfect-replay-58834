import { describe, expect, it } from "vitest";
import { OFFICIAL_RESOURCES } from "@/lib/resources";

describe("official NASA destinations", () => {
  it("uses the official NASA website", () => {
    expect(OFFICIAL_RESOURCES.find((r) => r.kind === "website")?.url).toBe("https://www.nasa.gov/");
  });
  it("uses the official NASA Mars exploration page", () => {
    expect(OFFICIAL_RESOURCES.find((r) => r.kind === "mars")?.url).toBe("https://science.nasa.gov/mars/");
  });
  it("links directly to NASA's YouTube channel", () => {
    expect(OFFICIAL_RESOURCES.find((r) => r.kind === "youtube")?.url).toBe("https://www.youtube.com/@NASA");
  });
});