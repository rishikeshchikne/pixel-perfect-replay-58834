import { getArtifact, type Destination } from "@/lib/artifacts";
import type { MapPin } from "@/lib/space";
import { cn } from "@/lib/utils";

/** Flat latitude/longitude fallback, shown only when the device cannot run WebGL. */
export function SchematicMap({
  world,
  pins,
  selectedKey,
  onSelect,
}: {
  world: Destination;
  pins: MapPin[];
  selectedKey: string | null;
  onSelect: (pin: MapPin) => void;
}) {
  // Equirectangular projection: lon -180..180 → 0..100%, lat 90..-90 → 0..100%.
  const pos = (p: MapPin) => ({ left: `${((p.lon + 180) / 360) * 100}%`, top: `${((90 - p.lat) / 180) * 100}%` });

  return (
    <div className="absolute inset-0">
      <div
        className={cn(
          "absolute inset-0",
          world === "Moon"
            ? "bg-[radial-gradient(ellipse_at_40%_45%,var(--color-card),var(--color-background)_75%)]"
            : "bg-[radial-gradient(ellipse_at_55%_50%,color-mix(in_oklab,var(--color-primary)_22%,var(--color-card)),var(--color-background)_80%)]",
        )}
      />
      <svg className="absolute inset-0 h-full w-full text-border" aria-hidden>
        {[...Array(11)].map((_, i) => (
          <line key={`v${i}`} x1={`${(i + 1) * (100 / 12)}%`} x2={`${(i + 1) * (100 / 12)}%`} y1="0" y2="100%" stroke="currentColor" />
        ))}
        {[...Array(5)].map((_, i) => (
          <line key={`h${i}`} y1={`${(i + 1) * (100 / 6)}%`} y2={`${(i + 1) * (100 / 6)}%`} x1="0" x2="100%" stroke="currentColor" />
        ))}
      </svg>
      <span className="eyebrow absolute left-4 top-16 text-muted-foreground">
        {world} · schematic (3D view unavailable on this device)
      </span>
      {pins.map((p) => (
        <button
          key={p.key}
          style={pos(p)}
          onClick={() => onSelect(p)}
          aria-label={`${getArtifact(p.artifactId)?.name} — ${p.note}`}
          className="group absolute -translate-x-1/2 -translate-y-1/2 p-2"
        >
          <span className="absolute inset-2 rounded-full bg-science animate-pulse-ring" />
          <span className={cn("relative block size-3.5 rounded-full border-2 border-background bg-science", selectedKey === p.key && "bg-primary")} />
        </button>
      ))}
    </div>
  );
}
