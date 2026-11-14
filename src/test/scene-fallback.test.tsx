import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SceneErrorBoundary } from "@/components/museum/space/SceneErrorBoundary";

function Broken(): never {
  throw new Error("Could not load moon_color_2k.jpg");
}

describe("Ghost Map 3D fallback", () => {
  it("shows the flat map instead of breaking the page when the 3D scene fails", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <SceneErrorBoundary fallback={<p>schematic map</p>}>
        <Broken />
      </SceneErrorBoundary>,
    );
    expect(screen.getByText("schematic map")).toBeTruthy();
  });
});
